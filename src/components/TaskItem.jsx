import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Circle, Trash2, Loader2, Edit2, Save, X } from 'lucide-react';

export default function TaskItem({ task }) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');

  const toggleCompletion = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling task:', error.message);
      alert('Error al actualizar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) {
      alert('El título no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
        })
        .eq('id', task.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing task:', error.message);
      alert('Error al editar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const deleteTask = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar esta tarea?')) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error.message);
      alert('Error al eliminar la tarea');
      setIsDeleting(false);
    }
  };

  return (
    <div className={`group flex items-start gap-4 p-4 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl transition-all duration-200 hover:bg-slate-800/60 ${isDeleting ? 'opacity-50 scale-95' : ''}`}>
      <button 
        onClick={toggleCompletion}
        disabled={loading || isEditing}
        className={`mt-1 flex-shrink-0 transition-colors ${task.completed ? 'text-emerald-400' : 'text-slate-400 hover:text-indigo-400'}`}
      >
        {loading && !isEditing ? (
          <Loader2 size={24} className="animate-spin" />
        ) : task.completed ? (
          <CheckCircle2 size={24} />
        ) : (
          <Circle size={24} />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
              placeholder="Título de la tarea"
              autoFocus
            />
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-sm"
              placeholder="Descripción (opcional)"
            />
          </div>
        ) : (
          <>
            <h3 className={`text-base font-medium truncate transition-all duration-200 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 line-clamp-2 transition-all duration-200 ${task.completed ? 'text-slate-600 line-through' : 'text-slate-400'}`}>
                {task.description}
              </p>
            )}
          </>
        )}
      </div>

      <div className={`flex flex-shrink-0 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all focus-within:opacity-100 gap-1`}>
        {isEditing ? (
          <>
            <button
              onClick={saveEdit}
              disabled={loading}
              className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
              title="Guardar"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            </button>
            <button
              onClick={cancelEdit}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              title="Cancelar"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading || task.completed}
              className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500"
              title="Editar tarea"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={deleteTask}
              disabled={isDeleting}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Eliminar tarea"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin text-red-400" /> : <Trash2 size={18} />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
