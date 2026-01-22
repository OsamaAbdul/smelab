import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Calendar, Loader2, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import { updateChecklistStatus } from "@/api/mutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const ConsultantBooking = () => {
  const queryClient = useQueryClient();

  // 1. Fetch User Session
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = sessionData?.user;

  // 2. Fetch Checklist
  const { data: checklist } = useQuery({
    queryKey: ['checklist', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_checklist")
        .select("*")
        .eq("user_id", user!.id)
        .order("id", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBookCall = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time first.");
      return;
    }

    setLoading(true);
    try {
      if (!user) return;

      // Save booking to DB
      const { error: bookingError } = await supabase.from('consultations').insert({
        user_id: user.id,
        expert_name: 'Business Consultant', // Default or selected expert
        topic: 'Growth Strategy', // Default or selected topic
        scheduled_at: `${selectedDate}T${selectedTime}:00`,
        status: 'scheduled'
      });

      if (bookingError) throw bookingError;

      // Update Checklist
      const growthStep = checklist?.find((c: any) => c.step_key === 'growth');
      if (growthStep && growthStep.status !== 'completed') {
        await updateChecklistStatus(growthStep.id, 'completed');
        queryClient.invalidateQueries({ queryKey: ['checklist'] });
      }

      toast.success(`Call booked on ${selectedDate} at ${selectedTime}`);
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error("Error booking call:", error);
      toast.error("Failed to book call.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = "2348012345678"; // Replace with consultant's number
    window.open(`https://wa.me/${phoneNumber}`, "_blank");
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-4 backdrop-blur-sm">
          <Sparkles className="w-3 h-3" />
          EXPERT GUIDANCE
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Consultant Booking</h1>
        <p className="text-zinc-400 max-w-2xl">Connect with industry experts to accelerate your business growth.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book Call Card */}
        <div className="bg-[#111113] rounded-3xl p-8 border border-white/5 relative overflow-hidden shadow-2xl group hover:border-blue-500/20 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-600/10 transition-colors" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                <Phone className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Schedule a Video Call</h2>
                <p className="text-zinc-500 text-sm">One-on-one strategy session</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-zinc-300 text-sm font-medium ml-1">Select Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-zinc-300 text-sm font-medium ml-1">Select Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                  onClick={handleBookCall}
                  disabled={loading}
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...</> : "Confirm Booking"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Chat Card */}
        <div className="bg-[#111113] rounded-3xl p-8 border border-white/5 relative overflow-hidden shadow-2xl group hover:border-green-500/20 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-green-600/10 transition-colors" />

          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pro Chat Support</h2>
                <p className="text-zinc-500 text-sm">Instant answers via WhatsApp</p>
              </div>
            </div>

            <div className="flex-grow">
              <p className="text-zinc-400 leading-relaxed mb-6">
                Need quick answers? Skip the scheduling and chat directly with our available business consultants. Perfect for quick questions about:
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Legal Requirements",
                  "Tax Compliance",
                  "Growth Opportunities",
                  "Technical Support"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02]"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Start WhatsApp Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantBooking;
