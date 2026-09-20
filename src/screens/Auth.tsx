import { useState } from 'react';
import { TrendingDown, Mail, Lock, User, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/auth';

type Mode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const inputStyle = {
    background: '#F9F8FF',
    border: '1.5px solid #E5E0F8',
    color: '#1A1028',
  };

  const resetMessages = () => {
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error);
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your name.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        const { error, needsEmailConfirmation } = await signUp(email, password, name.trim());
        if (error) {
          setError(error);
        } else if (needsEmailConfirmation) {
          setNotice('Account created! Check your email to confirm your address, then sign in.');
          setMode('login');
        }
      } else {
        const { error } = await resetPassword(email);
        if (error) setError(error);
        else setNotice('If an account exists for that email, a reset link is on its way.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetMessages();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F8F7FF' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#7C3AED' }}>
            <TrendingDown size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>
            MyBelanja
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            {mode === 'login' && 'Welcome back — sign in to your account'}
            {mode === 'signup' && 'Create your account to get started'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          {error && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl mb-4" style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
              <AlertCircle size={16} style={{ color: '#DC2626', marginTop: '1px', flexShrink: 0 }} />
              <p className="text-xs font-medium" style={{ color: '#991B1B' }}>{error}</p>
            </div>
          )}
          {notice && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl mb-4" style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
              <CheckCircle size={16} style={{ color: '#059669', marginTop: '1px', flexShrink: 0 }} />
              <p className="text-xs font-medium" style={{ color: '#065F46' }}>{notice}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    placeholder="Alex Morgan"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>
                    Password
                  </label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs font-medium" style={{ color: '#7C3AED' }}>
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    placeholder="••••••••"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                    style={{ color: '#9CA3AF' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70"
              style={{ background: '#7C3AED', fontFamily: 'Outfit, sans-serif' }}
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {mode === 'login' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Link'}
            </button>
          </form>
        </div>

        <div className="text-center mt-5 text-sm" style={{ color: '#6B7280' }}>
          {mode === 'login' && (
            <>Don't have an account?{' '}
              <button onClick={() => switchMode('signup')} className="font-semibold" style={{ color: '#7C3AED' }}>Sign up</button>
            </>
          )}
          {mode === 'signup' && (
            <>Already have an account?{' '}
              <button onClick={() => switchMode('login')} className="font-semibold" style={{ color: '#7C3AED' }}>Sign in</button>
            </>
          )}
          {mode === 'forgot' && (
            <button onClick={() => switchMode('login')} className="font-semibold" style={{ color: '#7C3AED' }}>Back to sign in</button>
          )}
        </div>
      </div>
    </div>
  );
}