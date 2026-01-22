import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/smelab_ng", label: "Facebook" },
    { icon: Twitter, href: "https://www.x.com/smelab_ng", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/smelab_ng", label: "Instagram" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/smelab_ng", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-zinc-950 border-t border-white/5 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand & Copyright */}
          <div className="text-center md:text-left">
            <div className="text-xl font-bold text-white mb-2">
              SME LAB<span className="text-sme-orange">.ng</span>
            </div>
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} SME LAB. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
