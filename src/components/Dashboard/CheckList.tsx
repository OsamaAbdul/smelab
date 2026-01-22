import { useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { updateChecklistStatus } from "@/api/mutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "@/utils/supabase";
import Loader from "./Loader";

const Checklist = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 1. Fetch User Session
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = sessionData?.user;

  // 2. Fetch Checklist
  const { data: checklist, isLoading: checklistLoading } = useQuery({
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

  const loading = sessionLoading || checklistLoading;

  const handleUpdateStatus = async (id: any, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setUpdatingId(id);
    try {
      await updateChecklistStatus(id, newStatus);
      toast.success(`Task marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader />;

  // Calculate Progress
  let progress = 0;
  if (checklist && checklist.length > 0) {
    const completed = checklist.filter((c: any) => c.status === 'completed').length;
    progress = Math.round((completed / checklist.length) * 100);
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Launch Checklist</h1>
          <p className="text-zinc-400 mt-1">Follow these steps to launch your business successfully.</p>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="text-right">
            <p className="text-2xl font-bold text-sme-orange leading-none">{progress}%</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Completed</p>
          </div>
          {/* Circular Progress or just standard bar next to it? Let's stick to the user's layout but improved */}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-900 rounded-full h-2 mb-10 overflow-hidden ring-1 ring-white/5">
        <div
          className="bg-gradient-to-r from-sme-orange to-orange-500 h-2 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {checklist && checklist.length > 0 ? (
          checklist.map((task: any) => (
            <div
              key={task.id}
              className={`flex items-start p-5 rounded-xl border transition-all duration-300 group ${task.status === 'completed'
                ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                : "bg-zinc-900/40 border-white/5 hover:bg-zinc-900/80 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
                }`}
            >
              <button
                onClick={() => handleUpdateStatus(task.id, task.status)}
                disabled={!!updatingId}
                className="mt-1 mr-5 focus:outline-none shrink-0 transition-transform active:scale-95"
              >
                {updatingId === task.id ? (
                  <Loader2 className="h-6 w-6 text-sme-orange animate-spin" />
                ) : task.status === 'completed' ? (
                  <div className="bg-green-500 rounded-full p-0.5 shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                    <CheckCircle2 className="h-5 w-5 text-zinc-950" />
                  </div>
                ) : (
                  <Circle className="h-6 w-6 text-zinc-600 hover:text-sme-orange transition-colors" />
                )}
              </button>

              <div className="flex-1 cursor-pointer" onClick={() => task.action_url && navigate(task.action_url)}>
                <h3 className={`text-lg font-semibold transition-colors ${task.status === 'completed' ? "text-green-500 line-through decoration-green-500/30" : "text-zinc-200 group-hover:text-white"}`}>
                  {task.title}
                </h3>
                <p className={`text-sm mt-1 transition-colors ${task.status === 'completed' ? "text-green-500/50" : "text-zinc-500 group-hover:text-zinc-400"}`}>
                  {task.description}
                </p>
                {task.action_url && task.status !== 'completed' && (
                  <span className="text-xs text-sme-orange font-medium mt-3 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    Click to Start &rarr;
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 mb-4">No checklist items found. Please complete your profile setup.</p>
            <button onClick={() => navigate('/dashboard/home')} className="text-sme-orange font-medium hover:text-orange-400 hover:underline">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checklist;
