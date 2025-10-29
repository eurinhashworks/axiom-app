/**
 * Service de cache avancé pour optimiser les performances
 * Utilise IndexedDB pour un cache persistant côté client
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  key: string;
}

export class AdvancedCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 heures par défaut
  private indexedDB: IDBDatabase | null = null;
  private dbName = 'axiom-cache';
  private dbVersion = 1;
  private isInitialized = false;

  constructor() {
    this.initIndexedDB();
    this.startCleanupInterval();
  }

  /**
   * Initialise IndexedDB pour le cache persistant
   */
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported, using in-memory cache only');
        this.isInitialized = true;
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.warn('Failed to open IndexedDB, using in-memory cache only');
        this.isInitialized = true;
        resolve();
      };

      request.onsuccess = () => {
        this.indexedDB = request.result;
        this.isInitialized = true;
        this.loadCacheFromIndexedDB();
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Charge le cache depuis IndexedDB au démarrage
   */
  private async loadCacheFromIndexedDB(): Promise<void> {
    if (!this.indexedDB) return;

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result;
        entries.forEach((entry: CacheEntry<any>) => {
          if (this.isValid(entry)) {
            this.cache.set(entry.key, entry);
          }
        });
        resolve();
      };

      request.onerror = () => {
        console.warn('Failed to load cache from IndexedDB');
        resolve();
      };
    });
  }

  /**
   * Sauvegarde une entrée dans IndexedDB
   */
  private async saveToIndexedDB<T>(entry: CacheEntry<T>): Promise<void> {
    if (!this.indexedDB) return;

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.warn('Failed to save to IndexedDB');
        resolve();
      };
    });
  }

  /**
   * Vérifie si une entrée de cache est valide (non expirée)
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() < entry.expiry;
  }

  /**
   * Génère une clé de cache à partir d'un objet
   */
  private generateKey(key: string | object): string {
    if (typeof key === 'string') return key;
    return JSON.stringify(key);
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string | object): Promise<T | null> {
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set<T>(key: string | object, data: T, ttl?: number): Promise<void> {
    const cacheKey = this.generateKey(key);
    const now = Date.now();
    const expiry = now + (ttl || this.DEFAULT_TTL);

    const entry: CacheEntry<T> = {
      key: cacheKey,
      data,
      timestamp: now,
      expiry,
    };

    this.cache.set(cacheKey, entry);
    await this.saveToIndexedDB(entry);
  }

  /**
   * Récupère ou calcule une valeur (pattern cache-aside)
   */
  async getOrSet<T>(
    key: string | object,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Invalide une clé du cache
   */
  async invalidate(key: string | object): Promise<void> {
    const cacheKey = this.generateKey(key);
    this.cache.delete(cacheKey);

    if (this.indexedDB) {
      const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      store.delete(cacheKey);
    }
  }

  /**
   * Invalide toutes les clés correspondant à un préfixe
   */
  async invalidateByPrefix(prefix: string): Promise<void> {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });

    for (const key of keysToDelete) {
      await this.invalidate(key);
    }
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (!this.isValid(entry)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });

    // Nettoyer IndexedDB aussi
    if (this.indexedDB && keysToDelete.length > 0) {
      const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      keysToDelete.forEach(key => store.delete(key));
    }
  }

  /**
   * Démarre l'intervalle de nettoyage automatique
   */
  private startCleanupInterval(): void {
    // Nettoyer toutes les heures
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Obtient des statistiques sur le cache
   */
  getStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length,
    };
  }

  /**
   * Vide complètement le cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    
    if (this.indexedDB) {
      const transaction = this.indexedDB.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      store.clear();
    }
  }
}

export const cacheService = new AdvancedCacheService();

// Clés de cache prédéfinies
export const CacheKeys = {
  ideas: (userId: string) => `ideas:${userId}`,
  idea: (ideaId: string) => `idea:${ideaId}`,
  analysis: (ideaId: string) => `analysis:${ideaId}`,
  evaluation: (ideaId: string) => `evaluation:${ideaId}`,
  marketAnalysis: (ideaId: string) => `market:${ideaId}`,
  publicIdeas: 'public:ideas',
  userProfile: (userId: string) => `profile:${userId}`,
} as const;

