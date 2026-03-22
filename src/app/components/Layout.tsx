import { Outlet } from "react-router";
import { Link } from "react-router";
import { SideNav } from "./SideNav";
import { StatusBar } from "./StatusBar";
import { Footer } from "./Footer";
import { TechnicalDecorations } from "./TechnicalDecorations";
import { siteProfile } from "../data/portfolio";

export function Layout() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono selection:bg-[#ff003c] selection:text-white overflow-x-hidden">
      {/* Technical decorations overlay */}
      <TechnicalDecorations />
      
      {/* Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 0, 60, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Side Navigation */}
      <SideNav />
      
      {/* Status Bar */}
      <StatusBar />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-[#ff003c]/10">
        <div className="px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-white font-bold tracking-tighter text-xl group">
            STEPHEN<span className="text-[#ff003c]">_HOWE</span><span className="text-zinc-600 text-sm ml-2">V0.1</span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-mono uppercase tracking-widest">
            <Link to="/" className="text-[#ff003c] border-b-2 border-[#ff003c] pb-1 transition-all hover:skew-x-2">
              INDEX
            </Link>
            <a href="#case-studies" className="text-zinc-600 hover:text-[#ff003c] transition-all hover:skew-x-2">
              WORK
            </a>
            <a href="#software-skills" className="text-zinc-600 hover:text-[#ff003c] transition-all hover:skew-x-2">
              TOOLS
            </a>
            <a href="#contact" className="text-zinc-600 hover:text-[#ff003c] transition-all hover:skew-x-2">
              CONTACT
            </a>
          </div>
          <a
            href={siteProfile.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-[#ff003c] text-black px-4 py-1 font-bold text-xs tracking-widest uppercase transition-all hover:bg-[#8b0020] hover:text-white active:scale-95"
          >
            GITHUB
          </a>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff003c]/50 to-transparent" />
      </header>
      
      <main className="relative z-10 w-full lg:ml-20 pt-20">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  )
}
