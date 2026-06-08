import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Failed to sign in');
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-secondary-900">
              NoteHub
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-heading font-bold text-secondary-900">
              Welcome back
            </h1>
            <p className="mt-2 text-secondary-600">
              Sign in to access your notes and connect with the community.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full btn-lg"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-secondary-500">
                  New to NoteHub?
                </span>
              </div>
            </div>

            <Link
              to="/signup"
              className="btn-secondary w-full mt-4 btn-lg"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.pexels.com/photos/1438195/pexels-photo-1438195.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Study materials"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-white">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Share Knowledge, Grow Together
            </h2>
            <p className="text-lg text-primary-100">
              Join thousands of students and professionals sharing notes,
              collaborating on study materials, and learning together.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-primary-100">Notes Shared</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold">5K+</p>
                <p className="text-primary-100">Active Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
