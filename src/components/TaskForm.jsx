import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function TaskForm({ session }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('tasks').insert([
        {
          title: title.trim(),
          description: description.trim() || null,
          user_id: session.user.id,
        },
      ]);
      
      if (error) throw error;
      
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error adding task:', error.message);
      alert('Error al añadir tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿Qué necesitas hacer?"
            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-400 font-medium"
            required
            disabled={loading}
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full bg-transparent border-none text-slate-300 px-4 py-1 focus:outline-none placeholder-slate-500 text-sm"
            disabled={loading}
          />
        </div>
        <div className="sm:self-start">
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </form>
  );
}
