import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { AdminUser } from '../types';

export default function Login({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        throw new Error('No admin account found. Please contact the owner.');
      }
      const userData = userDoc.data() as AdminUser;
      if (!userData.isActive) {
        throw new Error('Your account is deactivated. Contact the owner.');
      }
      onLogin(userData);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Try again later.');
      } else {
        setError(err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full pt-20">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl w-full max-w-sm shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-100">Admin Portal</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Please sign in to proceed</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400"/>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 pl-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 outline-none transition" required disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400"/>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 pl-10 pr-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 outline-none transition" placeholder="••••••••" required disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition focus:outline-none">{showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
            </div>
          </div>
          {error && <p className="text-red-600 text-[11px] font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Signing in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
}
