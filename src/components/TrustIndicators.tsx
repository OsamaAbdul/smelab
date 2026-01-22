import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const TrustIndicators = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-300">
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <CheckCircle className="w-5 h-5 text-sme-orange" />
        <span>500+ Businesses Launched</span>
      </motion.div>
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <CheckCircle className="w-5 h-5 text-sme-orange" />
        <span>CAC Registered Partner</span>
      </motion.div>
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <CheckCircle className="w-5 h-5 text-sme-orange" />
        <span>24/7 Support</span>
      </motion.div>
    </div>
  );
};

export default TrustIndicators;