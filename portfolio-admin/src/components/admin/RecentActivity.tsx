import React from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCode, FiBriefcase, FiFolder } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'project' | 'skill' | 'experience';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  date: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <FiFolder className="w-4 h-4" />;
      case 'skill': return <FiCode className="w-4 h-4" />;
      case 'experience': return <FiBriefcase className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'updated': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'deleted': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-background-card border border-border-subtle rounded-xl p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <FiClock className="w-6 h-6 text-zinc-500" />
        </div>
        <p className="text-zinc-400 font-medium">Aucune activité récente</p>
        <p className="text-zinc-500 text-xs mt-1 italic">Les modifications s'afficheront ici</p>
      </div>
    );
  }

  return (
    <div className="bg-background-card border border-border-subtle rounded-xl overflow-hidden hover:border-border-strong transition-all duration-300">
      <div className="p-6 border-b border-border-subtle flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Activité Récente
        </h3>
        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
          Live
        </span>
      </div>
      <div className="divide-y divide-border-subtle">
        {activities.map((activity, index) => (
          <div key={`${activity.id}-${index}`} className="p-4 hover:bg-white/[0.02] transition-colors group">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg border transition-transform duration-300 group-hover:scale-110 ${getActionColor(activity.action)}`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">
                    {activity.type === 'project' ? 'Projet' : activity.type === 'skill' ? 'Compétence' : 'Expérience'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">
                    {activity.action === 'created' ? 'Ajouté' : activity.action === 'updated' ? 'Modifié' : 'Supprimé'}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 font-medium tabular-nums group-hover:text-zinc-400 transition-colors bg-white/5 px-2 py-1 rounded-md">
                {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: fr })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
