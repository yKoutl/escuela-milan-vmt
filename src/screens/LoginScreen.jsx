import React, { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
// Solo importamos lo necesario para Email/Password
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../firebase';
import { LOGO_URL } from '../utils/constants';
import RippleBackground from '../components/shared/RippleBackground';

export default function LoginScreen({ setView }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setView('admin-dashboard');
    } catch (err) {
      console.error("Error de login:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo animado */}
      <RippleBackground />
      
      {/* Contenedor del formulario */}
      <div className="bg-white/95 backdrop-blur-sm dark:bg-zinc-900/95 p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-white/50 dark:border-zinc-800/50 relative z-10">
        <button 
          onClick={() => setView('landing')} 
          className="flex items-center gap-2 text-zinc-600 hover:text-red-600 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Volver al sitio</span>
        </button>
        
        <div className="text-center mb-6">
          <img src={LOGO_URL} alt="Milan Logo" className="h-16 w-16 mx-auto mb-3 object-contain" />
          <Lock className="text-red-600 h-10 w-10 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Acceso Administrativo</h2>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="w-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 rounded-lg text-zinc-900 dark:text-white focus:border-red-600 dark:focus:border-red-600 outline-none transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo Electrónico"
            autoComplete="username"
            required
          />
          <input
            type="password"
            className="w-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 rounded-lg text-zinc-900 dark:text-white focus:border-red-600 dark:focus:border-red-600 outline-none transition"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Contraseña"
            autoComplete="current-password"
            required
          />
          {error && <p className="text-red-600 text-xs text-center font-bold">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
          >
            {loading ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}