import supabase from '../utils/supabase';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard/home` // Or consultant dashboard check handling on callback
        }
      });

      if (error) throw error;
      // Supabase handles the redirect automatically
    } catch (error: any) {
      toast.error(error.message || 'Failed to login with Google');
    } finally {
      setGoogleLoading(false);
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error('Please fill in both email and password.');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      const user = authData.user;

      if (user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError.message);
          toast.warning("Logged in, but profile not found.");
        } else {
          // Optionally store profile
          localStorage.setItem("profile", JSON.stringify(profile));

          toast.success('Login successful!');

          if (profile.role === 'consultant') {
            navigate("/consultant/dashboard");
          } else {
            navigate("/dashboard/home");
          }
        }
      } else {
        navigate("/dashboard/home");
      }

    } catch (err) {
      toast.error('Something went wrong. Try Again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sme-blue-900/20 via-zinc-950 to-zinc-950 z-0 pointer-events-none"></div>

      <ToastContainer position="top-center" autoClose={3000} theme="dark" />

      {/* Back Button */}
      <Button
        onClick={() => navigate('/')}
        variant="ghost"
        className="absolute top-6 left-6 z-20 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Home
      </Button>

      <div className="w-full max-w-md space-y-8 relative z-10">

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-gray-400 mt-2">Log in to continue your journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Google Login */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              variant="outline"
              className="w-full h-12 border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" style={{ color: '#4285F4' }} />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" style={{ color: '#34A853' }} />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" style={{ color: '#FBBC05' }} />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" style={{ color: '#EA4335' }} />
                </svg>
              )}
              <span>Continue with Google</span>
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-sme-orange transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sme-orange focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-sme-orange transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sme-orange focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:scale-[1.02]"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <a
                onClick={() => navigate('/auth/signup')}
                className="text-sme-orange hover:text-orange-400 cursor-pointer font-medium transition-colors"
              >
                Sign up for free
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
