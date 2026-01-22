import { Star, Quote, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

const testimonials = [
  {
    name: "Adebayo Ogundimu",
    position: "CEO, TechStart Lagos",
    content: "SME LAB helped me navigate the complex CAC registration process seamlessly. The combination of AI tools for branding and human support for legal matters was exactly what I needed.",
    rating: 5,
    avatar: "AO",
    location: "Lagos, Nigeria",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    name: "Fatima Mohammed",
    position: "Founder, Halal Delights",
    content: "The AI-generated marketing flyers have doubled my customer engagement on social media. The food industry templates were spot-on, and compliance reminders keep me on track.",
    rating: 5,
    avatar: "FM",
    location: "Abuja, Nigeria",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    name: "Kwame Asante",
    position: "Owner, Asante Crafts",
    content: "From business name suggestions to logo design, SME LAB's AI tools saved me thousands of naira and weeks of time. The human consultants guided me through export documentation perfectly.",
    rating: 5,
    avatar: "KA",
    location: "Accra, Ghana",
    gradient: "from-orange-500 to-red-500"
  }
];

const stats = [
  { number: "500+", label: "Businesses Launched" },
  { number: "98%", label: "Success Rate" },
  { number: "30+", label: "Industries Covered" },
  { number: "24/7", label: "Support Available" }
];

const brands = ["CAC", "SMEDAN", "NITDA", "NCC", "LSETF", "PAYSTACK", "FLUTTERWAVE", "INTERSWITCH"];

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-zinc-800 bg-zinc-900/50 overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div>{children}</div>
    </div>
  );
}

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden" id="testimonials">
      {/* Ambient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 border-b border-white/5 pb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-2 group-hover:from-blue-400 group-hover:to-blue-200 transition-all duration-300">
                {stat.number}
              </div>
              <div className="text-zinc-500 font-medium text-sm md:text-base group-hover:text-white transition-colors">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 border border-blue-500/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Trusted by Builders</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Don't just take our word for it
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            Join hundreds of successful business owners who chose SME LAB to launch and grow their ventures across Africa.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <SpotlightCard className="h-full hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                <CardContent className="p-8 flex flex-col h-full relative z-10">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
                    ))}
                  </div>

                  <Quote className="w-10 h-10 text-zinc-800 mb-4 opacity-50 absolute right-8 top-8" />

                  <p className="text-zinc-300 leading-relaxed mb-8 flex-grow">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} p-0.5`}>
                      <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {testimonial.avatar}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-zinc-500">{testimonial.position}</p>
                    </div>
                  </div>
                </CardContent>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Marquee Section */}
        <div className="mt-24 pt-12 border-t border-white/5">
          <p className="text-zinc-500 text-sm mb-8 uppercase tracking-widest font-semibold text-center">Powering Next-Gen Businesses With</p>

          <div className="relative flex overflow-x-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

            <motion.div
              className="flex gap-16 items-center whitespace-nowrap py-4"
              animate={{ x: [0, -1000] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 20
              }}
            >
              {[...brands, ...brands, ...brands].map((brand, i) => (
                <div key={i} className="text-2xl font-bold text-zinc-700 hover:text-white transition-colors cursor-default">
                  {brand}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
