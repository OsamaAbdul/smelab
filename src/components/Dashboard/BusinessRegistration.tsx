import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  FilePlus,
  Download,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  CreditCard,
  Clock,
  Crown,
  Sparkles,
  Building2,
  Gem,
  Circle
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import PaymentModal from "./PaymentModal";
import RegistrationForm from "./RegistrationForm";
import { updateChecklistStatus } from "@/api/mutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const BusinessRegistration = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Form, 2 = Payment, 3 = Done
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const business = businesses?.[0];

  // 3. Fetch Checklist
  const { data: checklist } = useQuery({
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

  useEffect(() => {
    if (!businessesLoading && businesses && businesses.length === 0) {
      toast.error("No business found. Please complete onboarding first.");
      navigate("/dashboard/onboarding");
    }
  }, [businesses, businessesLoading, navigate]);

  // Check if already registered
  useEffect(() => {
    if (business?.registration_status === 'registered') {
      setStep(3);
    } else if (business?.registration_status === 'processing_cac') {
      setStep(3); // Show processing state
    }
  }, [business]);

  const handleFormSuccess = () => {
    setStep(2); // Move to Payment
    toast.success("Business details saved! Proceeding to payment.");
  };

  const handlePaymentSuccess = async () => {
    try {
      if (!business) return;

      // Update Business Status
      await supabase
        .from("businesses")
        .update({ registration_status: 'processing_cac' })
        .eq("id", business.id);

      // Update Checklist
      const registrationStep = checklist?.find((c: any) => c.step_key === 'registration');
      if (registrationStep) {
        await updateChecklistStatus(registrationStep.id, 'completed');
      }

      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['checklist'] });

      setStep(3);
      toast.success("Payment successful! Registration is in progress.");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Payment successful but failed to update status.");
    }
  };

  const handleDownloadCAC = () => {
    if (business?.cac_certificate_url) {
      const { data } = supabase.storage.from("uploads").getPublicUrl(business.cac_certificate_url);
      window.open(data.publicUrl, '_blank');
    } else {
      toast.info("Certificate is being processed. Check back later.");
    }
  };

  if (businessesLoading) {
    return <div className="flex justify-center items-center h-screen bg-zinc-950"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  if (!business) return null;

  // Calculate percentage
  const progress = Math.round(((step - 1) / 3) * 100);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">


      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Action Card */}
        <div className="lg:col-span-2">
          {/* Step 1: Registration Form */}
          {step === 1 && (
            <div className="bg-[#111113] border border-white/5 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-600/20">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Business Details</h3>
                  <p className="text-zinc-400 text-sm">Provide your official business information.</p>
                </div>
              </div>
              <RegistrationForm
                businessId={business.id}
                onSuccess={handleFormSuccess}
                onCancel={() => navigate("/dashboard/home")}
              />
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-[#111113] border border-white/5 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px]" />

              <div className="relative z-10 max-w-lg mx-auto">
                <div className="w-16 h-16 mx-auto bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 border border-blue-600/20 mb-6 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Secure Registration Payment</h3>
                <p className="text-zinc-400 text-sm mb-8">
                  Complete your official CAC filing for <span className="text-white font-medium">{business.name}</span>.
                </p>

                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-zinc-500">₦</span>
                    <span className="text-4xl font-bold text-white">25,000</span>
                  </div>
                  <div className="flex justify-center mt-4 gap-4">
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> Name Reservation
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> CAC Fees
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> Stamp Duty
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all"
                >
                  Pay Securely
                </Button>
                <Button
                  variant="ghost"
                  className="mt-3 text-zinc-500 hover:text-white"
                  onClick={() => setStep(1)}
                >
                  Back to Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="bg-[#111113] border border-white/5 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

              <div className="relative z-10 max-w-lg mx-auto py-8">
                {business.registration_status === 'registered' ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                      <Crown className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">You're Officially Registered!</h3>
                    <p className="text-zinc-400 mb-8">Downloading your certificate is just one click away.</p>
                    <Button onClick={handleDownloadCAC} className="w-full bg-white text-black hover:bg-zinc-200 h-12 rounded-xl font-bold">
                      <Download className="w-4 h-4 mr-2" /> Download Certificate
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center text-blue-500 mb-6 animate-pulse">
                      <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Processing Your Registration</h3>
                    <p className="text-zinc-400 mb-8">Our team is filing your documents with the CAC. We'll notify you soon.</p>
                    <div className="w-full bg-black/40 rounded-xl p-4 border border-white/5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-500">Estimated Time</span>
                        <span className="text-white">3-5 Days</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-blue-600 rounded-full animate-progress-indeterminate" />
                      </div>
                    </div>
                  </div>
                )}


              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status / Info */}
        <div className="space-y-6">
          <div className="bg-[#111113] border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Business Status</span>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Building2 className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {business.registration_status === 'registered' ? "Registered Entity" : "Pending Registration"}
            </h3>
            <p className="text-zinc-500 text-sm">{business.industry || "General Industry"}</p>


          </div>


        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={25000}
        businessName={business.name}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BusinessRegistration;
