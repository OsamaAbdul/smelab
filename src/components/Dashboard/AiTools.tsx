import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Download, Figma, Sparkles, Wand2, History, TrendingUp } from "lucide-react";
import { useState } from "react";
import supabase from "@/utils/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const anon =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1YXlyb3BzaGFiZXNwdGl6bXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDg1NjksImV4cCI6MjA3NDM4NDU2OX0.cWRSlR92YV_kO8Hx5r7D8PHOG1qwpg57RbQa0ww6G7o";

export default function AITools() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [logos, setLogos] = useState<string[]>([]);
  const [flyers, setFlyers] = useState<string[]>([]);
  const [logoIndex, setLogoIndex] = useState(0);
  const [flyerIndex, setFlyerIndex] = useState(0);
  const [logoDescription, setLogoDescription] = useState("");
  const [flyerDescription, setFlyerDescription] = useState("");
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingFlyer, setLoadingFlyer] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);

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

  // 3. Fetch Assets
  const { data: assets } = useQuery({
    queryKey: ['assets', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const business = businesses?.[0] || null;

  // Carousel controls
  const nextLogo = () => setLogoIndex((i) => (i + 1) % logos.length);
  const prevLogo = () => setLogoIndex((i) => (i - 1 + logos.length) % logos.length);
  const nextFlyer = () => setFlyerIndex((i) => (i + 1) % flyers.length);
  const prevFlyer = () => setFlyerIndex((i) => (i - 1 + flyers.length) % flyers.length);

  const generateDesigns = async (type: "logo" | "flyer") => {
    console.log("generateDesigns called for:", type);
    const setLoading = type === "logo" ? setLoadingLogo : setLoadingFlyer;
    const setAssets = type === "logo" ? setLogos : setFlyers;
    const description = type === "logo" ? logoDescription : flyerDescription;

    if (!business) {
      console.warn("No business found!");
      alert("No business details found. Please register your business in the Business Info tab first."); // Fallback
      toast.error("No business details found. Please register your business first.");
      return;
    }

    setLoading(true);
    console.log("Starting generation...", { type, business });

    try {
      const { data, error } = await supabase.functions.invoke('ai-generator', {
        body: {
          type,
          businessType: business.industry || "General",
          businessName: business.name,
          description,
        }
      });

      console.log("AI Generation Response:", data, error);

      if (error) throw error;

      if (data.success) {
        if (data.images) {
          const assets = data.images.map((img: any) => `data:${img.mimeType};base64,${img.data}`);
          setAssets(assets);
        } else if (data.svgs) {
          setAssets(data.svgs);
        }
      } else {
        console.error("Generation failed:", data.error);
        toast.error(data.error || "Failed to generate design. Please try again.");
      }
    } catch (err: any) {
      console.error("Error generating design:", err);
      toast.error("Error generating design: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAndSave = async (assetData: string, type: "logo" | "flyer") => {
    try {
      if (!user) {
        toast.error("You must be logged in to save assets");
        return;
      }
      if (!business) {
        toast.error("No business found");
        return;
      }

      let blob;
      let extension = 'png'; // Default to png for Imagen

      if (assetData.startsWith('data:')) {
        const res = await fetch(assetData);
        blob = await res.blob();
        extension = blob.type.split('/')[1];
        if (extension === 'svg+xml') extension = 'svg';
      } else {
        // Fallback for raw SVG code
        blob = new Blob([assetData], { type: "image/svg+xml" });
        extension = 'svg';
      }

      const fileName = `designs/${user.id}/${type}-${Date.now()}.${extension}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, blob);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload design");
        return;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      // 3. Save to Assets Table
      const { error: dbError } = await supabase.from("assets").insert([
        {
          user_id: user.id,
          business_id: business.id,
          type,
          asset_url: publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      // 4. Update Business Logo if it's a logo
      if (type === 'logo') {
        await supabase
          .from("businesses")
          .update({ logo_url: publicUrl, has_logo: true })
          .eq("id", business.id);
        queryClient.invalidateQueries({ queryKey: ['businesses'] });
      }

      // 5. Update Checklist
      const { data: profile } = await supabase.from('profiles').select('business_type').eq('id', user.id).single();
      const stepKey = profile?.business_type === 'new' ? 'branding' : 'digital';

      await supabase
        .from("onboarding_checklist")
        .update({ status: 'completed' })
        .eq("user_id", user.id)
        .eq("step_key", stepKey);

      toast.success(`${type === 'logo' ? 'Logo' : 'Flyer'} saved successfully!`);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      setShowNextStep(true);

      // 6. Trigger Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}-design.${extension}`;
      link.click();
      URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error("Error saving asset:", err);
      toast.error("Failed to save asset: " + err.message);
    }
  };

  const RenderCard = ({
    type,
    title,
    gradient,
    items,
    index,
    next,
    prev,
    onGenerate,
    onSave,
    loading,
    description,
    setDescription,
    placeholder
  }: any) => (
    <Card className="w-full bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden group hover:border-zinc-700 transition-all duration-300">
      <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-zinc-100 z-10 relative">
          <Sparkles className={cn("w-5 h-5", type === "logo" ? "text-purple-400" : "text-pink-400")} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Preview Section */}
          <div className="flex-1">
            <p className="text-zinc-400 text-sm mb-6">Preview your AI-generated {type}s.</p>
            <div className="relative flex items-center justify-center min-h-[350px] bg-zinc-950/50 rounded-2xl border border-zinc-800 p-8">
              {items.length > 0 ? (
                <>
                  <button onClick={prev} className="absolute left-4 z-10 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 p-2 rounded-full transition-all">
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <motion.div
                    key={index}
                    className="relative z-0 max-w-[80%] max-h-[300px] overflow-hidden rounded-lg shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    transition={{ duration: 0.4 }}
                  >
                    {items[index].startsWith('data:') ? (
                      <img src={items[index]} alt="Generated Design" className="w-full h-full object-contain rounded-lg shadow-black/50" />
                    ) : (
                      <div
                        className="w-full h-full bg-white rounded-lg p-2"
                        dangerouslySetInnerHTML={{ __html: items[index] }}
                      />
                    )}
                  </motion.div>

                  <button onClick={next} className="absolute right-4 z-10 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 p-2 rounded-full transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {items.map((_: any, i: number) => (
                      <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i === index ? "bg-white" : "bg-zinc-700")} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 font-medium">No creations yet</p>
                  <p className="text-zinc-600 text-sm mt-1">Tap generate to start creating</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex-1 flex flex-col justify-center space-y-6 max-w-xl">
            <div className="space-y-3">
              <Label className="text-zinc-300 font-medium">Customize your {type}</Label>
              <Textarea
                placeholder={placeholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 min-h-[120px] resize-none focus:ring-purple-500/20 focus:border-purple-500/50 p-4 leading-relaxed"
              />
              <p className="text-xs text-zinc-500">
                Describe specific colors, styles, or elements you want to include.
                Leave empty for AI to decide based on your business profile.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={onGenerate}
                disabled={loading}
                className={`w-full h-14 text-base font-semibold bg-gradient-to-r ${gradient} hover:opacity-90 transition-opacity border-0 shadow-lg shadow-purple-900/20`}
              >
                {loading ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" /> Generating Magic...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" /> Generate {type === "logo" ? "Logos" : "Flyers"}
                  </>
                )}
              </Button>

              {items.length > 0 && (
                <Button
                  onClick={onSave}
                  variant="outline"
                  className="w-full h-12 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" /> Save & Download
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto min-h-screen bg-zinc-950 text-zinc-100">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            Ai Design Studio <Sparkles className="w-6 h-6 text-purple-500" />
          </h1>
          <p className="text-zinc-400">Generate professional assets for {business?.name || "your business"} instantly.</p>
        </div>

        {showNextStep && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 font-semibold text-sm">Assets Created!</p>
              <p className="text-emerald-500/70 text-xs">Ready for the next step?</p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/compliance")}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
            >
              Go to Compliance <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </motion.div>
        )}
      </div>

      <Tabs defaultValue="logo" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800 mb-8 p-1 h-12">
          <TabsTrigger value="logo" className="text-base data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Brand Logos</TabsTrigger>
          <TabsTrigger value="flyer" className="text-base data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Marketing Flyers</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="mt-0">
          <RenderCard
            type="logo"
            title="Brand Identity GEN"
            gradient="from-blue-600 to-violet-600"
            items={logos}
            index={logoIndex}
            next={nextLogo}
            prev={prevLogo}
            onGenerate={() => generateDesigns("logo")}
            onSave={() => handleDownloadAndSave(logos[logoIndex], "logo")}
            loading={loadingLogo}
            description={logoDescription}
            setDescription={setLogoDescription}
            placeholder="e.g. A minimalist geometric fox head, orange and black, circle background..."
          />
        </TabsContent>

        <TabsContent value="flyer" className="mt-0">
          <RenderCard
            type="flyer"
            title="Marketing Assets GEN"
            gradient="from-pink-600 to-rose-600"
            items={flyers}
            index={flyerIndex}
            next={nextFlyer}
            prev={prevFlyer}
            onGenerate={() => generateDesigns("flyer")}
            onSave={() => handleDownloadAndSave(flyers[flyerIndex], "flyer")}
            loading={loadingFlyer}
            description={flyerDescription}
            setDescription={setFlyerDescription}
            placeholder="e.g. Grand Opening Party for a Coffee Shop, 50% off drinks, cozy atmosphere..."
          />
        </TabsContent>
      </Tabs>

      {/* History Section */}
      <div className="pt-8 border-t border-zinc-900">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <History className="w-5 h-5 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Creation History</h2>
        </div>

        {assets && assets.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {assets.map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="group bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-600 transition-all duration-300"
              >
                <div className="aspect-square bg-zinc-950 p-4 flex items-center justify-center relative">
                  {item.asset_url?.includes('.svg') ? (
                    <img src={item.asset_url} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" alt={item.type} />
                  ) : (
                    <img
                      src={item.asset_url}
                      alt={item.type}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-white text-black hover:bg-zinc-200"
                      onClick={async () => {
                        try {
                          const response = await fetch(item.asset_url);
                          const blob = await response.blob();
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `${item.type}-${Date.now()}.${item.asset_url.includes('.svg') ? 'svg' : 'png'}`;
                          link.click();
                          URL.revokeObjectURL(url);
                          toast.success("Download started!");
                        } catch (error) {
                          console.error("Download error:", error);
                          toast.error("Failed to download");
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 border-t border-zinc-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-zinc-300 capitalize flex items-center gap-1.5">
                      {item.type === "logo" ? <Figma className="w-3 h-3 text-blue-400" /> : <TrendingUp className="w-3 h-3 text-pink-400" />}
                      {item.type}
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="w-full h-40 border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/20">
            <History className="w-8 h-8 mb-2 opacity-50" />
            <p>Your generation history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
