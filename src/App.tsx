import React, { useState, useEffect, useRef } from "react";
import { 
  User, Calendar, Ruler, Scale, Heart, MapPin, Home, Phone, 
  GraduationCap, Briefcase, Users, Printer, FileCode, Sparkles, 
  Settings, ChevronLeft, ChevronRight, Check, Eye, EyeOff, BookOpen,
  Mail, ExternalLink, Globe, Layout, ArrowRight, Download, Menu, Lock, X, AlertCircle, Loader2
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { SAMPLE_BIODATA, THEME_PRESETS, ANIMATION_PRESETS } from "./data";
import { Biodata, ThemeConfig, AnimationPreset } from "./types";
import { ScrollSection } from "./components/ScrollAnimations";
import { EditorPanel } from "./components/EditorPanel";
import { Tilt3D } from "./components/Tilt3D";
import { ImageLightbox } from "./components/ImageLightbox";

export default function App() {
  const [biodata, setBiodata] = useState<Biodata>(() => {
    const saved = localStorage.getItem("matrimonial_biodata_details");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved biodata", e);
      }
    }
    return SAMPLE_BIODATA;
  });

  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(() => {
    const savedThemeId = localStorage.getItem("matrimonial_biodata_theme");
    if (savedThemeId) {
      const found = THEME_PRESETS.find(t => t.id === savedThemeId);
      if (found) return found;
    }
    return THEME_PRESETS[0]; // Default to Artistic Flair!
  });

  const [activeAnimation, setActiveAnimation] = useState<AnimationPreset>(() => {
    const savedAnimId = localStorage.getItem("matrimonial_biodata_animation");
    if (savedAnimId) {
      const found = ANIMATION_PRESETS.find(a => a.id === savedAnimId);
      if (found) return found;
    }
    return ANIMATION_PRESETS[3]; // Default to 3D Perspective Reveal!
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isEditorOpen, setIsEditorOpen] = useState(false); // Default to FALSE for guest site
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("profile");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Track window scroll for progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for highlighting active section in sidebar
  useEffect(() => {
    const sections = ["profile", "personal", "education", "family", "maternal", "gallery"];
    const observers = sections.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.25, rootMargin: "-10% 0px -40% 0px" }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach(obs => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [biodata]);

  // Load initial biodata from database API on mount
  useEffect(() => {
    fetch("/api/biodata")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch biodata");
        return res.json();
      })
      .then(data => {
        if (data && typeof data === "object" && (data.personal || data.qualifications)) {
          setBiodata(data);
          localStorage.setItem("matrimonial_biodata_details", JSON.stringify(data));
        }
      })
      .catch(err => {
        console.warn("Could not fetch from database, falling back to local storage:", err);
      });
  }, []);

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all details back to the default sample data?")) {
      setBiodata(SAMPLE_BIODATA);
      fetch("/api/biodata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(SAMPLE_BIODATA)
      })
      .then(() => {
        localStorage.setItem("matrimonial_biodata_details", JSON.stringify(SAMPLE_BIODATA));
      })
      .catch(err => console.error("Failed to save reset data to database", err));
    }
  };

  const handleSaveData = () => {
    setSaveStatus("saving");
    try {
      localStorage.setItem("matrimonial_biodata_details", JSON.stringify(biodata));
      localStorage.setItem("matrimonial_biodata_theme", activeTheme.id);
      localStorage.setItem("matrimonial_biodata_animation", activeAnimation.id);

      fetch("/api/biodata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(biodata)
      })
      .then(res => {
        if (!res.ok) throw new Error("Save to database failed");
        return res.json();
      })
      .then(resData => {
        if (resData && resData.data) {
          setBiodata(resData.data);
          localStorage.setItem("matrimonial_biodata_details", JSON.stringify(resData.data));
        }
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to save to database", err);
        // Show saved status anyway because localStorage succeeded
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      });
    } catch (e) {
      console.error("Failed to save matrimonial biodata details", e);
      setSaveStatus("idle");
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (biodata.pdfFileData) {
      const link = document.createElement("a");
      link.href = biodata.pdfFileData;
      const sanitizeName = biodata.personal?.fullName
        ? biodata.personal.fullName.trim().replace(/[^a-zA-Z0-9_-]/g, "_")
        : "Biodata";
      const fileName = biodata.pdfFileName || `${sanitizeName}_Matrimonial.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const element = document.getElementById("printable-biodata-content");
      if (!element) {
        window.print();
        return;
      }

      // Capture the rendered biodata shell with html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#09090b",
        logging: false,
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const sanitizeName = biodata.personal?.fullName
        ? biodata.personal.fullName.trim().replace(/[^a-zA-Z0-9_-]/g, "_")
        : "Biodata";
      pdf.save(`${sanitizeName}_Matrimonial_Biodata.pdf`);
    } catch (err) {
      console.error("PDF generation error, falling back to browser print:", err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === "7001om18@gmail.com" && passwordInput === "M@14i25A") {
      setIsAdminLoggedIn(true);
      setIsEditorOpen(true);
      setIsLoginModalOpen(false);
      setLoginError("");
      setUsernameInput("");
      setPasswordInput("");
    } else {
      setLoginError("Incorrect credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e0e0e0] font-sans flex relative overflow-x-hidden">
      
      {/* 1. SCROLL PROGRESS BAR */}
      <div 
        className="fixed top-0 left-0 h-1 z-50 transition-all duration-100 ease-out no-print"
        style={{ 
          width: `${scrollProgress}%`, 
          backgroundColor: activeTheme.id === "rose-gold-dark" ? "#f59e0b" : "#6366f1"
        }}
      />

      {/* 2. CUSTOMIZATION PANEL SIDEBAR (COLLAPSIBLE) */}
      {isAdminLoggedIn && (
        <div 
          className={`fixed inset-y-0 left-0 z-40 w-80 md:w-96 transform transition-transform duration-300 ease-in-out no-print shadow-2xl ${
            isEditorOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <EditorPanel
            biodata={biodata}
            setBiodata={setBiodata}
            themes={THEME_PRESETS}
            activeTheme={activeTheme}
            setActiveTheme={setActiveTheme}
            animations={ANIMATION_PRESETS}
            activeAnimation={activeAnimation}
            setActiveAnimation={setActiveAnimation}
            onReset={handleResetData}
            onPrint={handleDownloadPDF}
            onSave={handleSaveData}
            saveStatus={saveStatus}
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setIsEditorOpen(false);
            }}
          />
        </div>
      )}

      {/* 3. SIDEBAR TOGGLE BUTTON / ADMIN LOGIN PORTAL TRIGGER */}
      <button
        onClick={() => {
          if (isAdminLoggedIn) {
            setIsEditorOpen(!isEditorOpen);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        className={`fixed bottom-6 right-6 lg:left-6 lg:right-auto z-50 p-3.5 rounded-full bg-zinc-950 border border-zinc-800/80 text-white shadow-2xl hover:bg-zinc-900 transition-all duration-300 cursor-pointer no-print flex items-center justify-center group`}
        title={isAdminLoggedIn ? (isEditorOpen ? "Collapse Control Center" : "Expand Customizer") : "Admin Login Portal"}
      >
        {isAdminLoggedIn && isEditorOpen ? (
          <ChevronLeft className="w-5 h-5 text-zinc-300 lg:rotate-0 rotate-180" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Settings className={`w-5 h-5 ${activeTheme.id === 'artistic-flair' ? 'text-sky-400' : 'text-indigo-400'} animate-spin-slow`} />
            {!isAdminLoggedIn && (
              <Lock className="w-2.5 h-2.5 text-zinc-400 absolute -bottom-1 -right-1" />
            )}
          </div>
        )}
      </button>

      {/* 3.1 FLOATING DOWNLOAD PDF BUTTON */}
      <button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPdf}
        className="fixed top-6 right-6 z-40 px-4 py-2.5 rounded-full bg-zinc-950/90 border border-zinc-800/80 text-white shadow-2xl hover:bg-zinc-900/95 backdrop-blur-md transition-all duration-300 cursor-pointer no-print flex items-center gap-2 group text-xs font-mono uppercase tracking-wider font-semibold disabled:opacity-70"
        title="Download Matrimonial Biodata as PDF"
      >
        {isGeneratingPdf ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        ) : (
          <Download className={`w-4 h-4 ${activeTheme.primaryClass} group-hover:scale-110 transition-transform duration-300`} />
        )}
        <span>{isGeneratingPdf ? "Generating PDF..." : "Download PDF"}</span>
      </button>

      {/* 4. MAIN PREVIEW CANVAS AREA */}
      <div 
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out no-print ${
          isAdminLoggedIn && isEditorOpen ? "pl-0 lg:pl-80 xl:pl-96" : "pl-0"
        }`}
      >
        {/* Dynamic Background Glowing Orbs matching active theme */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div 
            className="absolute -top-40 -right-40 w-96 md:w-[600px] h-96 md:h-[600px] rounded-full ambient-glow transition-all duration-1000"
            style={{ 
              backgroundColor: activeTheme.id === "rose-gold-dark" ? "rgba(244, 63, 94, 0.08)" : 
                               activeTheme.id === "neon-emerald" ? "rgba(16, 185, 129, 0.08)" : 
                               "rgba(99, 102, 241, 0.08)"
            }}
          />
          <div 
            className="absolute top-[40%] -left-40 w-80 md:w-[500px] h-80 md:h-[500px] rounded-full ambient-glow transition-all duration-1000"
            style={{ 
              backgroundColor: activeTheme.id === "rose-gold-dark" ? "rgba(245, 158, 11, 0.06)" : 
                               activeTheme.id === "cyan-vapor" ? "rgba(6, 182, 212, 0.08)" : 
                               "rgba(139, 92, 246, 0.06)"
            }}
          />
          <div 
            className="absolute bottom-40 right-20 w-80 md:w-[450px] h-80 md:h-[450px] rounded-full ambient-glow transition-all duration-1000"
            style={{ 
              backgroundColor: activeTheme.id === "rose-gold-dark" ? "rgba(244, 63, 94, 0.05)" : 
                               activeTheme.id === "neon-emerald" ? "rgba(16, 185, 129, 0.05)" : 
                               "rgba(6, 182, 212, 0.06)"
            }}
          />
        </div>

        {/* Outer Grid Canvas Decor */}
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none z-0" />

        {/* Dynamic Background Watermark Text running diagonally from bottom-left to top-right */}
        {biodata.watermarkText && (
          <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 flex items-center justify-center">
            <div 
              className="text-[14vw] md:text-[16vw] font-black tracking-widest uppercase whitespace-nowrap select-none pointer-events-none font-sans opacity-[0.035] -rotate-[35deg] transition-all duration-500"
              style={{
                background: activeTheme.id === "rose-gold-dark" 
                  ? "linear-gradient(135deg, rgba(244, 63, 94, 0.4) 0%, rgba(245, 158, 11, 0.4) 100%)"
                  : activeTheme.id === "neon-emerald"
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(52, 211, 153, 0.4) 100%)"
                  : "linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {biodata.watermarkText}
            </div>
          </div>
        )}

        {/* Floating Quick Navigation Anchor (Floating Right) */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-35 hidden xl:flex flex-col gap-3.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-900 backdrop-blur-md">
          {[
            { id: "profile", label: "01 // Profile" },
            { id: "personal", label: "02 // Details" },
            { id: "education", label: "03 // Qualifications" },
            { id: "family", label: "04 // Family" },
            { id: "maternal", label: "05 // Maternal" },
            { id: "gallery", label: "06 // Portfolio" }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => scrollToId(section.id)}
              className="text-left group flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <div 
                className={`w-1.5 h-6 rounded-full transition-all duration-300 ${
                  activeSection === section.id 
                    ? `bg-gradient-to-b ${activeTheme.id === 'rose-gold-dark' ? 'from-amber-400 to-rose-400' : 'from-indigo-400 to-cyan-400'} h-8` 
                    : "bg-zinc-800 group-hover:bg-zinc-600"
                }`}
              />
              <span 
                className={`text-4xs font-mono tracking-widest uppercase transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 ${
                  activeSection === section.id ? "text-white opacity-100" : "text-zinc-500"
                }`}
              >
                {section.label}
              </span>
            </button>
          ))}
        </div>

        {/* Central Display Shell */}
        <main id="printable-biodata-content" className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-16 space-y-24 relative z-10 leading-relaxed">
          
          {/* ================= SECTION 1: HERO PROFILE ================= */}
          <section id="profile" className="scroll-mt-16">
            <ScrollSection preset={activeAnimation.id as any} delay={0.1}>
              <div className="relative p-6 sm:p-10 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-md overflow-hidden">
                {/* Top Header Row representing the precise Artistic Flair template header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-8 border-b border-white/5">
                  <div className="space-y-2 text-left">
                    <p className={`text-[10px] tracking-[0.3em] uppercase font-bold ${activeTheme.primaryClass}`}>
                      MATRIMONIAL PORTFOLIO / {biodata.personal.dateOfBirth.split(" ").pop() || "2026"}
                    </p>
                    <h1 className={`text-4xl sm:text-5xl lg:text-6xl text-white leading-none ${activeTheme.id === 'artistic-flair' ? 'font-serif italic tracking-tighter' : 'font-display font-bold tracking-tight uppercase'}`}>
                      {biodata.personal.fullName}
                    </h1>
                    <p className="text-base text-zinc-400 font-light mt-1">
                      {biodata.profession.currentRole} & IT Systems Scholar
                    </p>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:text-right">
                    <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${activeTheme.id === 'artistic-flair' ? 'bg-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.6)]' : 'bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'} animate-pulse`} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                      Located in / {biodata.personal.nativePlace.split(",")[0] || "Thane"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Photo Slot 1 (Primary) in Hero */}
                  <div className="md:col-span-5 flex justify-center w-full">
                    <Tilt3D className="w-full max-w-sm">
                      <div className="relative group w-full">
                        {/* Glow Behind Main Photo */}
                        <div 
                          className="absolute -inset-1.5 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"
                          style={{ 
                            backgroundImage: activeTheme.id === "rose-gold-dark" 
                              ? "linear-gradient(to right, #f59e0b, #f43f5e)" 
                              : activeTheme.id === "artistic-flair"
                              ? "linear-gradient(to right, #0ea5e9, #6366f1)"
                              : "linear-gradient(to right, #6366f1, #06b6d4)"
                          }}
                        />
                        <div 
                          className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 cursor-pointer"
                          onClick={() => {
                            setSelectedPhotoIndex(0);
                            setIsLightboxOpen(true);
                          }}
                        >
                          {biodata.photos[0]?.url ? (
                            <img
                              src={biodata.photos[0].url}
                              alt="Yashvi B Vankadi Portrait"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 font-mono text-2xs p-4 text-center">
                              <span>Portrait 1 Place Holder</span>
                            </div>
                          )}
                          {/* Overlay frame title */}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-4 pt-8">
                            <p className="text-4xs font-mono text-zinc-400 uppercase tracking-widest">
                              {biodata.photos[0]?.title || "Primary Portrait"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Tilt3D>
                  </div>

                  {/* Bio & Details Rail */}
                  <div className="md:col-span-7 flex flex-col justify-between text-left space-y-6">
                    
                    {/* Summary */}
                    <div className="space-y-6">
                      <div className={`border-l-2 ${activeTheme.id === 'artistic-flair' ? 'border-sky-500' : 'border-indigo-500'} pl-6`}>
                        <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2 font-bold">About Me</h3>
                        <p className="text-lg leading-relaxed font-light text-zinc-300 italic font-serif">
                          "{biodata.personal.briefIntro}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                          <p className={`text-[10px] uppercase font-bold tracking-widest ${activeTheme.primaryClass}`}>Heritage</p>
                          <p className="text-xs text-zinc-400">Caste: <span className="text-zinc-200 font-medium">{biodata.personal.caste}</span></p>
                          <p className="text-xs text-zinc-400">Native: <span className="text-zinc-200 font-medium">{biodata.personal.nativePlace}</span></p>
                        </div>
                        <div className="space-y-1.5">
                          <p className={`text-[10px] uppercase font-bold tracking-widest ${activeTheme.primaryClass}`}>Education</p>
                          <p className="text-xs text-zinc-400">Degree: <span className="text-zinc-200 font-medium">{biodata.qualifications[0]?.degree || "Graduation"}</span></p>
                          <p className="text-xs text-zinc-400">Birth Year: <span className="text-zinc-200 font-medium">{biodata.personal.dateOfBirth.split(" ").pop()}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Current Projects / Matrimonial Milestones Visual Accent */}
                    <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Matrimonial Milestones</span>
                        <span className={`text-[10px] font-mono ${activeTheme.id === 'artistic-flair' ? 'text-sky-400' : 'text-indigo-400'}`}>04 Verified Files</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`w-3/4 h-full ${activeTheme.id === 'artistic-flair' ? 'bg-sky-500' : 'bg-indigo-500'}`}></div>
                        </div>
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`w-full h-full ${activeTheme.id === 'artistic-flair' ? 'bg-sky-500' : 'bg-indigo-500'}`}></div>
                        </div>
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`w-2/3 h-full ${activeTheme.id === 'artistic-flair' ? 'bg-sky-500' : 'bg-indigo-500'}`}></div>
                        </div>
                        <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </ScrollSection>
          </section>


          {/* ================= SECTION 2: PERSONAL METRICS ================= */}
          <section id="personal" className="scroll-mt-16">
            <ScrollSection preset={activeAnimation.id as any}>
              <div className="space-y-6">
                
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                  <h2 className="font-mono text-3xs tracking-widest text-zinc-500 uppercase flex-shrink-0 flex items-center gap-2">
                    <span className={activeTheme.primaryClass}>02 //</span> Personal Architecture
                  </h2>
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left stats panel */}
                  <div className="md:col-span-7">
                    <Tilt3D className="w-full">
                      <div className="p-4.5 rounded-xl bg-zinc-900/15 border border-zinc-900/60 backdrop-blur-sm space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { icon: <Calendar className="w-4 h-4 text-zinc-400" />, label: "Date of Birth", value: biodata.personal.dateOfBirth },
                            { icon: <Ruler className="w-4 h-4 text-zinc-400" />, label: "Physical Height", value: biodata.personal.height },
                            { icon: <Scale className="w-4 h-4 text-zinc-400" />, label: "Weight Class", value: biodata.personal.weight },
                            { icon: <Users className="w-4 h-4 text-zinc-400" />, label: "Social Caste", value: biodata.personal.caste },
                            { icon: <MapPin className="w-4 h-4 text-zinc-400" />, label: "Native Place", value: biodata.personal.nativePlace },
                            { icon: <Phone className="w-4 h-4 text-zinc-400" />, label: "Contact Phone", value: biodata.personal.contactPhone }
                          ].filter(stat => stat.value && stat.value.trim() !== "").map((stat, i) => (
                            <div key={i} className="p-3.5 rounded-lg bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800 transition duration-200">
                              <div className="flex items-center gap-2 mb-1.5">
                                {stat.icon}
                                <span className="text-4xs font-mono uppercase tracking-widest text-zinc-500">{stat.label}</span>
                              </div>
                              <p className="text-xs font-semibold text-zinc-200">{stat.value}</p>
                            </div>
                          ))}

                          {/* Render any Custom Fields inside Personal */}
                          {biodata.personal.customFields?.map((field) => (
                            <div key={field.id} className="p-3.5 rounded-lg bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800 transition duration-200">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <span className="text-4xs font-mono uppercase tracking-widest text-zinc-500">{field.label}</span>
                              </div>
                              <p className="text-xs font-semibold text-zinc-200">{field.value}</p>
                            </div>
                          ))}
                        </div>

                        {biodata.personal.address && (
                          <div className="p-3.5 rounded-lg bg-zinc-900/20 border border-zinc-900">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Home className="w-4 h-4 text-zinc-400" />
                              <span className="text-4xs font-mono uppercase tracking-widest text-zinc-500">Contact Address</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-normal">{biodata.personal.address}</p>
                          </div>
                        )}
                      </div>
                    </Tilt3D>
                  </div>

                  {/* Right tags list */}
                  <div className="md:col-span-5 space-y-4">
                    
                    {/* Languages */}
                    {biodata.personal.languagesKnown && biodata.personal.languagesKnown.length > 0 && (
                      <Tilt3D className="w-full">
                        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-900/50 space-y-3">
                          <span className="text-4xs font-mono uppercase tracking-widest text-zinc-500 block">Languages Spoken</span>
                          <div className="flex flex-wrap gap-2">
                            {biodata.personal.languagesKnown.map((lang, idx) => (
                              <span 
                                key={idx} 
                                className={`text-2xs font-mono px-2.5 py-1 rounded-md border ${activeTheme.chipBg}`}
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Tilt3D>
                    )}

                    {/* Hobbies */}
                    {biodata.personal.hobbies && biodata.personal.hobbies.length > 0 && (
                      <Tilt3D className="w-full">
                        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-900/50 space-y-3">
                          <span className="text-4xs font-mono uppercase tracking-widest text-zinc-500 block">Life Hobbies & Interests</span>
                          <div className="flex flex-wrap gap-2">
                            {biodata.personal.hobbies.map((hobby, idx) => (
                              <span 
                                key={idx} 
                                className="text-2xs font-mono px-2.5 py-1 rounded-md border border-zinc-800 text-zinc-300 bg-zinc-950/40"
                              >
                                {hobby}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Tilt3D>
                    )}

                    {/* Contact detail badge */}
                    {biodata.personal.contactName && (
                      <Tilt3D className="w-full">
                        <div className="p-4 rounded-xl bg-zinc-900/35 border border-zinc-900 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-4xs font-mono text-zinc-500 uppercase block">Family Representative</span>
                            <p className="text-xs font-semibold text-zinc-200">{biodata.personal.contactName}</p>
                          </div>
                          {biodata.personal.contactPhone && (
                            <a 
                              href={`tel:${biodata.personal.contactPhone}`}
                              className={`p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:${activeTheme.primaryClass} transition`}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </Tilt3D>
                    )}

                  </div>

                </div>
              </div>
            </ScrollSection>
          </section>


          {/* ================= SECTION 3: ACADEMIC & CAREER ================= */}
          <section id="education" className="scroll-mt-16">
            <ScrollSection preset={activeAnimation.id as any}>
              <div className="space-y-6">
                
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                  <h2 className="font-mono text-3xs tracking-widest text-zinc-500 uppercase flex-shrink-0 flex items-center gap-2">
                    <span className={activeTheme.primaryClass}>03 //</span> Qualifications & Career
                  </h2>
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* Left timeline (Academic) */}
                  <div className="md:col-span-7 space-y-5">
                    <div className="border-l border-zinc-800 ml-4 pl-6 space-y-6 relative py-2">
                      
                      {biodata.qualifications.map((qual, idx) => (
                        <div key={idx} className="relative group">
                          {/* Circle on timeline */}
                          <div className={`absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-950 border-2 transition duration-300 ${activeTheme.id === 'rose-gold-dark' ? 'border-amber-400 group-hover:bg-amber-400' : 'border-indigo-400 group-hover:bg-indigo-400'}`} />
                          
                          <div className="space-y-1">
                            <span className="text-4xs font-mono text-zinc-500 uppercase tracking-widest block">
                              {qual.category}
                            </span>
                            <h3 className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white transition duration-200">
                              {qual.degree}
                            </h3>
                            {qual.institution && (
                              <p className="text-2xs text-zinc-400 font-mono">
                                {qual.institution}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>

                  {/* Right side professional details */}
                  <div className="md:col-span-5 space-y-5">
                    
                    {(biodata.profession.currentRole || biodata.profession.currentCompany || (biodata.profession.customFields && biodata.profession.customFields.length > 0)) && (
                      <Tilt3D className="w-full">
                        <div className="p-4.5 rounded-xl bg-zinc-900/35 border border-zinc-900 space-y-4">
                          
                          {(biodata.profession.currentRole || biodata.profession.currentCompany) && (
                            <div className="space-y-1.5">
                              <span className="text-4xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-zinc-500" /> CURRENT PROFESSION
                              </span>
                              {biodata.profession.currentRole && (
                                <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
                                  {biodata.profession.currentRole}
                                </h4>
                              )}
                              {biodata.profession.currentCompany && (
                                <p className={`text-2xs font-mono ${activeTheme.accentText}`}>
                                  at {biodata.profession.currentCompany}
                                </p>
                              )}
                            </div>
                          )}

                          {biodata.profession.formerRole && (
                            <div className="pt-3 border-t border-zinc-900 space-y-1">
                              <span className="text-4xs font-mono uppercase text-zinc-600">FORMER PROFESSION</span>
                              <h5 className="text-2xs font-medium text-zinc-400">
                                {biodata.profession.formerRole}
                              </h5>
                              {biodata.profession.formerCompany && (
                                <p className="text-3xs font-mono text-zinc-500">
                                  at {biodata.profession.formerCompany}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Render Professional Custom Fields */}
                          {biodata.profession.customFields?.map((field) => (
                            <div key={field.id} className="pt-3 border-t border-zinc-900 space-y-1">
                              <span className="text-4xs font-mono uppercase text-zinc-600">{field.label}</span>
                              <h5 className="text-xs font-semibold text-zinc-200">
                                {field.value}
                              </h5>
                            </div>
                          ))}

                        </div>
                      </Tilt3D>
                    )}

                  </div>

                </div>

              </div>
            </ScrollSection>
          </section>


          {/* ================= SECTION 4: FAMILY BACKGROUND ================= */}
          <section id="family" className="scroll-mt-16">
            <ScrollSection preset={activeAnimation.id as any}>
              <div className="space-y-6">
                
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                  <h2 className="font-mono text-3xs tracking-widest text-zinc-500 uppercase flex-shrink-0 flex items-center gap-2">
                    <span className={activeTheme.primaryClass}>04 //</span> Family Structure
                  </h2>
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Father Detail Card */}
                  {biodata.family.fatherName && (
                    <Tilt3D className="w-full">
                      <div className="p-4.5 rounded-xl bg-zinc-900/20 border border-zinc-900 flex items-center justify-between group hover:border-zinc-800 transition h-full">
                        <div className="space-y-1.5">
                          <span className="text-4xs font-mono text-zinc-500 uppercase block">Father's Name</span>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-200">{biodata.family.fatherName}</p>
                          {biodata.family.fatherOccupation && (
                            <p className={`text-2xs font-mono ${activeTheme.accentText}`}>{biodata.family.fatherOccupation}</p>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400">
                          <User className="w-5 h-5 text-zinc-500" />
                        </div>
                      </div>
                    </Tilt3D>
                  )}

                  {/* Mother Detail Card */}
                  {biodata.family.motherName && (
                    <Tilt3D className="w-full">
                      <div className="p-4.5 rounded-xl bg-zinc-900/20 border border-zinc-900 flex items-center justify-between group hover:border-zinc-800 transition h-full">
                        <div className="space-y-1.5">
                          <span className="text-4xs font-mono text-zinc-500 uppercase block">Mother's Name</span>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-200">{biodata.family.motherName}</p>
                          {biodata.family.motherOccupation && (
                            <p className={`text-2xs font-mono ${activeTheme.accentText}`}>{biodata.family.motherOccupation}</p>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400">
                          <User className="w-5 h-5 text-zinc-500" />
                        </div>
                      </div>
                    </Tilt3D>
                  )}

                  {/* Sibling Card */}
                  {biodata.family.siblings.map((sib, idx) => (
                    <div key={idx} className="md:col-span-2">
                      <Tilt3D className="w-full">
                        <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-4xs font-mono px-2 py-0.5 rounded-md border ${activeTheme.chipBg}`}>
                                {sib.relation}
                              </span>
                            </div>
                            <span className="text-4xs font-mono text-zinc-500">SIBLING DETAILS</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <span className="text-4xs font-mono text-zinc-600 uppercase block mb-0.5">Name</span>
                              <p className="text-xs font-semibold text-zinc-200">{sib.name}</p>
                            </div>
                            <div>
                              <span className="text-4xs font-mono text-zinc-600 uppercase block mb-0.5">Occupation</span>
                              <p className="text-xs font-medium text-zinc-300 leading-normal">{sib.occupation}</p>
                            </div>
                            <div>
                              <span className="text-4xs font-mono text-zinc-600 uppercase block mb-0.5">Education</span>
                              <p className="text-xs text-zinc-400 leading-normal">{sib.education || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </Tilt3D>
                    </div>
                  ))}

                  {/* Family Custom Fields */}
                  {biodata.family.customFields?.map((field) => (
                    <div key={field.id} className="md:col-span-2">
                      <Tilt3D className="w-full">
                        <div className="p-4.5 rounded-xl bg-zinc-900/20 border border-zinc-900 flex items-center justify-between group hover:border-zinc-800 transition">
                          <div className="space-y-1.5">
                            <span className="text-4xs font-mono text-zinc-500 uppercase block">{field.label}</span>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-200">{field.value}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                          </div>
                        </div>
                      </Tilt3D>
                    </div>
                  ))}

                </div>
              </div>
            </ScrollSection>
          </section>


          {/* ================= SECTION 5: MATERNAL ROOTS ================= */}
          <section id="maternal" className="scroll-mt-16">
            <ScrollSection preset={activeAnimation.id as any}>
              <div className="space-y-6">
                
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                  <h2 className="font-mono text-3xs tracking-widest text-zinc-500 uppercase flex-shrink-0 flex items-center gap-2">
                    <span className={activeTheme.primaryClass}>05 //</span> Maternal Heritage
                  </h2>
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                </div>

                <Tilt3D className="w-full">
                  <div className="p-5 rounded-2xl bg-zinc-900/15 border border-zinc-900/60 backdrop-blur-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      
                      {biodata.maternal.grandfatherName && (
                        <div className="space-y-1">
                          <span className="text-4xs font-mono text-zinc-500 uppercase tracking-wider block">Maternal Grandfather</span>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-200">{biodata.maternal.grandfatherName}</p>
                          <p className="text-3xs font-mono text-zinc-500">Nani-Side Patriarchy</p>
                        </div>
                      )}

                      {biodata.maternal.nativePlace && (
                        <div className="space-y-1">
                          <span className="text-4xs font-mono text-zinc-500 uppercase tracking-wider block">Nani's Native Place</span>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-200">{biodata.maternal.nativePlace}</p>
                          <p className="text-3xs font-mono text-zinc-500">Roots Origin</p>
                        </div>
                      )}

                      {biodata.maternal.uncleName && (
                        <div className="space-y-1">
                          <span className="text-4xs font-mono text-zinc-500 uppercase tracking-wider block">Maternal Uncle (Mama)</span>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-200">{biodata.maternal.uncleName}</p>
                          {biodata.maternal.uncleOccupation && (
                            <p className={`text-3xs font-mono ${activeTheme.accentText}`}>{biodata.maternal.uncleOccupation}</p>
                          )}
                        </div>
                      )}

                      {/* Render Maternal Custom Fields */}
                      {biodata.maternal.customFields?.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <span className="text-4xs font-mono text-zinc-500 uppercase tracking-wider block">{field.label}</span>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-200">{field.value}</p>
                          <p className="text-3xs font-mono text-indigo-400">Custom Info</p>
                        </div>
                      ))}

                    </div>
                  </div>
                </Tilt3D>

              </div>
            </ScrollSection>
          </section>


          {/* ================= DYNAMIC CUSTOM SECTIONS ================= */}
          {(biodata.customSections || []).map((sec, secIdx) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-16">
              <ScrollSection preset={activeAnimation.id as any}>
                <div className="space-y-6">
                  
                  {/* Section Header */}
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] flex-1 bg-zinc-900" />
                    <h2 className="font-mono text-3xs tracking-widest text-zinc-500 uppercase flex-shrink-0 flex items-center gap-2">
                      <span className={activeTheme.primaryClass}>0{5 + secIdx + 1} //</span> {sec.title}
                    </h2>
                    <div className="h-[1px] flex-1 bg-zinc-900" />
                  </div>

                  <Tilt3D className="w-full">
                    <div className="p-5 rounded-2xl bg-zinc-900/15 border border-zinc-900/60 backdrop-blur-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {sec.fields.map((field) => (
                          <div key={field.id} className="space-y-1">
                            <span className="text-4xs font-mono text-zinc-500 uppercase tracking-wider block">{field.label}</span>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-200">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Tilt3D>

                </div>
              </ScrollSection>
            </section>
          ))}


          {/* ================= SECTION 6: PHOTO PORTFOLIO GALLERY ================= */}
          <section id="gallery" className="scroll-mt-16">
            <ScrollSection preset={activeAnimation.id as any}>
              <div className="space-y-6">
                
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                  <h2 className="font-mono text-3xs tracking-widest text-zinc-500 uppercase flex-shrink-0 flex items-center gap-2">
                    <span className={activeTheme.primaryClass}>0{6 + (biodata.customSections?.length || 0)} //</span> Portfolio Showcase
                  </h2>
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Photo Slot 2, 3, 4 (and Slot 1 is rendered again or we render all 4 here!) */}
                  {biodata.photos.map((photo, index) => (
                    <div key={photo.id} className="w-full h-full">
                      <Tilt3D className="w-full h-full">
                        <div className="relative group p-3.5 rounded-xl bg-zinc-900/35 border border-zinc-900 backdrop-blur-md hover:border-zinc-800 transition duration-300 h-full flex flex-col justify-between">
                          <div>
                            <div 
                              className="relative aspect-[3/4] rounded-lg overflow-hidden border border-zinc-950 bg-zinc-950 cursor-pointer"
                              onClick={() => {
                                setSelectedPhotoIndex(index);
                                setIsLightboxOpen(true);
                              }}
                            >
                              {photo.url ? (
                                <img
                                  src={photo.url}
                                  alt={photo.caption}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 font-mono text-4xs">
                                  <span>Image slot {index + 1} Empty</span>
                                </div>
                              )}
                              <span className="absolute top-3 left-3 text-4xs font-mono bg-zinc-950/80 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800">
                                // 0{index + 1}
                              </span>
                            </div>

                            <div className="mt-3.5 space-y-1">
                              <h4 className="text-xs font-semibold text-zinc-200">{photo.title}</h4>
                              <p className="text-2xs text-zinc-400 font-sans leading-normal">{photo.caption}</p>
                            </div>
                          </div>
                        </div>
                      </Tilt3D>
                    </div>
                  ))}

                </div>
              </div>
            </ScrollSection>
          </section>

          {/* Bottom Callout/Signoff */}
          <footer className="pt-8 text-center text-zinc-500 space-y-3.5 max-w-md mx-auto">
            <div className="h-[1px] bg-zinc-900" />
            <p className="text-3xs font-mono uppercase tracking-widest leading-relaxed">
              Thank you for exploring this biodata presentation portfolio.
            </p>
          </footer>

        </main>

        {/* Artistic Flair Design Decorative Elements */}
        {activeTheme.id === "artistic-flair" && (
          <div className="fixed bottom-0 right-0 p-4 opacity-5 pointer-events-none select-none no-print">
            <div className="text-[12rem] font-serif italic -mr-20 -mb-20 text-white">YV</div>
          </div>
        )}
      </div>

      {/* =======================================================================
          5. PRINT MODE DUAL-COLUMN HIGH-FIDELITY BIODATA DOCUMENT
          ======================================================================= */}
      <div className="hidden print:block print-page font-sans text-black bg-white p-8 w-[210mm] min-h-[297mm] mx-auto select-text">
        
        {/* Header Block */}
        <div className="print-header flex justify-between items-end border-b-2 border-zinc-800 pb-5 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-zinc-900 m-0">
              {biodata.personal.fullName}
            </h1>
            <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest m-0 mt-1">
              Matrimonial Biodata Profile
            </p>
          </div>
          <div className="text-right text-3xs font-mono text-zinc-500">
            <span>Confidential • IT Scholar Profile</span>
          </div>
        </div>

        {/* Print Content Layout Grid (Dual Column) */}
        <div className="print-grid grid grid-cols-12 gap-8">
          
          {/* Print LEFT COLUMN: Personal Demographics */}
          <div className="col-span-4 print-col-left border-r border-zinc-200 pr-6 space-y-5">
            
            {/* Primary Portrait in Print */}
            {biodata.photos[0]?.url && (
              <div className="w-full aspect-[3/4] rounded border border-zinc-300 overflow-hidden bg-zinc-50 mb-4 print-avoid-break">
                <img
                  src={biodata.photos[0].url}
                  alt="Primary Portrait"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-4 print-avoid-break">
              <h3 className="print-section-title text-xs font-bold font-mono uppercase tracking-widest text-zinc-800 m-0 border-b border-zinc-200 pb-1 mb-2">
                PERSONAL DETAILS
              </h3>
              
              <table className="w-full text-3xs border-collapse">
                <tbody>
                  <tr className="border-b border-zinc-100">
                    <td className="py-1.5 font-semibold text-zinc-500 w-24">Birth Date</td>
                    <td className="py-1.5 text-zinc-900">{biodata.personal.dateOfBirth}</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-1.5 font-semibold text-zinc-500">Height</td>
                    <td className="py-1.5 text-zinc-900">{biodata.personal.height}</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-1.5 font-semibold text-zinc-500">Weight</td>
                    <td className="py-1.5 text-zinc-900">{biodata.personal.weight}</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-1.5 font-semibold text-zinc-500">Caste</td>
                    <td className="py-1.5 text-zinc-900">{biodata.personal.caste}</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-1.5 font-semibold text-zinc-500">Native</td>
                    <td className="py-1.5 text-zinc-900">{biodata.personal.nativePlace}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2 print-avoid-break">
              <h3 className="print-section-title text-xs font-bold font-mono uppercase tracking-widest text-zinc-800 m-0 border-b border-zinc-200 pb-1 mb-2">
                LANGUAGES
              </h3>
              <p className="text-3xs text-zinc-800 m-0">
                {biodata.personal.languagesKnown.join(", ")}
              </p>
            </div>

            <div className="space-y-2 print-avoid-break">
              <h3 className="print-section-title text-xs font-bold font-mono uppercase tracking-widest text-zinc-800 m-0 border-b border-zinc-200 pb-1 mb-2">
                HOBBIES
              </h3>
              <p className="text-3xs text-zinc-800 m-0">
                {biodata.personal.hobbies.join(", ")}
              </p>
            </div>

            <div className="space-y-2.5 print-avoid-break pt-2">
              <h3 className="print-section-title text-xs font-bold font-mono uppercase tracking-widest text-zinc-800 m-0 border-b border-zinc-200 pb-1 mb-2">
                CONTACT
              </h3>
              <div className="text-3xs space-y-1 text-zinc-800">
                <p className="font-semibold m-0">{biodata.personal.contactName}</p>
                <p className="m-0">{biodata.personal.contactPhone}</p>
                <p className="m-0 leading-normal text-zinc-600 italic mt-1">{biodata.personal.address}</p>
              </div>
            </div>

          </div>

          {/* Print RIGHT COLUMN: Career, Academic, Family & Maternal details */}
          <div className="col-span-8 space-y-6">
            
            {/* About Profile */}
            <div className="space-y-2 print-avoid-break">
              <h3 className="print-section-title text-xs font-bold font-mono uppercase tracking-widest text-zinc-800 m-0 border-b border-zinc-200 pb-1 mb-2">
                PROFILE SUMMARY
              </h3>
              <p className="text-3xs text-zinc-700 leading-normal italic m-0">
                "{biodata.personal.briefIntro}"
              </p>
            </div>

            {/* Academic Qualifications */}
            <div className="space-y-3 print-avoid-break">
              <h3 className="print-section-title text-xs font-bold font-mono uppercase tracking-widest text-zinc-800 m-0 border-b border-zinc-200 pb-1 mb-2">
                ACADEMIC QUALIFICATIONS
              </h3>
              <div className="space-y-2">
                {biodata.qualifications.map((qual, idx) => (
                  <div key={idx} className="text-3xs">
                    <span className="font-mono text-zinc-500 uppercase tracking-wide text-4xs">
                      {qual.category}
                    </span>
                    <h4 className="font-semibold text-zinc-900 m-0 mt-0.5">
                      {qual.degree}
                    </h4>
                    {qual.institution && (
                      <p className="text-zinc-600 m-0">{qual.institution}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Career */}
            <div className="space-y-2.5 print-avoid-break">
              <h3 className="print-section-title text-xs font-bold font-mono uppercase tracking-widest text-zinc-800 m-0 border-b border-zinc-200 pb-1 mb-2">
                PROFESSION & CAREER
              </h3>
              <div className="text-3xs space-y-1">
                <p className="m-0 text-zinc-900 font-semibold">
                  {biodata.profession.currentRole}
                </p>
                <p className="m-0 text-zinc-600">
                  at {biodata.profession.currentCompany}
                </p>
                {biodata.profession.formerRole && (
                  <p className="m-0 mt-1.5 text-zinc-500 italic text-4xs">
                    Previously: {biodata.profession.formerRole} at {biodata.profession.formerCompany}
                  </p>
                )}
                <div className="pt-1.5">
                  <span className="text-4xs font-semibold text-zinc-500 uppercase">IT SKILLS: </span>
                  <span className="text-3xs text-zinc-800 font-mono">
                    {biodata.profession.skills.join(" • ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Family Structure */}
            <div className="space-y-3 print-avoid-break">
              <h3 className="print-section-title text-xs font-bold font-mono uppercase tracking-widest text-zinc-800 m-0 border-b border-zinc-200 pb-1 mb-2">
                FAMILY FRAMEWORK
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-3xs">
                <div>
                  <span className="text-4xs text-zinc-500 uppercase block">Father</span>
                  <p className="font-semibold text-zinc-900 m-0">{biodata.family.fatherName}</p>
                  <p className="text-zinc-600 m-0">{biodata.family.fatherOccupation}</p>
                </div>
                <div>
                  <span className="text-4xs text-zinc-500 uppercase block">Mother</span>
                  <p className="font-semibold text-zinc-900 m-0">{biodata.family.motherName}</p>
                  <p className="text-zinc-600 m-0">{biodata.family.motherOccupation}</p>
                </div>
              </div>

              {/* Siblings Print list */}
              {biodata.family.siblings.length > 0 && (
                <div className="pt-2 text-3xs border-t border-zinc-100">
                  <span className="text-4xs text-zinc-500 uppercase block mb-1">SIBLINGS</span>
                  {biodata.family.siblings.map((sib, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 py-0.5">
                      <p className="m-0 font-medium text-zinc-900">{sib.relation}: {sib.name}</p>
                      <p className="m-0 text-zinc-600">{sib.occupation}</p>
                      <p className="m-0 text-zinc-500 italic">{sib.education}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Maternal Roots */}
            <div className="space-y-3 print-avoid-break">
              <h3 className="print-section-title text-xs font-bold font-mono uppercase tracking-widest text-zinc-800 m-0 border-b border-zinc-200 pb-1 mb-2">
                MATERNAL LINKS (NANI SIDE)
              </h3>
              
              <div className="grid grid-cols-3 gap-4 text-3xs">
                <div>
                  <span className="text-4xs text-zinc-500 uppercase block">Grandfather</span>
                  <p className="font-semibold text-zinc-900 m-0">{biodata.maternal.grandfatherName}</p>
                </div>
                <div>
                  <span className="text-4xs text-zinc-500 uppercase block">Nani Native Place</span>
                  <p className="font-semibold text-zinc-900 m-0">{biodata.maternal.nativePlace}</p>
                </div>
                <div>
                  <span className="text-4xs text-zinc-500 uppercase block">Maternal Uncle (Mama)</span>
                  <p className="font-semibold text-zinc-900 m-0">{biodata.maternal.uncleName}</p>
                  <p className="text-zinc-500 m-0 text-4xs">{biodata.maternal.uncleOccupation}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Print Footer sign off */}
        <div className="border-t border-zinc-400 mt-12 pt-4 text-center text-4xs text-zinc-400 uppercase tracking-widest">
          <span>Printed from Interactive Biodata Portfolio Builder • &copy; 2026 All Rights Reserved</span>
        </div>

      </div>

      {/* 5. ADMIN AUTHENTICATION PORTAL (MODAL OVERLAY) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in no-print">
          <div className="relative w-full max-w-md overflow-hidden bg-[#0d0d10] border border-white/10 rounded-2xl shadow-3xl">
            {/* Glowing Accent line */}
            <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${activeTheme.id === "rose-gold-dark" ? "from-amber-500 via-rose-500 to-amber-500" : "from-sky-500 via-indigo-500 to-sky-500"}`} />
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                setLoginError("");
                setUsernameInput("");
                setPasswordInput("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition duration-200 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Modal Body */}
            <div className="p-8 sm:p-10">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-12 h-12 border border-sky-500/20 rounded-full flex items-center justify-center mb-4 bg-sky-500/5">
                  <Lock className={`w-5 h-5 ${activeTheme.id === 'artistic-flair' ? 'text-sky-400' : 'text-indigo-400'}`} />
                </div>
                <h2 className="text-3xl font-serif italic text-white tracking-tight">Admin Console</h2>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono">
                  Matrimonial Biodata Control Center
                </p>
              </div>

              {loginError && (
                <div className="flex items-start gap-2.5 p-3.5 mb-6 rounded-lg bg-red-950/20 border border-red-900/30 text-red-300 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div>
                  <label className="block text-3xs font-mono uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder=""
                      required
                      className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.05] transition-all duration-200 text-sm font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-3xs font-mono uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                    Secure Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-4 pr-10 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.05] transition-all duration-200 text-sm font-mono tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition duration-150 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-black font-semibold rounded-lg shadow-lg hover:shadow-sky-500/10 hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Authenticate</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                  Normal site is in read-only mode for prospective matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox Viewer with Zoom functionality */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photos={biodata.photos || []}
        initialIndex={selectedPhotoIndex}
      />

    </div>
  );
}
