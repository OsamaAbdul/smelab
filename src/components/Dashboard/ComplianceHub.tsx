import { useState } from "react";
import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import { CheckCircle, Download, Bell, ShieldCheck } from "lucide-react";
import { updateChecklistStatus } from "@/api/mutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ComplianceHub = () => {
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

  const business = businesses?.[0] || null;

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

  // State for reminders
  const [emailReminder, setEmailReminder] = useState(false);
  const [smsReminder, setSmsReminder] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveReminders = () => {
    toast.success(`Reminders saved: Email ${emailReminder ? "ON" : "OFF"}, SMS ${smsReminder ? "ON" : "OFF"}`);
  };

  const handleCompleteCompliance = async () => {
    setLoading(true);
    try {
      if (!user) return;

      if (business) {
        // 2. Create Compliance Record
        const { error: complianceError } = await supabase
          .from("compliance_records")
          .insert({
            business_id: business.id,
            compliance_type: 'initial_setup',
            status: 'completed',
            due_date: new Date().toISOString()
          });

        if (complianceError) console.error("Error creating compliance record:", complianceError);
      }

      // 3. Update Checklist
      const complianceStep = checklist?.find((c: any) => c.step_key === 'compliance');
      if (complianceStep && complianceStep.status !== 'completed') {
        await updateChecklistStatus(complianceStep.id, 'completed');
        queryClient.invalidateQueries({ queryKey: ['checklist'] });
      }

      toast.success("Compliance setup marked as complete!");
    } catch (error) {
      console.error("Error updating compliance:", error);
      toast.error("Failed to update compliance status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Compliance Hub</h1>
          <p className="text-zinc-400">Manage your business compliance and deadlines.</p>
        </div>
        <Button onClick={handleCompleteCompliance} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
          {loading ? "Updating..." : <><CheckCircle className="mr-2 h-4 w-4" /> Mark Setup Complete</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <ShieldCheck className="text-blue-500 w-5 h-5" /> Upcoming Deadlines
          </h2>
          <ul className="space-y-3">
            <li className="p-3 border border-zinc-800 rounded-lg bg-zinc-950/50 flex justify-between items-center hover:border-zinc-700 transition-colors">
              <span className="text-zinc-300">CAC Annual Return</span>
              <span className="font-semibold text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs">Oct 30</span>
            </li>
            <li className="p-3 border border-zinc-800 rounded-lg bg-zinc-950/50 flex justify-between items-center hover:border-zinc-700 transition-colors">
              <span className="text-zinc-300">Tax Filing</span>
              <span className="font-semibold text-orange-400 bg-orange-400/10 px-2 py-1 rounded text-xs">Nov 15</span>
            </li>
            <li className="p-3 border border-zinc-800 rounded-lg bg-zinc-950/50 flex justify-between items-center hover:border-zinc-700 transition-colors">
              <span className="text-zinc-300">License Renewal</span>
              <span className="font-semibold text-zinc-400 bg-zinc-800 px-2 py-1 rounded text-xs">Dec 5</span>
            </li>
          </ul>
        </div>

        {/* Downloadable Certificates */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Download className="text-purple-500 w-5 h-5" /> Certificates
          </h2>
          <div className="flex flex-col space-y-3">
            <Button className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-700" variant="outline">
              <Download className="mr-2 h-4 w-4" /> CAC Certificate
            </Button>
            <Button className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-700" variant="outline">
              <Download className="mr-2 h-4 w-4" /> Tax Clearance
            </Button>
            <Button className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-700" variant="outline">
              <Download className="mr-2 h-4 w-4" /> Business License
            </Button>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Bell className="text-yellow-500 w-5 h-5" /> Reminders
          </h2>
          <div className="space-y-6">
            <div className="flex items-center space-x-3 bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/50">
              <input
                type="checkbox"
                id="email"
                checked={emailReminder}
                onChange={() => setEmailReminder(!emailReminder)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
              />
              <label htmlFor="email" className="text-zinc-300 text-sm font-medium cursor-pointer flex-1">Email Reminders</label>
            </div>
            <div className="flex items-center space-x-3 bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/50">
              <input
                type="checkbox"
                id="sms"
                checked={smsReminder}
                onChange={() => setSmsReminder(!smsReminder)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
              />
              <label htmlFor="sms" className="text-zinc-300 text-sm font-medium cursor-pointer flex-1">SMS Reminders</label>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveReminders}>
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceHub;
