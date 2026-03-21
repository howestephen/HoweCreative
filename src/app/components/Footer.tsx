import { useState } from 'react';
import { Github, Linkedin, Mail, Download, Send } from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a newsletter service
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };

  const socialLinks = [
    { icon: Github, label: 'GitHub', href: 'https://github.com', color: '#ff003c' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com', color: '#ff4466' },
    { icon: Mail, label: 'Email', href: 'mailto:hello@example.com', color: '#ff6b88' },
  ];

  return (
    <footer id="contact" className="w-full py-12 px-8 bg-[#050505] border-t border-[#ff003c]/20 relative overflow-hidden">
      {/* Graph paper background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 0, 60, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.5) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About section */}
          <div>
            <h3 className="text-white font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
              SYS_ARCH_V1.0
            </h3>
            <p className="text-zinc-500 text-sm font-mono leading-relaxed mb-4">
              Systems/Product Designer specializing in prototype design, 3D/motion graphics, and AI-assisted workflows.
            </p>
            <motion.a
              href="#"
              download
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff003c]/10 border border-[#ff003c]/30 text-[#ff003c] text-xs font-mono uppercase hover:bg-[#ff003c]/20 transition-all"
            >
              <Download className="w-3 h-3" />
              Download Resume
            </motion.a>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
              Quick_Access
            </h3>
            <nav className="space-y-2 font-mono text-sm">
              <button 
                onClick={() => document.getElementById('case-studies')?.scrollIntoView({ behavior: 'smooth' })}
                className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200"
              >
                &gt; Case Studies
              </button>
              <button 
                onClick={() => document.getElementById('software-skills')?.scrollIntoView({ behavior: 'smooth' })}
                className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200"
              >
                &gt; Software Skills
              </button>
              <a href="#" className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200">
                &gt; Process & Workflow
              </a>
              <a href="#" className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200">
                &gt; About Me
              </a>
            </nav>
          </div>

          {/* Newsletter signup */}
          <div>
            <h3 className="text-white font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
              Stay_Connected
            </h3>
            <p className="text-zinc-500 text-xs font-mono mb-4">
              Get notified about new projects and design insights
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-black/60 border border-[#ff003c]/20 px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff003c]/60 transition-colors"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#ff003c] text-black px-3 py-2 font-mono text-xs uppercase font-bold hover:bg-[#ff4466] transition-colors"
              >
                {isSubmitted ? '✓' : <Send className="w-4 h-4" />}
              </motion.button>
            </form>
            {isSubmitted && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#ff003c] text-xs font-mono mt-2"
              >
                &gt; Subscribed successfully!
              </motion.p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#ff003c]/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
            ©2026_FORENSIC_DESIGNER_RECONSTRUCTION
          </div>

          {/* Social links */}
          <div className="flex gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative"
                  title={social.label}
                >
                  <div className="w-10 h-10 bg-black/60 border border-[#ff003c]/20 flex items-center justify-center hover:border-[#ff003c]/60 transition-all">
                    <Icon className="w-4 h-4 text-zinc-600 group-hover:text-[#ff003c] transition-colors" />
                  </div>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity blur-md"
                    style={{ backgroundColor: social.color }}
                  />
                </motion.a>
              );
            })}
          </div>

          {/* Live status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ff003c] animate-pulse rounded-full shadow-[0_0_8px_#ff003c]" />
            <span className="font-mono text-[10px] tracking-widest text-[#ff003c] uppercase">
              UPLINK_STABLE
            </span>
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[100px] bg-[#ff003c]/5 blur-[80px] pointer-events-none" />
    </footer>
  );
}