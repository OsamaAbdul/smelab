import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-zinc-950/80 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
              SME LAB
              <span className="text-sme-orange group-hover:text-orange-400">.ng</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-white/5"
              onClick={() => navigate("/auth/login")}
            >
              Sign In
            </Button>
            <Button
              className="bg-sme-orange hover:bg-orange-600 text-white px-6 rounded-full shadow-lg transition-transform hover:scale-105"
              onClick={() => navigate("/auth/signup")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl absolute left-0 right-0 top-20 shadow-2xl overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-300 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 pt-4 border-t border-white/5 mt-4 px-2">
                  <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-white hover:bg-white/5 w-full justify-start"
                    onClick={() => {
                      navigate("/auth/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-sme-orange hover:bg-orange-600 text-white w-full rounded-full"
                    onClick={() => {
                      navigate("/auth/signup");
                      setIsMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;