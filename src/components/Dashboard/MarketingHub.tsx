import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateChecklistStatus } from "@/api/mutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MarketingHub = () => {
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

  // 3. Fetch Checklist
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

  const business = businesses?.[0] || null;

  // Flyer State
  const [flyerTitle, setFlyerTitle] = useState("");
  const [flyerDescription, setFlyerDescription] = useState("");
  const [flyerImage, setFlyerImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Scheduler State
  const [post, setPost] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  // Analytics Data
  const analyticsData = {
    labels: ["Facebook", "Instagram", "Twitter", "LinkedIn"],
    datasets: [
      {
        label: "Engagement",
        data: [120, 90, 75, 60],
        backgroundColor: "rgba(59, 130, 246, 0.7)"
      }
    ]
  };

  const updateChecklist = async () => {
    try {
      if (!user) return;
      // Find the 'digital' step in the checklist
      const digitalStep = checklist?.find((c: any) => c.step_key === 'digital');
      if (digitalStep && digitalStep.status !== 'completed') {
        await updateChecklistStatus(digitalStep.id, 'completed');
        queryClient.invalidateQueries({ queryKey: ['checklist'] });
      }
    } catch (error) {
      console.error("Error updating checklist:", error);
    }
  };

  const handleGenerateFlyer = async () => {
    setLoading(true);
    try {
      if (!user) {
        toast.error("Please log in");
        return;
      }

      if (!business) {
        toast.error("No business profile found. Please complete onboarding.");
        return;
      }

      let assetUrl = "";

      if (flyerImage) {
        // Upload Image
        const fileExt = flyerImage.name.split('.').pop();
        const fileName = `flyers/${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, flyerImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(fileName);
        assetUrl = publicUrl;
      } else {
        // AI Generation
        const token = sessionData?.access_token;

        const res = await fetch(
          "https://fuayropshabesptizmta.supabase.co/functions/v1/ai-generator",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: "flyer",
              businessType: business.industry || "General",
              businessName: business.name,
              description: flyerDescription
            }),
          }
        );

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "AI generation failed");
        }

        let blob;
        let extension = 'svg';

        if (data.images && data.images.length > 0) {
          const img = data.images[0];
          const res = await fetch(`data:${img.mimeType};base64,${img.data}`);
          blob = await res.blob();
          extension = img.format === 'png' ? 'png' : 'svg';
        } else if (data.svgs && data.svgs.length > 0) {
          const svg = data.svgs[0];
          blob = new Blob([svg], { type: "image/svg+xml" });
          extension = 'svg';
        } else {
          throw new Error("No images generated");
        }

        const fileName = `flyers/${user.id}/ai-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(fileName);
        assetUrl = publicUrl;
      }

      // Save to Assets
      const { error: dbError } = await supabase.from("assets").insert({
        user_id: user.id,
        business_id: business.id,
        type: 'flyer',
        asset_url: assetUrl,
      });

      if (dbError) throw dbError;

      toast.success("Flyer created successfully!");
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      await updateChecklist();

      // Reset form
      setFlyerTitle("");
      setFlyerDescription("");
      setFlyerImage(null);

    } catch (error: any) {
      console.error("Error creating flyer:", error);
      toast.error(error.message || "Failed to create flyer");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!post || !scheduleDate) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Post scheduled for ${scheduleDate}!`);
    await updateChecklist();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Marketing Hub</h1>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Flyer Generator Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Create Marketing Material</h2>
          <p className="text-sm text-gray-500 mb-4">Upload your own design or let AI generate one for you.</p>

          <input
            type="text"
            placeholder="Title (e.g., Summer Sale)"
            className="w-full p-2 border rounded mb-2"
            value={flyerTitle}
            onChange={(e) => setFlyerTitle(e.target.value)}
          />
          <textarea
            placeholder="Description (used for AI generation)"
            className="w-full p-2 border rounded mb-2"
            value={flyerDescription}
            onChange={(e) => setFlyerDescription(e.target.value)}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFlyerImage(e.target.files ? e.target.files[0] : null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <Button className="w-full" onClick={handleGenerateFlyer} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : (flyerImage ? "Upload Flyer" : "Generate with AI")}
          </Button>
        </div>

        {/* Social Media Scheduler Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Social Media Scheduler</h2>
          <textarea
            placeholder="Write your post here..."
            className="w-full p-2 border rounded mb-2 h-32"
            value={post}
            onChange={(e) => setPost(e.target.value)}
          />
          <input
            type="datetime-local"
            className="w-full p-2 border rounded mb-4"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />
          <Button className="w-full" onClick={handleSchedulePost}>
            Schedule Post
          </Button>
        </div>

        {/* Analytics Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Engagement Analytics</h2>
          <Bar data={analyticsData} />
        </div>
      </div>
    </div>
  );
};

export default MarketingHub;
