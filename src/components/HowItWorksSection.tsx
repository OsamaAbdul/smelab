import { Brain, Users, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Deep market analysis and strategic recommendations powered by advanced AI algorithms.",
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-600/5"
  },
  {
    icon: Users,
    title: "Human Expertise",
    description: "Expert consultants provide specific guidance on legal compliance and nuanced strategy.",
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-600/5"
  },
  {
    icon: Zap,
    title: "Rapid Execution",
    description: "Streamlined processes that take you from idea to fully registered business in days.",
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-600/5"
  }
];

const steps = [
  {
    number: "01",
    title: "Share Your Idea",
    description: "Input your business concept and goals into our smart platform."
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Get instant viability scores, names, and a generated business plan."
  },
  {
    number: "03",
    title: "Expert Review",
    description: "Our consultants verify compliance and refine your strategy."
  },
  {
    number: "04",
    title: "Launch & Grow",
    description: "Receive your registration documents and marketing assets."
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden" id="how-it-works">
      {/* Background Elements */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Intro Section */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 mb-6"
          >
            The Perfect Blend
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            We combine the speed of AI with the wisdom of human experts to give you the ultimate launchpad.
          </motion.p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <Card className="bg-zinc-900/40 backdrop-blur-md border-zinc-800 hover:border-zinc-700 transition-colors h-full overflow-hidden group">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Process Flow */}
        <div className="relative">
          <div className="text-center mb-16">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-white mb-4"
            >
              Your Journey to Success
            </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.5rem] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-zinc-800 via-blue-500/50 to-zinc-800 z-0" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-zinc-950 border-4 border-zinc-900 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] group hover:border-blue-500/50 transition-colors duration-300">
                  <span className="text-2xl font-bold text-zinc-500 group-hover:text-blue-400 transition-colors">{step.number}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                <p className="text-zinc-400 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
