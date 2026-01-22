
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { History, Rocket, Loader2, CheckCircle2, Sparkles, Target, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import supabase from "@/utils/supabase";
import AILoader from "./AILoader";
import { toast, ToastContainer } from "react-toastify";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { initializeChecklist } from "@/api/mutations";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Business Type", icon: Building2 },
  { id: 2, title: "Target Audience", icon: Target },
  { id: 3, title: "Business Name", icon: Sparkles },
  { id: 4, title: "Logo Generation", icon: Image },
];

// Helper icons
import { Building2, Image } from "lucide-react";

const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1YXlyb3BzaGFiZXNwdGl6bXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDg1NjksImV4cCI6MjA3NDM4NDU2OX0.cWRSlR92YV_kO8Hx5r7D8PHOG1qwpg57RbQa0ww6G7o";


const Onboarding = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1. Fetch User Session
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = sessionData?.user;

  // 2. Fetch Businesses
  const { data: businesses } = useQuery({
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

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<any>({
    businessType: "",
    goal: "",
    clients: "",
    stage: "Idea",
    businessName: "",
    ownNameOption: null,
    ownBusinessName: "",
    logoUrl: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const { width, height } = useWindowSize();
  const [finishLoading, setFinishLoading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const updateAnswer = (field: string, value: any) => {
    setAnswers((prev: any) => ({ ...prev, [field]: value }));
  };

  const fetchSuggestions = async () => {
    setLoadingAI(true);
    try {
      const resp = await fetch(
        "https://fuayropshabesptizmta.supabase.co/functions/v1/ai-suggestions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anon}`,
          },
          body: JSON.stringify({
            businessType: answers.businessType,
            goal: answers.goal || `Start a ${answers.businessType} business`,
            clients: answers.clients,
            stage: answers.stage
          }),
        }
      );
      const data = await resp.json();
      let cleanSuggestions: string[] = [];

      if (data.suggestions) {
        if (Array.isArray(data.suggestions)) cleanSuggestions = data.suggestions;
        else if (typeof data.suggestions === "string") {
          let raw = data.suggestions
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          try {
            cleanSuggestions = JSON.parse(raw);
          } catch (e) {
            console.warn("Failed to parse suggestions:", e, raw);
          }
        }
      }
      setSuggestions(cleanSuggestions);
    } catch (err) {
      console.error("AI fetch failed", err);
      toast.error("Failed to fetch suggestions");
    } finally {
      setLoadingAI(false);
    }
  };

  const saveBusinessName = async (name: string) => {
    setSavingName(true);
    try {
      if (!user) {
        toast.error("Please log in to save.");
        return;
      }

      // Check for duplicates
      const { data: existing } = await supabase
        .from("businesses")
        .select("id")
        .ilike("name", name)
        .maybeSingle();

      if (existing) {
        toast.error("This business name is already taken.");
        setSavingName(false);
        return false;
      }

      // Save
      const { data, error } = await supabase.from("businesses").insert({
        user_id: user.id,
        name: name,
        industry: answers.businessType,
        target_clients: answers.clients,
        goal: answers.goal || "Start business",
        stage: answers.stage,
        registration_status: "not_registered"
      }).select().single();

      if (error) throw error;

      if (data) {
        await initializeChecklist(user.id, 'new', data.id);
      }

      toast.success("Business name saved!");
      updateAnswer("businessName", name);
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to save business name.");
      return false;
    } finally {
      setSavingName(false);
    }
  };

  const generateLogo = async () => {
    setLoadingLogo(true);
    try {
      const token = sessionData?.access_token || anon;

      const res = await fetch(
        "https://fuayropshabesptizmta.supabase.co/functions/v1/ai-generator",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "logo",
            businessType: answers.businessType,
            businessName: answers.businessName,
          }),
        }
      );

      const data = await res.json();
      if (data.success && data.images && data.images.length > 0) {
        const image = data.images[0];
        const blob = await fetch(`data:${image.mimeType};base64,${image.data}`).then(r => r.blob());
        const url = URL.createObjectURL(blob);
        updateAnswer("logoUrl", url);
        updateAnswer("logoBlob", blob);
      } else {
        toast.error("Failed to generate logo. Please try again.");
      }
    } catch (err) {
      console.error("Error generating logo:", err);
      toast.error("Error generating logo.");
    } finally {
      setLoadingLogo(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 3) {
      if (!answers.businessName) {
        toast.error("Please select or enter a business name first.");
        return;
      }
    }
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const finishOnboarding = async () => {
    setFinishLoading(true);
    try {
      if (!user) return;

      // Get business ID first
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("name", answers.businessName)
        .single();

      if (!business) {
        toast.error("Business not found.");
        return;
      }

      // Save Logo if generated
      if (answers.logoBlob) {
        const fileName = `logos/${user.id}/${business.id}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, answers.logoBlob);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(fileName);

          await supabase.from("assets").insert({
            user_id: user.id,
            business_id: business.id,
            type: 'logo',
            asset_url: publicUrl
          });

          await supabase.from("businesses")
            .update({ logo_url: publicUrl, has_logo: true })
            .eq("id", business.id);
        }
      }

      // Update Checklist
      await supabase.from("onboarding_checklist")
        .update({ status: 'completed' })
        .eq("user_id", user.id)
        .eq("business_id", business.id)
        .eq("step_key", "profile");

      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setShowCongrats(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to finish onboarding.");
    } finally {
      setFinishLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-14 relative bg-[#09090b] text-white">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <ToastContainer theme="dark" />

      {/* Congratulations Card */}
      {showCongrats && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-10 animate-in fade-in zoom-in duration-500">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={300} colors={['#3b82f6', '#6366f1', '#60a5fa']} />
          <div className="relative flex flex-col items-center justify-center text-center max-w-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Congratulations!</h2>
            <p className="text-xl mt-4 text-zinc-400">
              <span className="text-blue-400 font-semibold">{answers.businessName}</span> is officially ready for launch!
            </p>
            <Button
              className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] w-full transition-all"
              onClick={() => {
                setShowCongrats(false);
                navigate("/dashboard/home");
              }}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* LEFT SIDE: Main Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stepper */}
          <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center gap-2 group w-full relative">
                  {/* Line connection */}
                  {idx !== steps.length - 1 && (
                    <div className={cn(
                      "absolute top-4 left-[50%] w-full h-[2px] transition-colors duration-500",
                      step.id < currentStep ? "bg-blue-600" : "bg-white/5"
                    )} />
                  )}

                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 relative",
                      step.id <= currentStep
                        ? "bg-blue-600 border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] text-white"
                        : "bg-zinc-900 border-white/10 text-zinc-600"
                    )}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-colors duration-300",
                    step.id <= currentStep ? "text-blue-400" : "text-zinc-600"
                  )}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{steps[currentStep - 1].title}</h1>
              <p className="text-zinc-400 text-sm">Step {currentStep} of {steps.length}</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/5 p-8 md:p-12 flex flex-col justify-between min-h-[50vh] relative overflow-hidden group">
            {/* Ambient inner glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Step 1: Business Type */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-3">What's your industry?</h2>
                <p className="text-zinc-400 mb-8 text-lg">Help AI customize your experience.</p>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <select
                    className="w-full relative bg-zinc-950 border border-white/10 rounded-xl p-5 text-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
                    value={answers.businessType}
                    onChange={(e) => updateAnswer("businessType", e.target.value)}
                  >
                    <option value="" className="bg-zinc-900">-- Select Business Type --</option>
                    <option className="bg-zinc-900">Retail</option>
                    <option className="bg-zinc-900">Food & Beverage</option>
                    <option className="bg-zinc-900">Tech Startup</option>
                    <option className="bg-zinc-900">Consulting</option>
                    <option className="bg-zinc-900">Healthcare</option>
                    <option className="bg-zinc-900">Education</option>
                    <option className="bg-zinc-900">Ecommerce</option>
                    <option className="bg-zinc-900">Manufacturing</option>
                    <option className="bg-zinc-900">Agriculture</option>
                    <option className="bg-zinc-900">Fashion</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Target Audience */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-3">Who is your customer?</h2>
                <p className="text-zinc-400 mb-8 text-lg">Describe who you want to serve.</p>

                <div className="relative group/area">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover/area:opacity-40 transition duration-500"></div>
                  <textarea
                    rows={5}
                    value={answers.clients}
                    onChange={(e) => updateAnswer("clients", e.target.value)}
                    placeholder="e.g., Small business owners, university students, busy parents..."
                    className="relative w-full bg-zinc-950 border border-white/10 rounded-xl p-5 text-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Business Name */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-6">Let's verify your name</h2>

                {!answers.ownNameOption ? (
                  <div className="space-y-6">
                    <p className="text-lg text-zinc-300">Do you already have a name?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        className="py-10 text-lg rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all border-2 border-dashed md:border-solid"
                        variant="outline"
                        onClick={() => updateAnswer("ownNameOption", "yes")}
                      >
                        Yes, I have one
                      </Button>
                      <Button
                        className="py-10 text-lg rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-600/20 border-0"
                        onClick={() => {
                          updateAnswer("ownNameOption", "no");
                          fetchSuggestions();
                        }}
                      >
                        Suggest with AI <Sparkles className="ml-2 h-5 w-5 animate-pulse" />
                      </Button>
                    </div>
                  </div>
                ) : answers.ownNameOption === "yes" ? (
                  <div className="space-y-6">
                    <p className="text-zinc-400">Enter your business name below:</p>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-5 text-xl text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-zinc-700"
                        placeholder="My Business Name"
                        value={answers.ownBusinessName}
                        onChange={(e) => updateAnswer("ownBusinessName", e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => updateAnswer("ownNameOption", null)} className="text-zinc-400 hover:text-white">Back</Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-500 text-white min-w-[140px]"
                        disabled={!answers.ownBusinessName || savingName}
                        onClick={async () => {
                          const success = await saveBusinessName(answers.ownBusinessName);
                          if (success) nextStep();
                        }}
                      >
                        {savingName ? <Loader2 className="animate-spin" /> : "Save & Continue"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-lg border border-white/5">
                      <p className="text-zinc-400 text-sm">AI Suggestions for <span className="text-white font-medium">{answers.businessType}</span></p>
                      <Button variant="ghost" size="sm" onClick={fetchSuggestions} disabled={loadingAI} className="text-blue-400 hover:text-blue-300">
                        <Zap className="w-4 h-4 mr-1" /> Refresh
                      </Button>
                    </div>

                    {loadingAI ? (
                      <div className="py-12 flex justify-center">
                        <AILoader />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
                        {suggestions.map((name, idx) => (
                          <div
                            key={idx}
                            onClick={async () => {
                              if (selectedSuggestion) return;
                              setSelectedSuggestion(name);
                              const success = await saveBusinessName(name);
                              if (success) {
                                setCurrentStep(currentStep + 1);
                              }
                              setSelectedSuggestion(null);
                            }}
                            className={cn(
                              "cursor-pointer border rounded-xl p-5 flex justify-between items-center transition-all duration-300 group",
                              selectedSuggestion === name
                                ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                : selectedSuggestion
                                  ? "opacity-30 border-white/5"
                                  : "bg-zinc-950/50 border-white/5 hover:border-blue-500/50 hover:bg-zinc-900"
                            )}
                          >
                            <span className="font-semibold text-lg text-white group-hover:text-blue-200 transition-colors">{name}</span>
                            {selectedSuggestion === name ? (
                              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            ) : (
                              <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all font-medium flex items-center gap-1">
                                Select <ChevronRight className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="ghost" onClick={() => updateAnswer("ownNameOption", null)} disabled={!!selectedSuggestion} className="text-zinc-500 hover:text-white">Cancel</Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Logo Generation */}
            {currentStep === 4 && (
              <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 mb-2">Create Identity</h2>
                <p className="text-zinc-400 mb-8 max-w-md">Generate a unique logo for <br /><span className="text-white font-bold text-xl">{answers.businessName}</span></p>

                {answers.logoUrl ? (
                  <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500 w-full">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
                      <div className="relative p-6 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl">
                        <img src={answers.logoUrl} alt="Generated Logo" className="h-64 w-64 object-contain" />
                      </div>
                    </div>

                    <div className="flex gap-4 w-full justify-center">
                      <Button variant="outline" onClick={() => updateAnswer("logoUrl", "")} className="border-white/10 text-zinc-300 hover:bg-white/5">Regenerate</Button>
                      <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 px-6 py-2 rounded-full font-medium">
                        <CheckCircle2 className="h-5 w-5" /> Ready to Use
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-md space-y-6">
                    <div className="bg-blue-900/10 p-8 rounded-2xl border border-blue-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="w-24 h-24 text-blue-500" />
                      </div>
                      <Rocket className="h-12 w-12 text-blue-400 mx-auto mb-4 relative z-10" />
                      <p className="text-sm text-blue-200/80 relative z-10 font-medium">AI will analyze "<span className="text-white">{answers.businessType}</span>" trends to craft a perfectly matched logo for your brand.</p>
                    </div>
                    <Button
                      onClick={generateLogo}
                      disabled={loadingLogo}
                      className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white py-6 text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all hover:scale-[1.02] border-0"
                    >
                      {loadingLogo ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Designing...</>
                      ) : (
                        <span className="flex items-center gap-2">Generate Magic <Sparkles className="w-4 h-4" /></span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1 || currentStep === 3}
                className={cn("text-zinc-500 hover:text-white hover:bg-white/10", currentStep === 1 && "invisible")}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              {currentStep !== 3 && (
                currentStep < steps.length ? (
                  <Button
                    className="bg-zinc-100 text-zinc-900 hover:bg-white px-8 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !answers.businessType) ||
                      (currentStep === 2 && !answers.clients)
                    }
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 hover:bg-green-500 text-white px-8 font-bold shadow-lg shadow-green-600/20"
                    onClick={finishOnboarding}
                    disabled={finishLoading}
                  >
                    {finishLoading ? <Loader2 className="animate-spin mr-2" /> : "Launch Dashboard"}
                    {!finishLoading && <Rocket className="w-4 h-4 ml-2" />}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: History */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl shadow-lg border border-white/5 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg border-b border-white/5 pb-4">
              <History className="text-blue-500" /> Recent Activity
            </div>
            {businesses && businesses.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                <p>No history found.</p>
                <p className="text-xs mt-2">Your startup journey begins here.</p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {businesses?.map((b: any) => (
                  <li
                    key={b.id}
                    className="border border-white/5 rounded-xl p-4 hover:bg-white/5 transition group bg-zinc-950/30"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-zinc-300 group-hover:text-blue-400 transition">{b.name}</p>
                        <p className="text-xs text-zinc-500 mt-1">{b.industry}</p>
                      </div>
                      {b.has_logo && (
                        <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <Sparkles className="w-3 h-3 text-blue-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-3 text-right">
                      {new Date(b.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-white/5">
              <p className="text-xs text-blue-200/60 mb-2">Pro Tip</p>
              <p className="text-sm text-zinc-300">Using AI names increases brand recall by 40%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
