import React from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCode, FiBriefcase, FiFolder, FiActivity } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

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
      case 'project': return <FiFolder className="w-5 h-5 text-indigo-500" />;
      case 'skill': return <FiCode className="w-5 h-5 text-violet-500" />;
      case 'experience': return <FiBriefcase className="w-5 h-5 text-amber-500" />;
      default: return <FiClock className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getLogTag = (action: string) => {
    switch (action) {
      case 'created': return <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10">CREATE</span>;
      case 'updated': return <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/10">PATCH</span>;
      case 'deleted': return <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/10">DELETE</span>;
      default: return null;
    }
  };

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
          <h3 className="text-sm font-black uppercase tracking-widest dark:text-zinc-300 text-zinc-700">Command Log</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           Live
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide divide-y dark:divide-white/5 divide-zinc-100">
        {activities.map((activity, index) => (
          <motion.div 
            key={`${activity.id}-${index}`} 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-8 hover:dark:bg-white/[0.02] hover:bg-zinc-50 transition-all group relative overflow-hidden"
          >
            <div className="flex items-start gap-5 relative z-10">
              <div className="w-12 h-12 rounded-2xl dark:bg-zinc-900 bg-zinc-100 flex items-center justify-center border dark:border-white/5 border-zinc-200 transition-transform duration-500 group-hover:scale-110">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                   {getLogTag(activity.action)}
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight tabular-nums">
                     {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: fr })}
                   </span>
                </div>
                <p className="text-sm font-black dark:text-white text-zinc-900 truncate">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    SRC: {activity.type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/0 to-indigo-600/5 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
