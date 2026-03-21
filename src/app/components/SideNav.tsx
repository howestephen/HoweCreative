import { MapPin, Activity, Database, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function SideNav() {
  const [activeSection, setActiveSection] = useState('hero');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  const navItems = [
    { id: 'hero', icon: MapPin, label: 'INTRO', tooltip: 'Jump to introduction' },
    { id: 'case-studies', icon: Activity, label: 'WORK', tooltip: 'View case studies' },
    { id: 'software-skills', icon: Database, label: 'SKILLS', tooltip: 'See software arsenal' },
    { id: 'contact', icon: Terminal, label: 'LINK', tooltip: 'Get in touch' },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full z-40 flex-col items-center py-24 bg-[#050505] w-20 border-r border-[#ff003c]/10">
      <div className="flex flex-col gap-8 items-center">
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`p-2 cursor-pointer relative group transition-all ${
                isActive ? 'bg-[#8b0020] text-[#ff003c]' : 'text-zinc-600 hover:text-[#ff003c]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={item.tooltip}
            >
              <Icon className="w-6 h-6" />
              <span className="block font-mono text-[8px] mt-1 text-center uppercase tracking-wider">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#ff003c]" />
              )}
              
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                <div className="bg-black border border-[#ff003c]/40 px-3 py-2 text-xs font-mono text-white">
                  {item.tooltip}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#ff003c]/40" />
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Contact button at bottom */}
        <motion.button
          onClick={() => scrollToSection('contact')}
          className={`mt-auto p-2 cursor-pointer transition-all group ${
            activeSection === 'contact' ? 'bg-[#8b0020] text-[#ff003c]' : 'text-zinc-600 hover:text-[#ff003c]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Get in touch"
        >
          <Terminal className="w-6 h-6" />
          <span className="block font-mono text-[8px] mt-1 text-center uppercase tracking-wider">
            LINK
          </span>
        </motion.button>
      </div>

      {/* Live status indicator */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="w-2 h-2 bg-[#ff003c] animate-pulse rounded-full shadow-[0_0_8px_#ff003c]" />
        <span className="font-mono text-[7px] text-zinc-600 uppercase [writing-mode:vertical-rl] rotate-180">
          ONLINE_NOW
        </span>
      </div>
    </aside>
  );
}