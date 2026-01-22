import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const QuizContent = ({ quizStep, setQuizStep, quizAnswers, setQuizAnswers, resetQuiz }) => {
  const navigate = useNavigate();
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const handleQuizAnswer = (step, answer) => {
    setQuizAnswers((prev) => ({ ...prev, ...answer }));
    setQuizStep(step + 1);
  };

  const handleBack = () => {
    if (quizStep > 1) {
      setQuizStep(quizStep - 1);
    }
  };

  const handleRedirectToAuth = () => {
    // Save quiz answers to localStorage for retrieval after login
    localStorage.setItem('sme_quiz_data', JSON.stringify(quizAnswers));
    // Redirect to signup page
    navigate("/auth/signup");
  };

  const totalSteps = quizAnswers.businessStatus === "new" ? 4 : 5;

  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Progress Indicator */}
      <div className="flex justify-center gap-3 mb-6">
        {[...Array(totalSteps)].map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${index < quizStep ? "bg-sme-orange" : "bg-gray-300"
              }`}
          />
        ))}
      </div>

      {/* Step 1: New or Existing Business */}
      {quizStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">
            Is your business new or existing?
          </h2>
          <div className="flex justify-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleQuizAnswer(1, { businessStatus: "new" })}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                New Business
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleQuizAnswer(1, { businessStatus: "old" })}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                Existing Business
              </Button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Step 2: Existing Business - Is it registered? */}
      {quizStep === 2 && quizAnswers.businessStatus === "old" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">
            Is your business registered?
          </h2>
          <div className="flex justify-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleQuizAnswer(2, { isRegistered: true })}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                Yes
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleQuizAnswer(2, { isRegistered: false })}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                No
              </Button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Step 2: New Business - Enter business name */}
      {quizStep === 2 && quizAnswers.businessStatus === "new" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">
            Suggest a name for your new business
          </h2>
          <input
            type="text"
            value={quizAnswers.businessName || ""}
            onChange={(e) =>
              setQuizAnswers((prev) => ({ ...prev, businessName: e.target.value }))
            }
            placeholder="Enter business name"
            className="w-full p-4 text-lg rounded-full bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sme-orange"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => quizAnswers.businessName && handleQuizAnswer(2, {})}
              disabled={!quizAnswers.businessName}
              className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg disabled:opacity-50"
            >
              Submit
            </Button>
          </motion.div>
        </div>
      )}

      {/* Step 3: New Business - Create a logo? */}
      {quizStep === 3 && quizAnswers.businessStatus === "new" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">
            Would you like to create a logo for {quizAnswers.businessName}?
          </h2>
          <div className="flex justify-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  handleQuizAnswer(3, { wantsLogo: true });
                  handleRedirectToAuth(); // Redirect to login/signup
                }}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                Yes
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleQuizAnswer(3, { wantsLogo: false })}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                No
              </Button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Step 3: Existing Business, Registered - Has a logo? */}
      {quizStep === 3 && quizAnswers.businessStatus === "old" && quizAnswers.isRegistered && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">
            Does your business have a logo?
          </h2>
          <div className="flex justify-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleQuizAnswer(3, { hasLogo: true })}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                Yes
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleQuizAnswer(3, { hasLogo: false })}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                No
              </Button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Step 3: Existing Business, Not Registered - Need registration assistance? */}
      {quizStep === 3 && quizAnswers.businessStatus === "old" && !quizAnswers.isRegistered && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">
            Do you need assistance with registering your business?
          </h2>
          <div className="flex justify-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  handleQuizAnswer(3, { needsRegistrationAssistance: true });
                  handleRedirectToAuth(); // Redirect to login/signup
                }}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                Yes
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleQuizAnswer(3, { needsRegistrationAssistance: false })}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                No
              </Button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Step 4: New Business - Thank You (after logo question) */}
      {quizStep === 4 && quizAnswers.businessStatus === "new" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">Thank you!</h2>
          <p className="text-center text-white text-lg">
            Your responses have been recorded.
          </p>
          <p className="text-center text-white text-lg">
            Business Status: New
            <br />
            Business Name: {quizAnswers.businessName}
            <br />
            Create Logo: {quizAnswers.wantsLogo ? "Yes" : "No"}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={resetQuiz}
              className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
            >
              Close
            </Button>
          </motion.div>
        </div>
      )}

      {/* Step 4: Existing Business, Registered, Has Logo - Login/Signup Prompt */}
      {quizStep === 4 && quizAnswers.businessStatus === "old" && quizAnswers.isRegistered && quizAnswers.hasLogo && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">
            Please login or signup to continue
          </h2>
          <p className="text-center text-white text-lg">
            Your business is registered and has a logo. Login or create an account to proceed with your business setup.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleRedirectToAuth}
              className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
            >
              Login / Signup
            </Button>
          </motion.div>
        </div>
      )}

      {/* Step 4: Existing Business, Registered, No Logo - Create Logo? */}
      {quizStep === 4 && quizAnswers.businessStatus === "old" && quizAnswers.isRegistered && !quizAnswers.hasLogo && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">
            Would you like to create a logo for your business?
          </h2>
          <div className="flex justify-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  handleQuizAnswer(4, { wantsLogo: true });
                  handleRedirectToAuth(); // Redirect to login/signup
                }}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                Yes
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleQuizAnswer(4, { wantsLogo: false })}
                className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
              >
                No
              </Button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Step 4: Existing Business, Not Registered - Thank You */}
      {quizStep === 4 && quizAnswers.businessStatus === "old" && !quizAnswers.isRegistered && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">Thank you!</h2>
          <p className="text-center text-white text-lg">
            Your responses have been recorded.
          </p>
          <p className="text-center text-white text-lg">
            Business Status: Existing
            <br />
            Registered: No
            <br />
            Registration Assistance: {quizAnswers.needsRegistrationAssistance ? "Yes" : "No"}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={resetQuiz}
              className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
            >
              Close
            </Button>
          </motion.div>
        </div>
      )}

      {/* Step 5: Existing Business, Registered, No Logo - Thank You */}
      {quizStep === 5 && quizAnswers.businessStatus === "old" && quizAnswers.isRegistered && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">Thank you!</h2>
          <p className="text-center text-white text-lg">
            Your responses have been recorded.
          </p>
          <p className="text-center text-white text-lg">
            Business Status: Existing
            <br />
            Registered: Yes
            <br />
            Has Logo: {quizAnswers.hasLogo ? "Yes" : "No"}
            <br />
            {!quizAnswers.hasLogo && `Create Logo: ${quizAnswers.wantsLogo ? "Yes" : "No"}`}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={resetQuiz}
              className="bg-gradient-to-r from-sme-orange to-orange-600 hover:from-orange-600 hover:to-sme-orange text-white px-8 py-4 text-lg rounded-full shadow-lg"
            >
              Close
            </Button>
          </motion.div>
        </div>
      )}

      {/* Back Button */}
      {quizStep > 1 && quizStep < (quizAnswers.isRegistered ? (quizAnswers.hasLogo ? 4 : 5) : 4) && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleBack}
            className="bg-transparent border border-gray-300 text-white px-8 py-4 text-lg rounded-full hover:bg-gray-300/20"
          >
            Back
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuizContent;