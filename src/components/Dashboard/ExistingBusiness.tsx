import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import supabase from "../../utils/supabase";
import { toast } from "sonner";
import { History, Rocket, Loader2, CheckSquare, Upload, Download, Building2, CreditCard, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import PaymentModal from "./PaymentModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import RegistrationForm from "./RegistrationForm";
import { cn } from "@/lib/utils";

const steps = ["Registration", "Action", "Enhance"];

const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

const ExistingBusiness = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1. Fetch User Session
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = sessionData?.user;

  // 2. Fetch Businesses
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

  // 3. Fetch Design Requests
  const { data: designRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['designRequests', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Realtime Subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('business-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'businesses', filter: `user_id=eq.${user.id}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['businesses'] });
          if (payload.eventType === 'UPDATE' && payload.new.registration_status === 'registered') {
            toast.success(`Congratulations! ${payload.new.name} is now registered.`);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const globalLoading = sessionLoading || businessesLoading || requestsLoading;

  const [step, setStep] = useState(0);
  const [isRegistered, setIsRegistered] = useState<null | boolean>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [generatedLogoUrl, setGeneratedLogoUrl] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [cacFile, setCacFile] = useState<File | null>(null);

  // Form data (kept for logic, though separate component handles mostly)
  const [formData] = useState({ name: "", nature: "" }); // Simplification

  const [designNeeds, setDesignNeeds] = useState({
    flyer: false,
    logo: false,
    details: "",
  });

  const history = [
    ...(businesses || []).map((b: any) => ({
      type: "Business",
      title: b.name,
      status: b.registration_status || "Pending",
      created_at: b.created_at,
      id: b.id,
      cac_url: b.cac_certificate_url
    })),
    ...(designRequests || []).map((d: any) => ({
      type: "Design",
      title: d.request_type,
      status: d.status,
      created_at: d.created_at,
      id: d.id
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handlePaymentSuccess = async () => {
    if (!selectedBusinessId) return;
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ registration_status: "processing_cac" })
        .eq("id", selectedBusinessId);
      if (error) throw error;
      toast.success("Payment successful! CAC registration processing.");
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update business status");
    }
  };

  const uploadCacCertificate = async () => {
    if (!cacFile || !selectedBusinessId) return;
    setLoading(true);
    try {
      if (!user) return;
      const fileName = `cac/${user.id}/${selectedBusinessId}-${Date.now()}.pdf`;
      const { error } = await supabase.storage.from("uploads").upload(fileName, cacFile);
      if (error) throw error;
      await supabase.from("businesses").update({ registration_status: "registered", cac_certificate_url: fileName }).eq("id", selectedBusinessId);
      const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(fileName);
      await supabase.from("assets").insert({ user_id: user.id, business_id: selectedBusinessId, type: "document", asset_url: publicUrl, title: "CAC Certificate" });
      await supabase.from("onboarding_checklist").update({ status: "completed" }).eq("user_id", user.id).eq("business_id", selectedBusinessId).eq("step_key", "verification");
      toast.success("CAC Certificate uploaded!");
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const generateLogo = async () => {
    setLoadingLogo(true);
    try {
      const token = sessionData?.access_token || anon;
      const bName = selectedBusinessId ? businesses?.find((b: any) => b.id === selectedBusinessId)?.name : formData.name;
      const bType = selectedBusinessId ? businesses?.find((b: any) => b.id === selectedBusinessId)?.industry : formData.nature;

      const res = await fetch("https://fuayropshabesptizmta.supabase.co/functions/v1/ai-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "logo", businessType: bType || "General", businessName: bName }),
      });

      const data = await res.json();
      if (data.success && data.images?.[0]) {
        const image = data.images[0];
        const blob = await fetch(`data:${image.mimeType};base64,${image.data}`).then(r => r.blob());
        setGeneratedLogoUrl(URL.createObjectURL(blob));
        setDesignNeeds(prev => ({ ...prev, logo: true }));
      } else {
        toast.error("Failed to generate logo.");
      }
    } catch (err) {
      console.error("Error generating logo:", err);
      toast.error("Error generating logo.");
    } finally {
      setLoadingLogo(false);
    }
  };

  const saveDesignNeeds = async () => {
    try {
      if (!user) { toast.error("Not logged in"); return; }
      if (!designNeeds.flyer && !designNeeds.logo && !designNeeds.details) {
        if (selectedBusinessId) {
          // Check if business is registered, then auto-complete
          const business = businesses?.find((b: any) => b.id === selectedBusinessId);
          if (business?.registration_status === 'registered') {
            await supabase.from("onboarding_checklist").update({ status: "completed" }).eq("user_id", user.id).eq("business_id", selectedBusinessId).eq("step_key", "verification");
          }
        }
        toast.success("Process completed!");
        navigate("/dashboard/home");
        return;
      }

      await supabase.from("design_requests").insert([{
        user_id: user.id,
        business_id: selectedBusinessId,
        request_type: designNeeds.flyer ? "flyer" : designNeeds.logo ? "logo" : "other",
        description: designNeeds.details,
        status: "pending",
      }]);

      if (selectedBusinessId) {
        await supabase.from("onboarding_checklist").update({ status: "completed" }).eq("user_id", user.id).eq("business_id", selectedBusinessId).eq("step_key", "digital");
      }
      toast.success("Design request submitted!");
      queryClient.invalidateQueries({ queryKey: ['designRequests'] });
      navigate("/dashboard/assets");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save design needs");
    }
  };

  if (globalLoading) {
    return <div className="flex justify-center items-center h-full py-20 pb-40"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 p-4 md:p-8 w-full max-w-7xl mx-auto min-h-screen text-white">

      {/* LEFT SIDE: Main Workflow */}
      <div className="flex-1 space-y-8">

        {/* Header/Stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Business Hub</h1>
            <p className="text-zinc-400 mt-1">Manage registration and brand assets</p>
          </div>
          <div className="flex gap-2">
            {steps.map((label, idx) => (
              <div key={idx} className={cn(
                "h-2 w-8 rounded-full transition-all duration-300",
                idx <= step ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" : "bg-zinc-800"
              )} />
            ))}
          </div>
        </div>

        {/* Content Card Container */}
        <div className="bg-[#111113] rounded-3xl border border-zinc-800/50 p-8 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

          {/* STEP 0: REGISTRATION STATUS */}
          {step === 0 && (
            <div className="flex flex-col h-full flex-1">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">Registration Status</h2>
                <p className="text-zinc-400">Is your business already registered with the CAC?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-center">
                <button
                  onClick={() => setIsRegistered(true)}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-8 rounded-2xl border transition-all duration-300 h-64",
                    isRegistered === true
                      ? "bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)]"
                      : "bg-zinc-900/50 border-white/5 hover:border-blue-500/50 hover:bg-zinc-900"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
                    isRegistered === true ? "bg-blue-500 text-white shadow-lg" : "bg-zinc-800 text-zinc-400 group-hover:bg-blue-500 group-hover:text-white"
                  )}>
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Yes, Registered</h3>
                  <p className="text-sm text-zinc-400 text-center">I have my CAC certificate</p>
                </button>

                <button
                  onClick={() => setIsRegistered(false)}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-8 rounded-2xl border transition-all duration-300 h-64",
                    isRegistered === false
                      ? "bg-orange-600/10 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)]"
                      : "bg-zinc-900/50 border-white/5 hover:border-orange-500/50 hover:bg-zinc-900"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
                    isRegistered === false ? "bg-orange-500 text-white shadow-lg" : "bg-zinc-800 text-zinc-400 group-hover:bg-orange-500 group-hover:text-white"
                  )}>
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Not Registered</h3>
                  <p className="text-sm text-zinc-400 text-center">I need to register fully</p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: ACTION */}
          {step === 1 && (
            <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
              {isRegistered ? (
                // UPLOAD FLOW
                <div className="max-w-xl mx-auto w-full text-center space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verify Registration</h2>
                    <p className="text-zinc-400">Upload your CAC certificate to unlock all features.</p>
                  </div>

                  {/* Business Select */}
                  <div className="text-left">
                    <label className="text-sm font-medium text-zinc-300 mb-2 block">Select Business Profile</label>
                    <select
                      className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={selectedBusinessId || ""}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                    >
                      <option value="" className="bg-zinc-900">Choose a business...</option>
                      {businesses?.map((b: any) => (
                        <option key={b.id} value={b.id} className="bg-zinc-900">{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedBusinessId && (
                    <div className="p-8 border-2 border-dashed border-zinc-700 rounded-2xl hover:border-blue-500/50 hover:bg-zinc-800/30 transition cursor-pointer group text-center relative">
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setCacFile(e.target.files?.[0] || null)}
                      />
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                        <Upload className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-lg font-medium text-white mb-1">
                        {cacFile ? cacFile.name : "Click to upload document"}
                      </p>
                      <p className="text-sm text-zinc-500">PDF, JPG or PNG (Max 5MB)</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 text-zinc-400 hover:text-white">Skip for now</Button>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-6"
                      disabled={!cacFile || loading}
                      onClick={uploadCacCertificate}
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Upload & Verify"}
                    </Button>
                  </div>
                </div>
              ) : isRegistering ? (
                // REGISTER FORM WRAPPER
                <RegistrationForm
                  businessId={selectedBusinessId!}
                  onSuccess={() => { setIsRegistering(false); setShowPayment(true); }}
                  onCancel={() => setIsRegistering(false)}
                />
              ) : (
                // NEW REGISTRATION SELECTION
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Register Business</h2>
                    <p className="text-zinc-400">Select a business profile to start official registration.</p>
                  </div>

                  <Link to="/dashboard/onboarding" className="block">
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between hover:border-blue-500 transition group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                          <Rocket className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-white">Create New Profile</h3>
                          <p className="text-xs text-blue-200">Start from scratch</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition" />
                    </div>
                  </Link>

                  <div className="grid gap-3">
                    {businesses?.filter((b: any) => b.registration_status !== 'registered').map((b: any) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBusinessId(b.id)}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition flex justify-between items-center group",
                          selectedBusinessId === b.id
                            ? "bg-blue-600/10 border-blue-500"
                            : "bg-zinc-900 border-white/5 hover:bg-zinc-800"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-zinc-500" />
                          <div>
                            <h3 className="font-medium text-zinc-200 group-hover:text-white">{b.name}</h3>
                            <p className="text-xs text-zinc-500">{b.industry}</p>
                          </div>
                        </div>
                        {selectedBusinessId === b.id && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                      </div>
                    ))}
                  </div>

                  {selectedBusinessId && (
                    <div className="mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-bottom-4 fade-in">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <p className="text-zinc-400 text-sm">Registration Fee</p>
                          <h3 className="text-2xl font-bold text-white">₦20,000<span className="text-sm font-normal text-zinc-500">.00</span></h3>
                        </div>
                        <Button
                          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-600/20"
                          onClick={() => setIsRegistering(true)}
                        >
                          Start Application
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ENHANCE (DESIGN) */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Enhance Your Brand</h2>
                <p className="text-zinc-400">Professional assets to launch your business.</p>
              </div>

              {/* AI Logo Generator Card */}
              <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 p-8 rounded-2xl relative overflow-hidden text-center group">
                <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition duration-500" />
                <div className="relative z-10">
                  <Rocket className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">AI Logo Generator</h3>
                  <p className="text-zinc-400 mb-6 max-w-sm mx-auto">Generate a unique 3D or Minimalist logo for your business in seconds.</p>

                  {generatedLogoUrl ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-white/10 shadow-xl">
                        <img src={generatedLogoUrl} alt="Generated Logo" className="w-32 h-32 object-contain" />
                      </div>
                      <div className="flex gap-4">
                        <Button variant="outline" className="border-white/10 text-zinc-300 hover:bg-white/5" onClick={() => setGeneratedLogoUrl("")}>Regenerate</Button>
                        <div className="px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Saved
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={generateLogo}
                      disabled={loadingLogo}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 px-8 shadow-lg shadow-indigo-600/20"
                    >
                      {loadingLogo ? <Loader2 className="animate-spin" /> : "Generate with AI"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Manual Request Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={cn(
                  "flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all",
                  designNeeds.flyer ? "bg-blue-600/10 border-blue-500" : "bg-zinc-900/50 border-white/5 hover:bg-zinc-900"
                )}>
                  <input
                    type="checkbox"
                    checked={designNeeds.flyer}
                    onChange={e => setDesignNeeds(p => ({ ...p, flyer: e.target.checked }))}
                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-offset-0"
                  />
                  <div>
                    <span className="block font-bold text-zinc-200">Marketing Flyer</span>
                    <span className="text-xs text-zinc-500">Promotional materials</span>
                  </div>
                </label>

                <label className={cn(
                  "flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all",
                  designNeeds.logo ? "bg-blue-600/10 border-blue-500" : "bg-zinc-900/50 border-white/5 hover:bg-zinc-900"
                )}>
                  <input
                    type="checkbox"
                    checked={designNeeds.logo}
                    onChange={e => setDesignNeeds(p => ({ ...p, logo: e.target.checked }))}
                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-offset-0"
                  />
                  <div>
                    <span className="block font-bold text-zinc-200">Custom Logo</span>
                    <span className="text-xs text-zinc-500">Designed by expert</span>
                  </div>
                </label>
              </div>

              <textarea
                rows={3}
                placeholder="Additional details for the designer..."
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder:text-zinc-700"
                value={designNeeds.details}
                onChange={e => setDesignNeeds(p => ({ ...p, details: e.target.value }))}
              />
            </div>
          )}

          {/* Steps Footer Navigation */}
          <div className="mt-auto pt-8 flex justify-between items-center border-t border-white/5">
            <Button
              variant="ghost"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className={cn("text-zinc-500 hover:text-white", step === 0 && "invisible")}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {step === 2 ? (
              <Button
                onClick={saveDesignNeeds}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-6 rounded-xl font-bold shadow-lg shadow-green-600/20"
              >
                Finish & Launch <Rocket className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={(step === 0 && isRegistered === null) || (step === 1 && !selectedBusinessId && !isRegistered)}
                className="bg-white text-black hover:bg-zinc-200 px-8 py-6 rounded-xl font-bold"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: History Sidebar */}
      <div className="w-full xl:w-80 h-fit sticky top-6">
        <div className="bg-[#111113] rounded-3xl border border-zinc-800/50 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <History className="text-blue-500" /> Activity Log
          </h3>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {history.length === 0 ? (
              <p className="text-zinc-600 text-center py-8">No activity yet</p>
            ) : (
              history.map((item: any, idx) => (
                <div key={idx} className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl hover:bg-zinc-900 transition group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider",
                      item.type === 'Business' ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                    )}>{item.type}</span>
                    <span className="text-[10px] text-zinc-600">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="font-bold text-zinc-200 mb-1 group-hover:text-blue-400 transition">{item.title}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-zinc-500 capitalize">{item.status}</p>
                    {item.cac_url && (
                      <a href={supabase.storage.from('uploads').getPublicUrl(item.cac_url).data.publicUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400">
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={25000}
        businessName="CAC Registration"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ExistingBusiness;
