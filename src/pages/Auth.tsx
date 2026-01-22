import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const Auth = ({ isSignup: initialIsSignup }) => {
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConsultant, setIsConsultant] = useState(false);
  const navigate = useNavigate();

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password || !firstName || !lastName || !displayName) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            display_name: displayName,
            role: isConsultant ? 'consultant' : 'user'
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        if (data.session) {
          setSuccess('Sign-up successful! Redirecting...');
          setTimeout(() => navigate(isConsultant ? '/consultant/dashboard' : '/dashboard/home'), 1500);
        } else {
          setSuccess('Sign-up successful! Please check your email to verify your account.');
        }
        // Clear form
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setDisplayName('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        // Fetch profile to check role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        setSuccess('Login successful! Redirecting...');
        if (profile?.role === 'consultant') {
          setTimeout(() => navigate('/consultant/dashboard'), 1000);
        } else {
          setTimeout(() => navigate('/dashboard/home'), 1000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants for card
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Animation variants for content
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sme-blue-900 via-sme-blue-800 to-sme-blue-700 text-white overflow-hidden py-8">
      <div className="container mx-auto px-4 flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <AnimatePresence>
          <motion.div
            className="w-full max-w-xl"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center text-white">
                  {isSignup ? 'Sign Up to Start Your Journey' : 'Log In to Continue'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div variants={contentVariants} initial="hidden" animate="visible">
                  <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
                    {isSignup && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-200">
                            First Name:*
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter First Name"
                            className="p-4 rounded-full bg-white/20 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sme-orange"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-200">
                            Last Name:*
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter Last Name"
                            className="p-4 rounded-full bg-white/20 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sme-orange"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="displayName" className="text-sm font-medium text-gray-200">
                            Display Name:*
                          </Label>
                          <Input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter Display Name"
                            className="p-4 rounded-full bg-white/20 text-white text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-sme-orange"
                            required
                          />
                        </div>

                        {/* Consultant Checkbox */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="consultant"
                            checked={isConsultant}
                            onChange={(e) => setIsConsultant(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-sme-orange focus:ring-sme-orange"
                          />
                          <Label htmlFor="consultant" className="text-sm font-medium text-gray-200 cursor-pointer">
                            Sign up as a Consultant
                          </Label>
                        </div>
                      </>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                        Email Address:*
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email Address"
                        className="p-4 rounded-full bg-white/20 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sme-orange"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                          Password:*
                        </Label>
                        {!isSignup && (
                          <a
                            href="#"
                            className="ml-auto inline-block text-sm text-sme-orange underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        )}
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="******"
                        className="p-4 rounded-full bg-white/20 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sme-orange"
                        required
                      />
                    </div>
                    {error && <p className="text-red-500 text-lg text-center">{error}</p>}
                    {success && <p className="text-green-500 text-lg text-center">{success}</p>}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg disabled:opacity-50"
                      >
                        {loading ? (isSignup ? 'Signing Up...' : 'Logging In...') : (isSignup ? 'Sign Up' : 'Log In')}
                      </Button>
                    </motion.div>
                  </form>
                  <p className="mt-6 text-lg text-center">
                    {isSignup ? 'Already have an account?' : 'Don’t have an account?'}{' '}
                    <motion.button
                      onClick={() => setIsSignup(!isSignup)}
                      className="text-sme-orange hover:underline"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                    >
                      {isSignup ? 'Sign In' : 'Sign Up'}
                    </motion.button>
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Auth;