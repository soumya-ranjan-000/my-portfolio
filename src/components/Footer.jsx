import { FaLinkedin, FaFacebook, FaTwitter, FaGithub, FaEnvelope } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-dark-900 border-t border-white/5 py-8 mt-auto z-40 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-heading font-bold text-white mb-1">Soumya Ranjan</h3>
            <p className="text-slate-400 text-sm">Building digital experiences.</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <SocialLink href="https://linkedin.com" icon={<FaLinkedin />} label="LinkedIn" />
            <SocialLink href="https://github.com" icon={<FaGithub />} label="GitHub" />
            <SocialLink href="https://twitter.com" icon={<FaTwitter />} label="Twitter" />
            <SocialLink href="mailto:hello@example.com" icon={<FaEnvelope />} label="Email" />
          </div>

          {/* Copyright */}
          <div className="text-slate-500 text-sm">
            &copy; {currentYear} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// Simple internal helper for social links
const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-slate-400 hover:text-primary-400 transition-colors transform hover:scale-110 duration-200 text-xl"
    aria-label={label}
  >
    {icon}
  </a>
);

export default Footer;