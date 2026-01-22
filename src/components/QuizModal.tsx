import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizContent from "./QuizContent";

const QuizModal = ({ isQuizOpen, setIsQuizOpen, initialBusinessName = '' }) => {
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({
    businessStatus: null,
    isRegistered: null,
    hasLogo: null,
    businessName: initialBusinessName,
  });

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const resetQuiz = () => {
    setQuizStep(1);
    setQuizAnswers({
      businessStatus: null,
      isRegistered: null,
      hasLogo: null,
      businessName: '',
    });
    setIsQuizOpen(false);
  };

  return (
    <AnimatePresence>
      {isQuizOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-xl w-full relative text-white border border-white/20"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              onClick={resetQuiz}
              className="absolute top-4 right-4 text-3xl font-bold text-white hover:text-sme-orange"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              &times;
            </motion.button>
            <QuizContent
              quizStep={quizStep}
              setQuizStep={setQuizStep}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              resetQuiz={resetQuiz}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizModal;