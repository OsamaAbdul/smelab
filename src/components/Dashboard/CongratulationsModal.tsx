import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";

const CongratulationsModal = ({ businessName, onClose, width, height }) => (
  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-95 p-10 rounded-xl shadow-lg">
    <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
    <div className="relative flex flex-col items-center justify-center text-center">
      <h2 className="text-4xl font-bold text-green-700">Congratulations!</h2>
      <p className="text-2xl mt-4">
        Your business <b>{businessName}</b> has been created!
      </p>
      <Button className="mt-6 bg-sme-orange text-white" onClick={onClose}>
        Close
      </Button>
    </div>
  </div>
);

export default CongratulationsModal;
