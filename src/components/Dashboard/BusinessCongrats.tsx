import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface BusinessCongratsProps {
  businessName: string;
  onClose: () => void;
}

const BusinessCongrats = ({ businessName, onClose }: BusinessCongratsProps) => {
  const { width, height } = useWindowSize();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />

      <div className="relative w-full max-w-md bg-zinc-900/90 border border-white/10 p-8 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-300">
        {/* Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>

        <div className="relative flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center ring-1 ring-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Congratulations!</h2>
            <p className="text-zinc-400">
              Your business <span className="text-white font-semibold">{businessName}</span> has been successfully created.
            </p>
          </div>

          <Button
            className="w-full h-12 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-xl"
            onClick={onClose}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BusinessCongrats;