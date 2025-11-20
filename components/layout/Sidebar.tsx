import React from 'react';
import { useIdeas } from '../../contexts/IdeasContext';
import { 
  HomeIcon, 
  LightBulbIcon, 
  ChartBarIcon, 
  MapIcon, 
  StarIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Sidebar de navigation principale
 * Toujours visible sur desktop, toggle sur mobile
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { ideas } = useIdeas();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon, 
      path: '/',
      badge: null
    },
    { 
      id: 'ideas', 
      label: 'Mes Idées', 
      icon: LightBulbIcon, 
      path: '/ideas',
      badge: ideas?.length || 0
    },
    { 
      id: 'analyses', 
      label: 'Analyses', 
      icon: ChartBarIcon, 
      path: '/analyses',
      badge: ideas?.filter(i => i.analysis).length || 0
    },
    { 
      id: 'roadmaps', 
      label: 'Roadmaps', 
      icon: MapIcon, 
      path: '/roadmaps',
      badge: ideas?.filter(i => i.roadmapSteps).length || 0
    },
    { 
      id: 'priorities', 
      label: 'Priorités', 
      icon: StarIcon, 
      path: '/priorities',
      badge: null
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Cog6ToothIcon, 
      path: '/settings',
      badge: null
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-card border-r border-border
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-brand to-purple-600 bg-clip-text text-transparent">
              AXIOM
            </span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-all duration-200
                      ${
                        active
                          ? 'bg-brand/10 text-brand border border-brand/20'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-brand' : ''}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== null && item.badge > 0 && (
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-semibold
                        ${active ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'}
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            <p className="font-medium">Co-pilote Stratégique</p>
            <p className="mt-1">IA-Powered</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

