import { ArrowDown, CheckCircle, Sparkles, Rocket, Lightbulb, TrendingUp, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import QuizModal from "./QuizModal";
import VideoModal from "./VideoModal";
import TrustIndicators from "./TrustIndicators";
import ParticleBackground from "./ParticleBackground";
import { useState } from "react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import IphoneMockup from "./IphoneMockup";

const HeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [businessIdea, setBusinessIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ name: string; slogan: string; score: number } | null>(null);

  const handleAnalyze = async () => {
    if (!businessIdea.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { businessIdea }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysisResult(data.result);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-zinc-950 text-white overflow-hidden pt-20 pb-12">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sme-blue-900/30 via-zinc-950 to-zinc-950 z-0"></div>
      <ParticleBackground />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <motion.div
            className="max-w-2xl text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}


            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
              Launch Your <br className="hidden md:block" /> Business
              <span className="block mt-2 bg-gradient-to-r from-sme-orange via-orange-400 to-amber-500 bg-clip-text text-transparent">
                In Minutes
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl mb-10 text-zinc-400 max-w-lg leading-relaxed font-light">
              Turn your idea into a registered brand instantly.
              <span className="text-zinc-200 font-medium"> SME LAB</span> uses advanced AI to handle your business Name, Slogan, and Market Analysis.
            </p>

            {/* Interactive AI Input Section */}
            <motion.div
              className="w-full max-w-xl mb-12 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sme-orange to-violet-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl ring-1 ring-white/5">
                  <Input
                    type="text"
                    placeholder="Describe your idea (e.g., 'Eco-friendly logistics')..."
                    className="flex-grow bg-transparent border-none text-white placeholder:text-zinc-500 focus-visible:ring-0 text-lg h-14 px-4"
                    value={businessIdea}
                    onChange={(e) => setBusinessIdea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold h-12 px-6 rounded-xl ml-2 shadow-xl transition-all duration-300"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <Rocket className="w-5 h-5 animate-pulse" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Generate <Sparkles className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                className="bg-white text-zinc-950 hover:bg-zinc-200 px-8 py-6 text-lg font-bold rounded-full shadow-2xl transition-all"
                onClick={() => setIsQuizOpen(true)}
              >
                Start Full Assessment
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border border-zinc-700 text-white bg-white/5 hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-full backdrop-blur-md transition-all group"
                onClick={() => setIsVideoOpen(true)}
              >
                <PlayCircle className="w-5 h-5 mr-2 group-hover:text-sme-orange transition-colors" /> Watch Demo
              </Button>
            </motion.div>

            <div className="mt-12">
              <TrustIndicators />
            </div>

          </motion.div>

          {/* Right Column: Visual (iPhone) */}
          <motion.div
            className="hidden lg:flex justify-center items-center relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            {/* Decorative Blobs behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sme-orange/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-3xl mix-blend-screen"></div>

            <IphoneMockup isAnalyzing={isAnalyzing} result={analysisResult} />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown className="w-6 h-6 text-white/30" />
      </motion.div>

      {/* Modals */}
      <QuizModal
        isQuizOpen={isQuizOpen}
        setIsQuizOpen={setIsQuizOpen}
        initialBusinessName={analysisResult?.name || businessIdea}
      />
      <VideoModal isVideoOpen={isVideoOpen} setIsVideoOpen={setIsVideoOpen} />
    </section>
  );
};

export default HeroSection;