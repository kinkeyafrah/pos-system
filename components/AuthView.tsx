import React, { useMemo, useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface AuthViewProps {
  users: UserAccount[];
  isDarkMode: boolean;
  onLogin: (username: string, password: string) => { success: boolean; message?: string };
  onSignup: (payload: { name: string; username: string; role: UserRole; password: string }) => { success: boolean; message?: string };
  onDemoLogin: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ users, isDarkMode, onLogin, onSignup, onDemoLogin }) => {
  const [isSignup, setIsSignup] = useState(users.length === 0);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', username: '', role: 'cashier' as UserRole, password: '' });
  const [message, setMessage] = useState<string | null>(null);

  const isFirstUser = users.length === 0;

  const helperText = useMemo(() => {
    if (isFirstUser) return 'Create the first admin account to unlock the POS.';
    return 'Sign in with your username to access the register.';
  }, [isFirstUser]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const result = onLogin(loginData.username.trim(), loginData.password);
    setMessage(result.message ?? null);
    if (result.success) {
      setLoginData({ username: '', password: '' });
    }
  };

  const handleSignup = (event: React.FormEvent) => {
    event.preventDefault();
    const result = onSignup({
      name: signupData.name.trim(),
      username: signupData.username.trim(),
      role: isFirstUser ? 'admin' : signupData.role,
      password: signupData.password,
    });
    setMessage(result.message ?? null);
    if (result.success) {
      setSignupData({ name: '', username: '', role: 'cashier', password: '' });
      setIsSignup(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`w-full max-w-4xl rounded-[2rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className={`p-8 lg:p-12 ${isDarkMode ? 'bg-slate-900/60' : 'bg-emerald-50'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-3 rounded-2xl">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black">FreshFlow POS</h1>
                <p className="text-sm text-emerald-600 font-semibold">Secure Staff Access</p>
              </div>
            </div>
            <p className="text-base text-slate-500 mb-6">{helperText}</p>
            <div className={`rounded-2xl p-5 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-emerald-100'}`}>
              <h2 className="text-lg font-bold mb-2">Quick Tips</h2>
              <ul className="text-sm text-slate-500 space-y-2">
                <li>• Use unique usernames for each cashier.</li>
                <li>• Managers can add new staff accounts.</li>
                <li>• All sessions stay on this device.</li>
              </ul>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{isSignup ? 'Create Account' : 'Staff Login'}</h2>
              {!isFirstUser && (
                <button
                  type="button"
                  onClick={() => { setIsSignup(!isSignup); setMessage(null); }}
                  className="text-emerald-600 font-semibold hover:text-emerald-500"
                >
                  {isSignup ? 'Back to login' : 'New staff? Sign up'}
                </button>
              )}
            </div>

            {message && (
              <div className={`mb-6 rounded-xl p-4 text-sm font-semibold ${message.includes('success') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {message}
              </div>
            )}

            {isSignup ? (
              <form className="space-y-4" onSubmit={handleSignup}>
                <div>
                  <label className="text-sm font-semibold">Full name</label>
                  <input
                    value={signupData.name}
                    onChange={(event) => setSignupData(prev => ({ ...prev, name: event.target.value }))}
                    className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="e.g., Jamie Carter"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Username</label>
                  <input
                    value={signupData.username}
                    onChange={(event) => setSignupData(prev => ({ ...prev, username: event.target.value }))}
                    className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="cashier.jamie"
                    required
                  />
                </div>
                {!isFirstUser && (
                  <div>
                    <label className="text-sm font-semibold">Role</label>
                    <select
                      value={signupData.role}
                      onChange={(event) => setSignupData(prev => ({ ...prev, role: event.target.value as UserRole }))}
                      className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold">Password</label>
                  <input
                    type="password"
                    value={signupData.password}
                    onChange={(event) => setSignupData(prev => ({ ...prev, password: event.target.value }))}
                    className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="Create a secure password"
                    required
                  />
                </div>
                <button type="submit" className="w-full rounded-xl bg-emerald-600 text-white font-bold py-3 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                  <UserPlus size={18} />
                  {isFirstUser ? 'Create Admin Account' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={onDemoLogin}
                  className="w-full rounded-xl border border-emerald-200 text-emerald-600 font-bold py-3 hover:bg-emerald-50 transition-colors"
                >
                  View Demo Mode
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="text-sm font-semibold">Username</label>
                  <input
                    value={loginData.username}
                    onChange={(event) => setLoginData(prev => ({ ...prev, username: event.target.value }))}
                    className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Password</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(event) => setLoginData(prev => ({ ...prev, password: event.target.value }))}
                    className={`mt-2 w-full rounded-xl border px-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button type="submit" className="w-full rounded-xl bg-emerald-600 text-white font-bold py-3 hover:bg-emerald-500 transition-colors">
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onDemoLogin}
                  className="w-full rounded-xl border border-emerald-200 text-emerald-600 font-bold py-3 hover:bg-emerald-50 transition-colors"
                >
                  View Demo Mode
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
