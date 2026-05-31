import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import TaskItem from './TaskItem';
import { Loader2, CheckSquare } from 'lucide-react';

export default function TaskList({ session }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();

    // Configurar suscripción en tiempo real
    const channel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((task) => (task.id === payload.new.id ? payload.new : task))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.user.id]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-800/20 rounded-2xl border border-slate-700/30 border-dashed">
        <CheckSquare size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-slate-300">No tienes tareas pendientes</h3>
        <p className="text-slate-500 mt-1">Añade una nueva tarea arriba para empezar</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {pendingTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      {completedTasks.length > 0 && (
        <div className="pt-6 mt-6 border-t border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
            Completadas ({completedTasks.length})
          </h3>
          <div className="space-y-3 opacity-70">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
