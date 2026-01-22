import { FileText, Palette, Share2, Bell, TrendingUp, Search, CheckSquare, Rocket, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: FileText,
    title: "CAC Business Registration",
    description: "Get your business registered with CAC support and compliance guidance from our human experts.",
    type: "Human-Assisted",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Rocket,
    title: "Business Plan Generator",
    description: "AI-powered business plan and pitch deck creation tailored to your industry and goals.",
    type: "AI-Powered",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Palette,
    title: "Logo & Brand Design",
    description: "Generate professional logos and brand colors that reflect your business identity.",
    type: "AI-Powered",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Share2,
    title: "Social Media Name Suggestions",
    description: "AI-powered name generator that checks availability across all major social platforms.",
    type: "AI-Powered",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Weekly Marketing Flyers",
    description: "Create stunning marketing materials with AI that converts prospects into customers.",
    type: "AI-Powered",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    icon: Bell,
    title: "Compliance Reminders",
    description: "Never miss important deadlines with automated reminders.",
    type: "Automated",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Search,
    title: "Market Research",
    description: "Get comprehensive market insights and competitor analysis.",
    type: "AI-Powered",
    gradient: "from-indigo-400 to-blue-500",
  },
  {
    icon: CheckSquare,
    title: "Smart Onboarding",
    description: "Industry-specific checklists for setup.",
    type: "Personalized",
    gradient: "from-teal-400 to-cyan-500",
  }
];

const FeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-32 bg-zinc-950 relative overflow-hidden" id="features">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10" ref={containerRef}>
        <div className="text-center mb-24">

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-6"
          >
            AI Efficiency Meets <br /> Human Expertise
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            A comprehensive suite of tools designed to support every aspect of your business journey, from launch to growth.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Central Line */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-800 md:-translate-x-1/2">
            <motion.div
              style={{ height: lineHeight }}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"
            />
          </div>

          <div className="space-y-12 md:space-y-24">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-center ${index % 2 === 0 ? "md:flex-row-reverse md:text-right" : ""
                  }`}
              >
                {/* Dot on the timeline */}
                <div className="absolute left-[11px] md:left-1/2 top-8 w-5 h-5 rounded-full bg-zinc-950 border-4 border-zinc-800 z-20 md:-translate-x-1/2 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:border-blue-500 transition-colors duration-500">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>

                {/* Content Half */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"}`}>
                  <div className={`hidden md:flex items-center gap-4 mb-4 ${index % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  {/* Mobile Title */}
                  <div className="md:hidden flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold tracking-wide uppercase bg-zinc-900 border border-zinc-800 ${feature.type === 'AI-Powered' ? 'text-purple-400' :
                    feature.type === 'Human-Assisted' ? 'text-blue-400' :
                      feature.type === 'Automated' ? 'text-amber-400' :
                        'text-teal-400'
                    }`}>
                    {feature.type}
                  </span>
                </div>

                {/* Card/Visual Half */}
                <div className="w-full md:w-1/2 pl-12 md:pl-0">
                  <div className="group relative">
                    <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500`} />
                    <Card className="relative bg-zinc-900/40 backdrop-blur-xl border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden">
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-full`} />
                      <CardContent className="p-6 md:p-8 flex items-center gap-6">
                        <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5`}>
                          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                            <feature.icon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="h-2 w-24 bg-zinc-800 rounded-full mb-3" />
                          <div className="h-2 w-16 bg-zinc-800 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
