
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  Zap,
  LayoutDashboard,
  Building2,
  Compass,
  Fingerprint,
  Award,
  Cpu,
  Megaphone,
  MessageSquare
} from "lucide-react";


import { toast } from "sonner";
import Loader from "./Loader";
import { updateProfileBusinessType } from "@/api/mutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { initializeChecklist } from "@/api/mutations";
import supabase from "@/utils/supabase";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Home = () => {
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch User Session
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = sessionData?.user;

  // 2. Fetch Profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // 3. Fetch Businesses
  const { data: businesses, isLoading: businessesLoading } = useQuery({
    queryKey: ['businesses', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // 4. Fetch Checklist (Scoped to Active Business)
  const business = businesses?.[0] || null;

  const { data: checklist, isLoading: checklistLoading } = useQuery({
    queryKey: ['checklist', user?.id, business?.id],
    enabled: !!user && !!business,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_checklist")
        .select("*")
        .eq("user_id", user!.id)
        .eq("business_id", business!.id)
        .order("id", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // 5. Auto-initialize Checklist if missing
  useEffect(() => {
    if (user && business && checklist !== undefined && checklist.length === 0 && profile) {
      const type = profile.business_type || 'new';
      initializeChecklist(user.id, type, business.id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['checklist'] });
          toast.success("Journey initialized for " + business.name);
        })
        .catch(err => console.error("Failed to init checklist", err));
    }
  }, [user, business, checklist, profile, queryClient]);

  // 6. Fetch Assets
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("type, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Realtime Subscriptions
  useEffect(() => {
    if (!user) return;

    const businessChannel = supabase
      .channel('home-business-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'businesses',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Home: Business update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['businesses'] });
          if (payload.new.registration_status === 'registered') {
            toast.success("Your business is now verified!");
          }
        }
      )
      .subscribe();

    const checklistChannel = supabase
      .channel('home-checklist-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'onboarding_checklist',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['checklist'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(businessChannel);
      supabase.removeChannel(checklistChannel);
    };
  }, [user, queryClient]);

  const loading = sessionLoading || profileLoading || businessesLoading || checklistLoading || assetsLoading;

  const handleChoice = async (choice: "new" | "old") => {
    if (!user) return;

    try {
      await updateProfileBusinessType({ userId: user.id, choice });
      toast.success("Profile updated!");
      setShowBusinessModal(false);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['checklist'] });

      if (choice === "new") {
        navigate("/dashboard/onboarding");
      } else if (choice === "old") {
        navigate("/dashboard/existing-business");
      }
    } catch (error: any) {
      console.error("Error saving choice:", error);
      toast.error("Failed to save choice: " + error.message);
    }
  };

  useEffect(() => {
    if (loading) return;

    // Show modal if profile loaded but no business type
    if (profile && !profile.business_type) {
      setShowBusinessModal(true);
    }
  }, [profile, loading]);

  if (loading) {
    return <Loader />;
  }

  // Helper to check specific step status
  const isStepCompleted = (stepKey: string) => {
    return checklist?.find((c: any) => c.step_key === stepKey)?.status === 'completed';
  };

  const isRegistered = business?.registration_status === 'registered';

  // Journey Stages Logic
  let journeyStages = [];

  if (profile?.business_type === 'old') {
    // Existing Business Journey
    journeyStages = [
      { id: 1, label: "Verification", completed: isStepCompleted('verification') },
      { id: 2, label: "Compliance", completed: isStepCompleted('compliance') },
      { id: 3, label: "Digital", completed: isStepCompleted('digital') },
      { id: 4, label: "Growth", completed: isStepCompleted('growth') },
    ];
  } else {
    // New Business Journey (Default)
    journeyStages = [
      { id: 1, label: "Idea", completed: true },
      { id: 2, label: "Registration", completed: isRegistered || isStepCompleted('registration') },
      { id: 3, label: "Branding", completed: isStepCompleted('branding') },
      { id: 4, label: "Compliance", completed: isStepCompleted('compliance') },
    ];
  }

  // Calculate Checklist Progress
  let checklistProgress = 0;
  let nextStep = null;

  if (journeyStages.length > 0) {
    const completedStages = journeyStages.filter(s => s.completed).length;
    checklistProgress = Math.round((completedStages / journeyStages.length) * 100);

    // Ensure at least some progress if we have a business
    if (business && checklistProgress === 0) checklistProgress = 10;
  }

  if (checklist && checklist.length > 0) {
    nextStep = checklist.find((c: any) => c.status !== 'completed');
  }

  // Recent Activities
  const recentActivities = assets?.map((a: any) => ({
    title: `Created new ${a.type}`,
    date: new Date(a.created_at).toLocaleDateString(),
    icon: Award
  })) || [];



  const quickStats = [
    {
      title: "Business Status",
      value: business?.stage || "Idea Stage",
      icon: Building2,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Onboarding",
      value: `${checklistProgress}% completed`,
      icon: Compass,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Compliance",
      value: business?.registration_status === 'registered' ? "Verified" : "Pending",
      icon: Fingerprint,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
  ];

  const quickActions = [
    {
      title: "Business Registration",
      desc: "Fast-track CAC approval",
      icon: Award,
      path: "/dashboard/cac",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      title: "AI Tools",
      desc: "Generate logos & branding",
      icon: Cpu,
      path: "/dashboard/ai-tools",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Marketing Hub",
      desc: "Create premium flyers & ads",
      icon: Megaphone,
      path: "/dashboard/marketing",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      borderColor: "border-pink-500/20"
    },
    {
      title: "Consult Expert",
      desc: "1-on-1 strategy session",
      icon: MessageSquare,
      path: "/dashboard/consulting",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
  ];


  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header Section with Dark Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-zinc-800/50 backdrop-blur-md text-xs font-medium border border-zinc-700 text-zinc-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{profile?.first_name || "Entrepreneur"}</span>! 👋
            </h1>
            <p className="text-zinc-400 max-w-xl text-base md:text-lg">
              Your business <span className="text-zinc-200 font-semibold">{business?.name || "Journey"}</span> is moving forward. Let's make progress today.
            </p>
          </motion.div>

          <Button
            onClick={() => navigate(nextStep?.action_url || "/dashboard/onboarding")}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 px-8 py-6 text-lg rounded-xl transition-all hover:scale-105 border border-blue-500/50"
          >
            <Zap className="mr-2 h-5 w-5 fill-current" /> Continue Journey
          </Button>
        </div>
      </div>

      {/* Journey Progress Stepper */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-zinc-800">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
            Your Business Journey
          </h2>

          <span className="text-sm font-medium text-zinc-400">{checklistProgress}% Completed</span>
        </div>

        <div className="relative flex items-center justify-between px-2 md:px-12">
          {/* Progress Bar Background */}
          <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-zinc-800 rounded-full -z-10"></div>

          {/* Active Progress Bar */}
          <div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-blue-500 rounded-full -z-10 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            style={{ width: `${checklistProgress}%` }}
          ></div>

          {journeyStages.map((stage, index) => (
            <motion.div
              key={stage.id}
              className="flex flex-col items-center gap-2 relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={cn(
                  "h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center border-2 md:border-4 transition-all duration-500 z-10",
                  stage.completed
                    ? "bg-zinc-950 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    : index === 0 || journeyStages[index - 1].completed // Current step logic
                      ? "bg-zinc-950 border-zinc-700 text-zinc-200 animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      : "bg-zinc-950 border-zinc-800 text-zinc-600"
                )}
              >
                {stage.completed ? <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" /> : <Circle className="h-5 w-5 md:h-6 md:w-6" />}
              </div>
              <span className={cn(
                "hidden md:block text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-colors duration-300",
                stage.completed || index === 0 || journeyStages[index - 1].completed ? "text-zinc-200" : "text-zinc-600"
              )}>
                {stage.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next Step & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Next Step & Actions */}
        <div className="lg:col-span-2 space-y-8">

          {/* Next Step Card */}
          {checklistProgress < 100 && (
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl group hover:border-zinc-700 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full -mr-16 -mt-16 z-0 pointer-events-none"></div>

              <div className="relative z-10 p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                        Up Next
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {nextStep ? nextStep.title : "All Steps Completed! 🎉"}
                    </h2>
                    <p className="text-zinc-400 max-w-lg">
                      {nextStep ? nextStep.description : "You have successfully completed all onboarding steps."}
                    </p>
                  </div>

                  {nextStep && (
                    <Button
                      onClick={() => navigate(nextStep.action_url)}
                      className="bg-zinc-100 text-zinc-900 hover:bg-white px-8 py-6 rounded-xl shadow-lg transition-all hover:scale-105 font-bold"
                    >
                      Start Task <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                <LayoutDashboard className="w-5 h-5 text-zinc-400" />
              </div>
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "group cursor-pointer rounded-2xl p-6 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 shadow-sm transition-all duration-300"
                  )}
                  onClick={() => navigate(action.path)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110 border", action.bg, action.color, action.borderColor)}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-zinc-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-zinc-100 text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">{action.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Activity */}
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="space-y-4">
            {quickStats.map((stat, index) => (
              <Card key={index} className={cn("border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-colors")}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500 mb-1">{stat.title}</p>
                    <h3 className="text-xl font-bold text-white">{stat.value}</h3>
                  </div>
                  <div className={cn("p-3 rounded-xl border", stat.bg, stat.color, stat.border)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {recentActivities.length > 0 ? (
                <div className="relative border-l border-zinc-800 ml-3 space-y-8 py-2">
                  {recentActivities.map((activity: any, index: number) => (
                    <div key={index} className="relative pl-6">
                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-zinc-600"></div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{activity.title}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" /> {activity.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-600">
                  <p className="text-sm">No recent activity.</p>
                  <Button variant="link" size="sm" onClick={() => navigate('/dashboard/onboarding')} className="text-blue-400">Get Started</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Type Selection Modal */}
      <Dialog open={showBusinessModal} onOpenChange={setShowBusinessModal}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Welcome to SME LAB! 🚀</DialogTitle>
            <DialogDescription className="text-zinc-400">
              To customize your experience, tell us about your business stage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div
              className="cursor-pointer border border-dashed border-zinc-700 rounded-2xl p-6 hover:border-orange-500 hover:bg-orange-500/5 transition-all text-center group"
              onClick={() => handleChoice("new")}
            >
              <div className="bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-orange-500/5">
                <Cpu className="text-orange-500 h-8 w-8" />
              </div>
              <h3 className="font-bold text-white text-lg">New Idea</h3>
              <p className="text-sm text-zinc-500 mt-2">I want to launch a new venture</p>
            </div>
            <div
              className="cursor-pointer border border-dashed border-zinc-700 rounded-2xl p-6 hover:border-blue-500 hover:bg-blue-500/5 transition-all text-center group"
              onClick={() => handleChoice("old")}
            >
              <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/5">
                <Building2 className="text-blue-500 h-8 w-8" />
              </div>
              <h3 className="font-bold text-white text-lg">Existing Business</h3>
              <p className="text-sm text-zinc-500 mt-2">I have a registered company</p>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
