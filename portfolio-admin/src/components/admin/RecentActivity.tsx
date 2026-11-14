import React from 'react';
import { FiClock, FiCode, FiBriefcase, FiFolder, FiActivity, FiMail, FiGlobe } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

export interface RecentActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string | Date;
}

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

interface ActivityStyle {
  icon: any;
  badge: string;
  badgeClass: string;
  iconClass: string;
}

const getActivityStyle = (type: string): ActivityStyle => {
  const t = type.toLowerCase();
  if (t.includes('projet')) {
    return { icon: FiFolder, badge: 'Projet', badgeClass: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', iconClass: 'text-indigo-500' };
  }
  if (t.includes('compétence') || t.includes('skill') || t.includes('expertise')) {
    return { icon: FiCode, badge: 'Compétence', badgeClass: 'bg-violet-500/10 text-violet-500 border-violet-500/20', iconClass: 'text-violet-500' };
  }
  if (t.includes('expérience') || t.includes('experience') || t.includes('parcours')) {
    return { icon: FiBriefcase, badge: 'Expérience', badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20', iconClass: 'text-amber-500' };
  }
  if (t.includes('message')) {
    return { icon: FiMail, badge: 'Message', badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20', iconClass: 'text-rose-500' };
  }
  if (t.includes('visite')) {
    return { icon: FiGlobe, badge: 'Visite', badgeClass: 'bg-sky-500/10 text-sky-500 border-sky-500/20', iconClass: 'text-sky-500' };
  }
  return { icon: FiClock, badge: type || 'Activité', badgeClass: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20', iconClass: 'text-zinc-500' };
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="dark:bg-zinc-900/40 bg-zinc-50 rounded-[2.5rem] dark:border-white/5 border-zinc-200 border p-12 text-center h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-3xl dark:bg-zinc-800/50 bg-white shadow-xl flex items-center justify-center">
          <FiClock className="w-8 h-8 text-zinc-600" />
        </div>
        <div>
          <p className="text-sm font-black dark:text-white text-zinc-900 uppercase tracking-widest">No Recent Logs</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">System is idling...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-zinc-900/40 bg-white backdrop-blur-xl rounded-[2.5rem] dark:border-white/5 border-zinc-200 border h-full flex flex-col overflow-hidden">
      <div className="p-10 border-b dark:border-white/5 border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <FiActivity className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest dark:text-zinc-300 text-zinc-700">Activité Récente</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           Live
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide divide-y dark:divide-white/5 divide-zinc-100">
        {activities.map((activity, index) => {
          const { icon: Icon, badge, badgeClass, iconClass } = getActivityStyle(activity.type);
          return (
            <motion.div
              key={activity.id || index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-8 hover:dark:bg-white/[0.02] hover:bg-zinc-50 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl dark:bg-zinc-900 bg-zinc-100 flex items-center justify-center border dark:border-white/5 border-zinc-200 transition-transform duration-500 group-hover:scale-110">
                  <Icon className={`w-5 h-5 ${iconClass}`} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${badgeClass}`}>
                      {badge}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight tabular-nums">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm font-black dark:text-white text-zinc-900 truncate">
                    {activity.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
