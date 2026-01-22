import supabase from '../utils/supabase';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, Scale, UserCheck, X, Mail, User, Phone, Lock } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isConsultant, setIsConsultant] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard/home`,
          queryParams: {
            // Suggest prompting for consent to ensure we get a refresh token if needed, or forcing account selection
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !fullname || !phoneNumber) {
      toast.error('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullname,
            phone_number: phoneNumber,
            role: isConsultant ? 'consultant' : 'user',
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email for a verification link.');
        navigate("/auth/login");
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden py-10">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sme-orange/10 via-zinc-950 to-zinc-950 z-0 pointer-events-none"></div>

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

      <div className="w-full max-w-lg space-y-8 relative z-10">

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="text-gray-400 mt-2">Join SME Lab to launch your business</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">

            {/* Google Signup */}
            <Button
              type="button"
              onClick={handleGoogleSignup}
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
              <span>Sign up with Google</span>
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-gray-500">Or register with email</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Fullname */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-sme-orange transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Full Name"
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sme-orange focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Phone */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-sme-orange transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone Number"
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sme-orange focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-sme-orange transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sme-orange focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-sme-orange transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Password"
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sme-orange focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="flex items-center bg-white/5 p-3 rounded-xl border border-white/10">
              <input
                id="consultant-role"
                type="checkbox"
                checked={isConsultant}
                onChange={(e) => setIsConsultant(e.target.checked)}
                className="h-5 w-5 text-sme-orange focus:ring-sme-orange border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="consultant-role" className="ml-3 block text-sm text-gray-300 font-medium">
                Sign up as a Consultant
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:scale-[1.02]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Privacy & Terms */}
            <p className="text-center text-xs text-gray-500">
              By signing up, you agree to our{" "}
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="text-gray-300 hover:text-white underline transition-colors"
              >
                Terms & Privacy Policy
              </button>
            </p>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <a
                onClick={() => navigate('/auth/login')}
                className="text-sme-orange hover:text-orange-400 cursor-pointer font-medium transition-colors"
              >
                Log in
              </a>
            </p>
          </form>
        </div>

        {/* Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
              {/* Close Button */}
              <button
                onClick={() => setShowPrivacy(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-4">Privacy & Terms</h3>
              <div className="text-sm text-gray-300 space-y-4 max-h-80 overflow-y-auto pr-2">
                <p>
                  Welcome to SME Lab. By signing up, you agree to our Terms and Conditions.
                  We value your privacy and are committed to protecting your personal data.
                </p>
                <div className='flex items-start gap-3'>
                  <LockKeyhole className="h-5 w-5 text-sme-orange shrink-0" />
                  <span>We never share your information with third parties without your explicit consent.</span>
                </div>
                <div className='flex items-start gap-3'>
                  <UserCheck className="h-5 w-5 text-sme-orange shrink-0" />
                  <span>Your email, full name, and phone number are used strictly for authentication and communication purposes.</span>
                </div>
                <div className='flex items-start gap-3'>
                  <Scale className="h-5 w-5 text-sme-orange shrink-0" />
                  <span>Please read our full Privacy Policy to understand your rights regarding your data.</span>
                </div>
                <p className="font-semibold text-center pt-4 text-gray-400">
                  If you have any questions, contact info.02innovationslab@gmail.com.
                </p>
              </div>

              <div className="mt-6 text-right">
                <Button
                  onClick={() => setShowPrivacy(false)}
                  className="bg-white text-zinc-900 hover:bg-gray-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
