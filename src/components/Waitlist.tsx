import React from 'react'
import { ArrowDown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Waitlist = () => {

// for the waitlist
const [email, setEmail] = useState("");
const [isSubmitted, setIsSubmitted] = useState(false);
const [error, setError] = useState("");


// handle form submit for waitlist

const handleSubmit = (e) => {
  e.preventDefault(); // prevent the page from reloading

   if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    };

    // api calls when the backend is ready

    console.log("Waitlist email:", email);
    setIsSubmitted(true);
    setEmail("");
    setError("");
   
    setTimeout(() => setIsSubmitted(false), 3000); // reset success message after a delay
};

  return (
    <div>
       {/* Waitlist Form */}
          <div className="mb-8 max-w-md mx-auto">
            {isSubmitted ? (
              <div className="flex items-center justify-center gap-2 text-sme-orange bg-sme-orange/20 backdrop-blur-sm border border-sme-orange/30 rounded-full px-4 py-2">
                <CheckCircle className="w-5 h-5" />
                <span>Thank you! You're on the waitlist.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full sm:w-auto flex-1 px-4 py-3 rounded-full border-2 border-sme-orange/50 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sme-orange transition-all duration-300"
                  aria-label="Email for waitlist"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-sme-orange hover:bg-sme-orange-800 text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Join Waitlist
                </Button>
              </form>
            )}
            {error && (
              <p className="text-red-400 text-sm mt-2" role="alert">
                {error}
              </p>
            )}
          </div>
    </div>
  )
}

export default Waitlist
