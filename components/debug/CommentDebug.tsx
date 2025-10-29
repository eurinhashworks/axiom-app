import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { firebaseService } from '../../services/firebaseService';
import Button from '../ui/Button';
import Card from '../ui/Card';

const CommentDebug: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [testComment, setTestComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [testIdeaId, setTestIdeaId] = useState<string>('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[CommentDebug] ${message}`);
  };

  const clearLogs = () => setLogs([]);

  const testCommentCreation = async () => {
    if (!user) {
      addLog('❌ Aucun utilisateur connecté');
      showToast('Vous devez être connecté', 'error');
      return;
    }

    if (!testComment.trim()) {
      addLog('❌ Commentaire vide');
      showToast('Veuillez entrer un commentaire', 'error');
      return;
    }

    setIsSubmitting(true);
    addLog('🚀 Début du test de création de commentaire');
    addLog(`👤 Utilisateur: ${user.displayName} (${user.uid})`);
    addLog(`💬 Commentaire: "${testComment}"`);

    try {
      // Test 1: Vérifier la connexion Firebase
      addLog('🔍 Test 1: Vérification de la connexion Firebase...');
      
      // Test 2: Récupérer une idée existante pour tester
      addLog('🔍 Test 2: Récupération d\'une idée existante...');
      const ideas = await firebaseService.getIdeas(user.uid, 1);
      const testIdeaId = ideas.length > 0 ? ideas[0].id : 'test-idea-debug';
      setTestIdeaId(testIdeaId);
      addLog(`🔍 ID d'idée utilisé: ${testIdeaId}`);
      
      // Test 3: Créer un commentaire de test
      addLog('🔍 Test 3: Création du commentaire...');
      const commentId = await firebaseService.addComment(
        testIdeaId,
        user.uid,
        user.displayName || 'Test User',
        user.photoURL,
        testComment.trim()
      );
      
      addLog(`✅ Commentaire créé avec succès! ID: ${commentId}`);
      addLog(`✅ L'idée ${testIdeaId} devrait maintenant afficher ce commentaire`);
      showToast('Commentaire de test créé avec succès!', 'success');
      setTestComment('');
      
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`);
      addLog(`❌ Code d'erreur: ${error.code || 'N/A'}`);
      addLog(`❌ Détails: ${JSON.stringify(error, null, 2)}`);
      showToast(`Erreur: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const testFirebaseConnection = async () => {
    addLog('🔍 Test de connexion Firebase...');
    try {
      if (!user) {
        addLog('❌ Aucun utilisateur connecté pour tester getIdeas');
        return;
      }
      // Test simple de lecture
      const ideas = await firebaseService.getIdeas(user.uid);
      addLog(`✅ Connexion Firebase OK - ${ideas.length} idées trouvées`);
    } catch (error: any) {
      addLog(`❌ Erreur de connexion Firebase: ${error.message}`);
    }
  };

  const testCommentsDisplay = async () => {
    if (!testIdeaId) {
      addLog('❌ Aucune idée de test disponible. Créez d\'abord un commentaire de test.');
      return;
    }

    addLog(`🔍 Test d'affichage des commentaires pour l'idée: ${testIdeaId}`);
    try {
      // Test de récupération directe
      const comments = await firebaseService.getComments(testIdeaId);
      addLog(`✅ ${comments.length} commentaire(s) trouvé(s)`);
      comments.forEach((comment, index) => {
        addLog(`  ${index + 1}. "${comment.content}" par ${comment.userName}`);
      });

      // Test de subscription
      addLog('🔍 Test de subscription en temps réel...');
      const unsubscribe = firebaseService.subscribeToComments(testIdeaId, (commentsList) => {
        addLog(`✅ Subscription active - ${commentsList.length} commentaire(s) reçu(s)`);
      });

      // Attendre 2 secondes puis se désabonner
      setTimeout(() => {
        unsubscribe();
        addLog('✅ Subscription testée et arrêtée');
      }, 2000);

    } catch (error: any) {
      addLog(`❌ Erreur lors du test d'affichage: ${error.message}`);
      addLog(`❌ Code d'erreur: ${error.code || 'N/A'}`);
    }
  };

  return (
    <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 mb-4">
      <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-3">
        🔧 Debug des Commentaires
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
            Commentaire de test:
          </label>
          <textarea
            value={testComment}
            onChange={(e) => setTestComment(e.target.value)}
            placeholder="Entrez un commentaire de test..."
            className="w-full p-2 border border-yellow-300 dark:border-yellow-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            rows={3}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={testCommentCreation}
            disabled={!user || isSubmitting || !testComment.trim()}
            isLoading={isSubmitting}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isSubmitting ? 'Test en cours...' : 'Tester la création'}
          </Button>
          
          <Button
            onClick={testFirebaseConnection}
            variant="secondary"
            className="border-yellow-300 text-yellow-700"
          >
            Tester Firebase
          </Button>
          
          <Button
            onClick={testCommentsDisplay}
            variant="secondary"
            disabled={!testIdeaId}
            className="border-blue-300 text-blue-700"
          >
            Tester Affichage
          </Button>
          
          <Button
            onClick={clearLogs}
            variant="secondary"
            className="border-gray-300 text-gray-700"
          >
            Effacer les logs
          </Button>
        </div>

        {logs.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
              Logs de debug:
            </h4>
            <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-yellow-600 dark:text-yellow-400">
          <p><strong>État actuel:</strong></p>
          <p>• Utilisateur: {user ? `${user.displayName} (${user.uid})` : 'Non connecté'}</p>
          <p>• Photo: {user?.photoURL ? 'Oui' : 'Non'}</p>
          {testIdeaId && (
            <p>• ID d'idée de test: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">{testIdeaId}</code></p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommentDebug;
