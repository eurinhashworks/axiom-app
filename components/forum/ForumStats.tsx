import React from 'react';
import Card from '../ui/Card';

interface ForumStatsProps {
  totalPosts: number;
  postsWithIdeas: number;
  totalLikes: number;
  recentPosts: number;
}

const ForumStats: React.FC<ForumStatsProps> = ({ 
  totalPosts, 
  postsWithIdeas, 
  totalLikes, 
  recentPosts 
}) => {
  const stats = [
    {
      label: 'Total discussions',
      value: totalPosts,
      icon: '💬',
      color: 'text-blue-600'
    },
    {
      label: 'Avec idées',
      value: postsWithIdeas,
      icon: '💡',
      color: 'text-yellow-600'
    },
    {
      label: 'Total likes',
      value: totalLikes,
      icon: '❤️',
      color: 'text-red-600'
    },
    {
      label: 'Cette semaine',
      value: recentPosts,
      icon: '🆕',
      color: 'text-green-600'
    }
  ];

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Statistiques du forum</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-2xl mb-1 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ForumStats;
