
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Waitlist from "./Waitlist";

const benefits = [
  "Free business name availability check",
  "AI-powered business plan starter",
  "Industry-specific onboarding checklist",
  "Access to expert consultants",
  "Marketing materials templates",
  "Compliance guidance and reminders"
];

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-sme-blue-900 to-sme-blue-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-sme-orange rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Launch Your Business?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Join the SME LAB community and get everything you need to start, grow, and scale your business across Africa.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center text-left">
                <CheckCircle className="w-5 h-5 text-sme-orange mr-3 flex-shrink-0" />
                <span className="text-blue-100">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="bg-sme-orange hover:bg-sme-orange-800 text-white px-10 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-red text-black hover:bg-blue hover:text-sme-blue px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Schedule Demo
            </Button>
          </div>

          <Waitlist />
          {/* Additional Info */}
          <div className="text-center text-blue-200">
            <p className="text-sm mb-2">✨ No credit card required • 14-day free trial • Cancel anytime</p>
            <p className="text-xs">
              🌍 Available across Nigeria, Ghana, Kenya, and South Africa
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-current text-white">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default CTASection;
