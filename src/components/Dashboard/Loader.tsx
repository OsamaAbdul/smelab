


const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-start w-full min-h-screen pt-32 sm:pt-40">
  <div className="flex flex-col items-center gap-6 w-full">
    {/* Bouncing Dots */}
    <div className="flex justify-center gap-3">
      <span className="w-4 h-4 bg-sme-orange rounded-full animate-bounce"></span>
      <span className="w-4 h-4 bg-sme-orange rounded-full animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-4 h-4 bg-sme-orange rounded-full animate-bounce [animation-delay:-0.4s]"></span>
    </div>

    {/* Loading Text */}
    <p className="text-gray-600 font-medium text-center">
      Getting things ready...
    </p>
  </div>
</div>
    )
}

export default Loader;