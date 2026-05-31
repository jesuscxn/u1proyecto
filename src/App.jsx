import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { LogOut, CheckSquare } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        <header className="flex justify-between items-center mb-10 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-xl shadow-lg">
              <CheckSquare size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              Gestor de Tareas
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline-block">
              {session.user.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main>
          <TaskForm session={session} />
          <TaskList session={session} />
        </main>
      </div>
    </div>
  );
}

export default App;
