import { steps } from "./stepsData";

const Stepper = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex-1 h-2 mx-1 rounded-full ${
              step.id <= currentStep ? "bg-sme-orange" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-gray-600 text-sm">
        Step {currentStep} of {steps.length} — {steps[currentStep - 1].title}
      </p>
    </div>
  );
};

export default Stepper;
