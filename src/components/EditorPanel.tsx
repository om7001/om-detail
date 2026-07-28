import React, { useRef, useState } from "react";
import { 
  User, Calendar, Ruler, Scale, Heart, MapPin, Home, Phone, 
  GraduationCap, Briefcase, Users, Plus, Trash2, RotateCcw, 
  Printer, FileCode, Upload, Palette, Sparkles, X, ChevronRight, Eye, LogOut, Save, Check, Download, FileText
} from "lucide-react";
import { Biodata, QualificationItem, SiblingItem, ThemeConfig, AnimationPreset } from "../types";

interface EditorPanelProps {
  biodata: Biodata;
  setBiodata: React.Dispatch<React.SetStateAction<Biodata>>;
  themes: ThemeConfig[];
  activeTheme: ThemeConfig;
  setActiveTheme: (theme: ThemeConfig) => void;
  animations: AnimationPreset[];
  activeAnimation: AnimationPreset;
  setActiveAnimation: (anim: AnimationPreset) => void;
  onReset: () => void;
  onPrint: () => void;
  onLogout?: () => void;
  onSave?: () => void;
  saveStatus?: "idle" | "saving" | "saved";
}

export function EditorPanel({
  biodata,
  setBiodata,
  themes,
  activeTheme,
  setActiveTheme,
  animations,
  activeAnimation,
  setActiveAnimation,
  onReset,
  onPrint,
  onLogout,
  onSave,
  saveStatus = "idle"
}: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<"visuals" | "personal" | "education" | "family" | "photos" | "custom">("visuals");
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        setBiodata(prev => ({
          ...prev,
          pdfFileData: event.target!.result as string,
          pdfFileName: file.name
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handler for generic nested state updates
  const updatePersonal = (field: keyof Biodata["personal"], value: any) => {
    setBiodata(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const updateProfession = (field: keyof Biodata["profession"], value: any) => {
    setBiodata(prev => ({
      ...prev,
      profession: {
        ...prev.profession,
        [field]: value
      }
    }));
  };

  const updateMaternal = (field: keyof Biodata["maternal"], value: any) => {
    setBiodata(prev => ({
      ...prev,
      maternal: {
        ...prev.maternal,
        [field]: value
      }
    }));
  };

  // Dynamic Custom Fields helpers
  const addCustomField = (section: "personal" | "profession" | "family" | "maternal", label: string, value: string) => {
    const newField = {
      id: "cf-" + Date.now() + Math.random().toString(36).substr(2, 4),
      label: label.trim(),
      value: value.trim()
    };
    setBiodata(prev => {
      const sec = prev[section] as any;
      const existingFields = sec.customFields || [];
      return {
        ...prev,
        [section]: {
          ...sec,
          customFields: [...existingFields, newField]
        }
      };
    });
  };

  const removeCustomField = (section: "personal" | "profession" | "family" | "maternal", id: string) => {
    setBiodata(prev => {
      const sec = prev[section] as any;
      const existingFields = sec.customFields || [];
      return {
        ...prev,
        [section]: {
          ...sec,
          customFields: existingFields.filter((f: any) => f.id !== id)
        }
      };
    });
  };

  const updateCustomField = (section: "personal" | "profession" | "family" | "maternal", id: string, key: "label" | "value", newValue: string) => {
    setBiodata(prev => {
      const sec = prev[section] as any;
      const existingFields = sec.customFields || [];
      return {
        ...prev,
        [section]: {
          ...sec,
          customFields: existingFields.map((f: any) => f.id === id ? { ...f, [key]: newValue } : f)
        }
      };
    });
  };

  // Dynamic Custom Sections helpers
  const addCustomSection = (title: string) => {
    const newSection = {
      id: "sec-" + Date.now() + Math.random().toString(36).substr(2, 4),
      title: title.trim(),
      fields: []
    };
    setBiodata(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSection]
    }));
  };

  const removeCustomSection = (id: string) => {
    setBiodata(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter((s) => s.id !== id)
    }));
  };

  const addFieldToCustomSection = (sectionId: string, label: string, value: string) => {
    const newField = {
      id: "cf-" + Date.now() + Math.random().toString(36).substr(2, 4),
      label: label.trim(),
      value: value.trim()
    };
    setBiodata(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          fields: [...s.fields, newField]
        };
      })
    }));
  };

  const removeFieldFromCustomSection = (sectionId: string, fieldId: string) => {
    setBiodata(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          fields: s.fields.filter(f => f.id !== fieldId)
        };
      })
    }));
  };

  const updateFieldInCustomSection = (sectionId: string, fieldId: string, key: "label" | "value", newValue: string) => {
    setBiodata(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          fields: s.fields.map(f => f.id === fieldId ? { ...f, [key]: newValue } : f)
        };
      })
    }));
  };

  // List manipulation helpers for Hobbies & Languages
  const addArrayItem = (field: "languagesKnown" | "hobbies", item: string) => {
    if (!item.trim()) return;
    const currentList = biodata.personal[field];
    if (currentList.includes(item.trim())) return;
    updatePersonal(field, [...currentList, item.trim()]);
  };

  const removeArrayItem = (field: "languagesKnown" | "hobbies", index: number) => {
    const currentList = biodata.personal[field];
    updatePersonal(field, currentList.filter((_, i) => i !== index));
  };

  // Qualifications list manipulators
  const addQualification = () => {
    const newItem: QualificationItem = {
      category: "Graduation",
      degree: "New Degree / Certification",
      institution: "College / University Name"
    };
    setBiodata(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, newItem]
    }));
  };

  const updateQualification = (index: number, field: keyof QualificationItem, value: string) => {
    setBiodata(prev => {
      const updated = [...prev.qualifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, qualifications: updated };
    });
  };

  const removeQualification = (index: number) => {
    setBiodata(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  // Professional skills manipulation
  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    const current = biodata.profession.skills;
    if (current.includes(skill.trim())) return;
    updateProfession("skills", [...current, skill.trim()]);
  };

  const removeSkill = (index: number) => {
    updateProfession("skills", biodata.profession.skills.filter((_, i) => i !== index));
  };

  // Siblings list manipulators
  const addSibling = () => {
    const newItem: SiblingItem = {
      name: "Sibling Name",
      relation: "Brother",
      occupation: "Occupation Details",
      education: "Degree Details"
    };
    setBiodata(prev => ({
      ...prev,
      family: {
        ...prev.family,
        siblings: [...prev.family.siblings, newItem]
      }
    }));
  };

  const updateSibling = (index: number, field: keyof SiblingItem, value: string) => {
    setBiodata(prev => {
      const updatedSiblings = [...prev.family.siblings];
      updatedSiblings[index] = { ...updatedSiblings[index], [field]: value };
      return {
        ...prev,
        family: {
          ...prev.family,
          siblings: updatedSiblings
        }
      };
    });
  };

  const removeSibling = (index: number) => {
    setBiodata(prev => ({
      ...prev,
      family: {
        ...prev.family,
        siblings: prev.family.siblings.filter((_, i) => i !== index)
      }
    }));
  };

  // Handle Photo File Upload & conversion to base64
  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        const resultString = event.target.result;
        setBiodata(prev => {
          const updatedPhotos = [...prev.photos];
          updatedPhotos[index] = {
            ...updatedPhotos[index],
            url: resultString
          };
          return { ...prev, photos: updatedPhotos };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const updatePhotoTitle = (index: number, title: string) => {
    setBiodata(prev => {
      const updatedPhotos = [...prev.photos];
      updatedPhotos[index] = { ...updatedPhotos[index], title };
      return { ...prev, photos: updatedPhotos };
    });
  };

  const updatePhotoCaption = (index: number, caption: string) => {
    setBiodata(prev => {
      const updatedPhotos = [...prev.photos];
      updatedPhotos[index] = { ...updatedPhotos[index], caption };
      return { ...prev, photos: updatedPhotos };
    });
  };

  // Export edited JSON
  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(biodata, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2500);
    });
  };

  // Helper lists for temporary input state
  const [newLanguage, setNewLanguage] = useState("");
  const [newHobby, setNewHobby] = useState("");
  const [newSkill, setNewSkill] = useState("");

  return (
    <div className="flex flex-col h-full bg-zinc-950/90 border-r border-zinc-800 text-zinc-100 flex-shrink-0 select-none">
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-sm tracking-wide text-white uppercase">
              Biodata Studio
            </h1>
            <p className="text-2xs font-mono text-zinc-500 uppercase">
              IT Student Customization Suite
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            title="Reset to Sample Data"
            className="p-1.5 rounded-md hover:bg-zinc-800/80 text-zinc-400 hover:text-white transition duration-200"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out Admin"
              className="p-1.5 rounded-md hover:bg-red-950/40 hover:text-red-400 text-zinc-400 border border-transparent hover:border-red-900/30 transition duration-200"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Actions / Presets quick-bar */}
      <div className="p-3 bg-zinc-900/40 border-b border-zinc-800 flex gap-2 overflow-x-auto no-scrollbar">
        {onSave && (
          <button
            onClick={onSave}
            disabled={saveStatus === "saving"}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition duration-200 cursor-pointer flex-shrink-0 ${
              saveStatus === "saved"
                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : saveStatus === "saving"
                ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-sky-500 hover:bg-sky-400 text-black"
            }`}
          >
            {saveStatus === "saved" ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className={`w-3.5 h-3.5 ${saveStatus === "saving" ? "animate-pulse" : ""}`} />
            )}
            {saveStatus === "saved" ? "Saved!" : saveStatus === "saving" ? "Saving..." : "Save Details"}
          </button>
        )}
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium transition duration-200 cursor-pointer flex-shrink-0"
        >
          <Printer className="w-3.5 h-3.5 text-zinc-400" />
          Print / PDF
        </button>
        <button
          onClick={handleCopyJSON}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium transition duration-200 cursor-pointer flex-shrink-0"
        >
          <FileCode className="w-3.5 h-3.5 text-zinc-400" />
          {showCopyMessage ? "Copied!" : "Export JSON"}
        </button>
      </div>

      {/* Editor Sub-Tabs */}
      <div className="flex border-b border-zinc-800 text-xs">
        <button
          onClick={() => setActiveTab("visuals")}
          className={`flex-1 py-3 text-center border-b font-medium transition duration-200 cursor-pointer ${
            activeTab === "visuals" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Visuals
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex-1 py-3 text-center border-b font-medium transition duration-200 cursor-pointer ${
            activeTab === "personal" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Personal
        </button>
        <button
          onClick={() => setActiveTab("education")}
          className={`flex-1 py-3 text-center border-b font-medium transition duration-200 cursor-pointer ${
            activeTab === "education" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Qualifications
        </button>
        <button
          onClick={() => setActiveTab("family")}
          className={`flex-1 py-3 text-center border-b font-medium transition duration-200 cursor-pointer ${
            activeTab === "family" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Family
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex-1 py-3 text-center border-b font-medium transition duration-200 cursor-pointer ${
            activeTab === "photos" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex-1 py-3 text-center border-b font-medium transition duration-200 cursor-pointer ${
            activeTab === "custom" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Custom
        </button>
      </div>

      {/* Tab Contents - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">

        {/* VISUALS & ANIMATIONS TAB */}
        {activeTab === "visuals" && (
          <div className="space-y-5 animate-fadeIn duration-200">
            <div>
              <label className="text-2xs font-mono text-zinc-500 uppercase tracking-widest block mb-2.5 flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-indigo-400" /> Choose Accent Colorway
              </label>
              <div className="grid grid-cols-1 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition duration-200 cursor-pointer ${
                      activeTheme.id === theme.id 
                        ? "bg-zinc-900 border-zinc-700 ring-1 ring-zinc-600" 
                        : "bg-zinc-950/40 border-zinc-900/60 hover:bg-zinc-900/50 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-full ${theme.activeBorder} bg-zinc-950 border border-white/10 flex items-center justify-center`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${theme.primaryClass.replace('text-', 'bg-')}`} />
                      </div>
                      <span className="text-xs font-medium text-zinc-200">{theme.name}</span>
                    </div>
                    <span className="text-3xs font-mono uppercase tracking-widest text-zinc-500">
                      Preset
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-2xs font-mono text-zinc-500 uppercase tracking-widest block mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Scrolling Animation Effect
              </label>
              <div className="grid grid-cols-1 gap-2">
                {animations.map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => setActiveAnimation(anim)}
                    className={`p-3 rounded-lg border text-left transition duration-200 cursor-pointer block ${
                      activeAnimation.id === anim.id 
                        ? "bg-zinc-900 border-zinc-700 ring-1 ring-zinc-600" 
                        : "bg-zinc-950/40 border-zinc-900/60 hover:bg-zinc-900/50 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-200">{anim.name}</span>
                      <span className="text-3xs font-mono uppercase tracking-widest text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-950">
                        Preset
                      </span>
                    </div>
                    <p className="text-2xs text-zinc-400 leading-normal">{anim.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-2xs font-mono text-zinc-500 uppercase tracking-widest block mb-2.5 flex items-center gap-1.5">
                <FileCode className="w-3 h-3 text-indigo-400" /> Background Watermark Text
              </label>
              <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
                <input
                  type="text"
                  value={biodata.watermarkText || ""}
                  onChange={(e) => {
                    const text = e.target.value;
                    setBiodata(prev => ({
                      ...prev,
                      watermarkText: text
                    }));
                  }}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                  placeholder="e.g. Yashvi B. Vankadi"
                />
                <p className="text-3xs text-zinc-500 mt-2 leading-relaxed">
                  Enter any custom text to show as a large diagonal watermark in the background. Leave empty to hide.
                </p>
              </div>
            </div>

            <div>
              <label className="text-2xs font-mono text-zinc-500 uppercase tracking-widest block mb-2.5 flex items-center gap-1.5">
                <Download className="w-3 h-3 text-indigo-400" /> Custom Downloadable PDF File
              </label>
              <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-3">
                {biodata.pdfFileData ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs text-emerald-300 font-mono truncate">
                          {biodata.pdfFileName || "Uploaded_Biodata.pdf"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setBiodata(prev => ({
                            ...prev,
                            pdfFileData: undefined,
                            pdfFileName: undefined
                          }));
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition flex-shrink-0"
                        title="Remove PDF"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={onPrint}
                        className="flex-1 py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/40 text-3xs font-mono text-indigo-200 rounded border border-indigo-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition font-semibold"
                      >
                        <Download className="w-3 h-3 text-indigo-400" /> Test Download PDF
                      </button>
                      <button
                        onClick={() => pdfFileInputRef.current?.click()}
                        className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-3xs font-mono text-zinc-300 rounded flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-800 transition"
                      >
                        Replace File
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => pdfFileInputRef.current?.click()}
                      className="w-full py-3 border border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 text-xs font-mono text-indigo-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition font-semibold"
                    >
                      <Upload className="w-4 h-4 text-indigo-400" /> Upload Custom PDF File (.pdf)
                    </button>
                    <p className="text-3xs text-zinc-500 mt-2 leading-relaxed">
                      Upload any custom PDF file here. When users click the "Download PDF" button, this exact PDF file will instantly download to their system!
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={pdfFileInputRef}
                  onChange={handlePdfUpload}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
              <span className="text-3xs font-mono uppercase tracking-widest text-indigo-400 block mb-1">Design Vibe: IT Scholar</span>
              <p className="text-2xs text-zinc-400 leading-normal">
                This custom theme represents tech scholars with sleek neon borders, high-contrast typography, and a refined dark interface. No cheesy retro green terminals — just pristine modern digital elegance.
              </p>
            </div>
          </div>
        )}

        {/* PERSONAL DETAILS TAB */}
        {activeTab === "personal" && (
          <div className="space-y-4 animate-fadeIn duration-200">
            <div>
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={biodata.personal.fullName}
                  onChange={(e) => updatePersonal("fullName", e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                  placeholder="Yashvi B. Vankadi"
                />
              </div>
            </div>

            <div>
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Intro / Description</label>
              <textarea
                value={biodata.personal.briefIntro}
                onChange={(e) => updatePersonal("briefIntro", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition resize-none leading-normal"
                placeholder="Brief intro details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={biodata.personal.dateOfBirth}
                    onChange={(e) => updatePersonal("dateOfBirth", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    placeholder="14th January 1999"
                  />
                </div>
              </div>
              <div>
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Caste</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={biodata.personal.caste}
                    onChange={(e) => updatePersonal("caste", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    placeholder="Leuva Patel"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Height</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={biodata.personal.height}
                    onChange={(e) => updatePersonal("height", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    placeholder="5ft 2inchs"
                  />
                </div>
              </div>
              <div>
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Weight</label>
                <div className="relative">
                  <Scale className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={biodata.personal.weight}
                    onChange={(e) => updatePersonal("weight", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    placeholder="55 kgs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Native Place</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={biodata.personal.nativePlace}
                    onChange={(e) => updatePersonal("nativePlace", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    placeholder="Mandava, Botad"
                  />
                </div>
              </div>
              <div>
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={biodata.personal.address}
                    onChange={(e) => updatePersonal("address", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    placeholder="A-9, 202, Shanti Vihar..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Contact Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={biodata.personal.contactName}
                    onChange={(e) => updatePersonal("contactName", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    placeholder="Bakulbhai Vankadi"
                  />
                </div>
              </div>
              <div>
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={biodata.personal.contactPhone}
                    onChange={(e) => updatePersonal("contactPhone", e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    placeholder="+91 93 244 90797"
                  />
                </div>
              </div>
            </div>

            {/* LANGUAGES KNOWN */}
            <div>
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Languages Known</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (addArrayItem("languagesKnown", newLanguage), setNewLanguage(""))}
                  className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none"
                  placeholder="e.g. Hindi, French"
                />
                <button
                  onClick={() => { addArrayItem("languagesKnown", newLanguage); setNewLanguage(""); }}
                  className="px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {biodata.personal.languagesKnown.map((lang, idx) => (
                  <span key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-3xs font-medium text-zinc-300">
                    {lang}
                    <button onClick={() => removeArrayItem("languagesKnown", idx)} className="text-zinc-500 hover:text-red-400 cursor-pointer">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* HOBBIES */}
            <div>
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Hobbies</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (addArrayItem("hobbies", newHobby), setNewHobby(""))}
                  className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none"
                  placeholder="e.g. Hiking, Writing"
                />
                <button
                  onClick={() => { addArrayItem("hobbies", newHobby); setNewHobby(""); }}
                  className="px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {biodata.personal.hobbies.map((hb, idx) => (
                  <span key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-3xs font-medium text-zinc-300">
                    {hb}
                    <button onClick={() => removeArrayItem("hobbies", idx)} className="text-zinc-500 hover:text-red-400 cursor-pointer">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* PERSONAL CUSTOM FIELDS */}
            <div className="pt-2 border-t border-zinc-900">
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Custom Fields</label>
              <div className="space-y-2 mb-2">
                {biodata.personal.customFields?.map((cf) => (
                  <div key={cf.id} className="flex gap-1.5 items-center bg-zinc-950 p-2 rounded border border-zinc-900">
                    <input
                      type="text"
                      value={cf.label}
                      onChange={(e) => updateCustomField("personal", cf.id, "label", e.target.value)}
                      className="w-1/3 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Label (e.g. Gotra)"
                    />
                    <input
                      type="text"
                      value={cf.value}
                      onChange={(e) => updateCustomField("personal", cf.id, "value", e.target.value)}
                      className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Value (e.g. Kashyap)"
                    />
                    <button
                      onClick={() => removeCustomField("personal", cf.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition"
                      title="Delete Custom Field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addCustomField("personal", "New Field", "")}
                className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-700 text-3xs text-zinc-400 hover:text-white rounded flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Personal Custom Field
              </button>
            </div>
          </div>
        )}

        {/* EDUCATION & CAREER TAB */}
        {activeTab === "education" && (
          <div className="space-y-5 animate-fadeIn duration-200">
            
            {/* QUALIFICATIONS LIST */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-400" /> Academic Qualifications
                </label>
                <button
                  onClick={addQualification}
                  className="text-3xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {biodata.qualifications.map((qual, idx) => (
                  <div key={idx} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-2 relative group">
                    <button
                      onClick={() => removeQualification(idx)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={qual.category}
                        onChange={(e) => updateQualification(idx, "category", e.target.value as any)}
                        className="col-span-1 px-1 py-1 bg-zinc-950 border border-zinc-800 rounded text-3xs text-zinc-300 focus:outline-none"
                      >
                        <option value="Post Graduation">Post Grad</option>
                        <option value="Graduation">Graduation</option>
                        <option value="Professional">Professional</option>
                        <option value="Schooling">Schooling</option>
                        <option value="Other">Other</option>
                      </select>

                      <input
                        type="text"
                        value={qual.degree}
                        onChange={(e) => updateQualification(idx, "degree", e.target.value)}
                        className="col-span-2 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                        placeholder="Degree/Course Name"
                      />
                    </div>

                    <input
                      type="text"
                      value={qual.institution || ""}
                      onChange={(e) => updateQualification(idx, "institution", e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-3xs text-zinc-300 focus:outline-none"
                      placeholder="University, College or School Name"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CURRENT PROFESSION */}
            <div className="pt-4 border-t border-zinc-800/80">
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> Current Profession Details
              </label>
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Role/Designation</label>
                    <input
                      type="text"
                      value={biodata.profession.currentRole}
                      onChange={(e) => updateProfession("currentRole", e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="e.g. Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Company/Business</label>
                    <input
                      type="text"
                      value={biodata.profession.currentCompany}
                      onChange={(e) => updateProfession("currentCompany", e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="e.g. Madmix"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Former Role (Optional)</label>
                    <input
                      type="text"
                      value={biodata.profession.formerRole || ""}
                      onChange={(e) => updateProfession("formerRole", e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="e.g. Business Analyst"
                    />
                  </div>
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Former Company (Optional)</label>
                    <input
                      type="text"
                      value={biodata.profession.formerCompany || ""}
                      onChange={(e) => updateProfession("formerCompany", e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="e.g. Planet Paaduks"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PROFESSION CUSTOM FIELDS */}
            <div className="pt-2 border-t border-zinc-900">
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Custom Fields</label>
              <div className="space-y-2 mb-2">
                {biodata.profession.customFields?.map((cf) => (
                  <div key={cf.id} className="flex gap-1.5 items-center bg-zinc-950 p-2 rounded border border-zinc-900">
                    <input
                      type="text"
                      value={cf.label}
                      onChange={(e) => updateCustomField("profession", cf.id, "label", e.target.value)}
                      className="w-1/3 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={cf.value}
                      onChange={(e) => updateCustomField("profession", cf.id, "value", e.target.value)}
                      className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => removeCustomField("profession", cf.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition"
                      title="Delete Custom Field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addCustomField("profession", "New Field", "")}
                className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-700 text-3xs text-zinc-400 hover:text-white rounded flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Professional Custom Field
              </button>
            </div>

          </div>
        )}

        {/* FAMILY & MATERNAL TAB */}
        {activeTab === "family" && (
          <div className="space-y-4 animate-fadeIn duration-200">
            
            {/* IMMEDIATE FAMILY */}
            <div>
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" /> Father & Mother Details
              </label>
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Father's Name</label>
                    <input
                      type="text"
                      value={biodata.family.fatherName}
                      onChange={(e) => setBiodata(prev => ({
                        ...prev,
                        family: { ...prev.family, fatherName: e.target.value }
                      }))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Bakulbhai Mohanbhai Vankadi"
                    />
                  </div>
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Father's Occupation</label>
                    <input
                      type="text"
                      value={biodata.family.fatherOccupation}
                      onChange={(e) => setBiodata(prev => ({
                        ...prev,
                        family: { ...prev.family, fatherOccupation: e.target.value }
                      }))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Diamond Broker"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Mother's Name</label>
                    <input
                      type="text"
                      value={biodata.family.motherName}
                      onChange={(e) => setBiodata(prev => ({
                        ...prev,
                        family: { ...prev.family, motherName: e.target.value }
                      }))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Sonalben Bakulbhai Vankadi"
                    />
                  </div>
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Mother's Occupation</label>
                    <input
                      type="text"
                      value={biodata.family.motherOccupation}
                      onChange={(e) => setBiodata(prev => ({
                        ...prev,
                        family: { ...prev.family, motherOccupation: e.target.value }
                      }))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Tutor"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SIBLINGS LIST */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider">
                  Siblings Details
                </label>
                <button
                  onClick={addSibling}
                  className="text-3xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Sibling
                </button>
              </div>

              <div className="space-y-3">
                {biodata.family.siblings.map((sib, idx) => (
                  <div key={idx} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-2 relative">
                    <button
                      onClick={() => removeSibling(idx)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={sib.relation}
                        onChange={(e) => updateSibling(idx, "relation", e.target.value as any)}
                        className="col-span-1 px-1 py-1 bg-zinc-950 border border-zinc-800 rounded text-3xs text-zinc-300 focus:outline-none"
                      >
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                      </select>

                      <input
                        type="text"
                        value={sib.name}
                        onChange={(e) => updateSibling(idx, "name", e.target.value)}
                        className="col-span-2 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                        placeholder="Sibling's Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={sib.occupation}
                        onChange={(e) => updateSibling(idx, "occupation", e.target.value)}
                        className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-3xs text-zinc-300 focus:outline-none"
                        placeholder="Occupation"
                      />
                      <input
                        type="text"
                        value={sib.education || ""}
                        onChange={(e) => updateSibling(idx, "education", e.target.value)}
                        className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-3xs text-zinc-300 focus:outline-none"
                        placeholder="Education / Degree"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MATERNAL DETAILS */}
            <div>
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                Maternal (Nani-Paksh) Details
              </label>
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-2">
                <div>
                  <label className="text-4xs font-mono text-zinc-500 uppercase">Maternal Grandfather</label>
                  <input
                    type="text"
                    value={biodata.maternal.grandfatherName}
                    onChange={(e) => updateMaternal("grandfatherName", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                    placeholder="Bhimjibhai Talsibhai Gabani"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Nani's Native Place</label>
                    <input
                      type="text"
                      value={biodata.maternal.nativePlace}
                      onChange={(e) => updateMaternal("nativePlace", e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Alampar, Umrala"
                    />
                  </div>
                  <div>
                    <label className="text-4xs font-mono text-zinc-500 uppercase">Maternal Uncle (Mama)</label>
                    <input
                      type="text"
                      value={biodata.maternal.uncleName}
                      onChange={(e) => updateMaternal("uncleName", e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Malkeshbhai Gabani"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-4xs font-mono text-zinc-500 uppercase">Uncle's Occupation (Optional)</label>
                  <input
                    type="text"
                    value={biodata.maternal.uncleOccupation || ""}
                    onChange={(e) => updateMaternal("uncleOccupation", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                    placeholder="e.g. Business Owner (Mumbai)"
                  />
                </div>
              </div>
            </div>

            {/* FAMILY CUSTOM FIELDS */}
            <div className="pt-2 border-t border-zinc-900">
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Family Custom Fields</label>
              <div className="space-y-2 mb-2">
                {biodata.family.customFields?.map((cf) => (
                  <div key={cf.id} className="flex gap-1.5 items-center bg-zinc-950 p-2 rounded border border-zinc-900">
                    <input
                      type="text"
                      value={cf.label}
                      onChange={(e) => updateCustomField("family", cf.id, "label", e.target.value)}
                      className="w-1/3 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Label (e.g. Family Wealth)"
                    />
                    <input
                      type="text"
                      value={cf.value}
                      onChange={(e) => updateCustomField("family", cf.id, "value", e.target.value)}
                      className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => removeCustomField("family", cf.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition"
                      title="Delete Custom Field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addCustomField("family", "New Field", "")}
                className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-700 text-3xs text-zinc-400 hover:text-white rounded flex items-center justify-center gap-1 cursor-pointer transition relative"
              >
                <Plus className="w-3.5 h-3.5" /> Add Family Custom Field
              </button>
            </div>

            {/* MATERNAL CUSTOM FIELDS */}
            <div className="pt-2 border-t border-zinc-900">
              <label className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Maternal Custom Fields</label>
              <div className="space-y-2 mb-2">
                {biodata.maternal.customFields?.map((cf) => (
                  <div key={cf.id} className="flex gap-1.5 items-center bg-zinc-950 p-2 rounded border border-zinc-900">
                    <input
                      type="text"
                      value={cf.label}
                      onChange={(e) => updateCustomField("maternal", cf.id, "label", e.target.value)}
                      className="w-1/3 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={cf.value}
                      onChange={(e) => updateCustomField("maternal", cf.id, "value", e.target.value)}
                      className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => removeCustomField("maternal", cf.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition"
                      title="Delete Custom Field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addCustomField("maternal", "New Field", "")}
                className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-700 text-3xs text-zinc-400 hover:text-white rounded flex items-center justify-center gap-1 cursor-pointer transition relative"
              >
                <Plus className="w-3.5 h-3.5" /> Add Maternal Custom Field
              </button>
            </div>

          </div>
        )}

        {/* PHOTOS UPLOAD & CAPTIONS TAB */}
        {activeTab === "photos" && (
          <div className="space-y-4 animate-fadeIn duration-200">
            <span className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block">
              Manage 4 Portfolio Photo Slots
            </span>
            
            {biodata.photos.map((photo, index) => (
              <div key={photo.id} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-18 rounded border border-zinc-800 bg-zinc-950 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                    {photo.url ? (
                      <img 
                        src={photo.url} 
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-2xs text-zinc-600 font-mono">No Pic</span>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-mono text-indigo-400 font-semibold">
                        Photo Slot {index + 1}
                      </span>
                      <button
                        onClick={() => fileInputRefs[index].current?.click()}
                        className="text-4xs flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 font-mono uppercase text-zinc-300 hover:text-white cursor-pointer transition"
                      >
                        <Upload className="w-2.5 h-2.5" /> Upload File
                      </button>
                      <input
                        type="file"
                        ref={fileInputRefs[index]}
                        onChange={(e) => handlePhotoUpload(index, e)}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    
                    <input
                      type="text"
                      value={photo.title}
                      onChange={(e) => updatePhotoTitle(index, e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-3xs text-white focus:outline-none"
                      placeholder="Photo Role / title (e.g. Primary Portrait)"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={photo.caption}
                  onChange={(e) => updatePhotoCaption(index, e.target.value)}
                  className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-3xs text-zinc-400 focus:outline-none"
                  placeholder="Caption detailing location, context or vibe..."
                />
              </div>
            ))}
            
            <div className="p-3.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-2xs text-zinc-400">
              <p className="leading-normal">
                💡 **Pro-Tip**: You can select any local `.jpg` or `.png` files from your device. They will be encoded into secure base64 strings and previewed live on the scrolling website instantly!
              </p>
            </div>
          </div>
        )}

        {/* CUSTOM SECTIONS TAB */}
        {activeTab === "custom" && (
          <div className="space-y-5 animate-fadeIn duration-200">
            <span className="text-3xs font-mono text-zinc-500 uppercase tracking-wider block">
              Manage Dynamic Custom Sections
            </span>
            
            {(biodata.customSections || []).map((sec) => (
              <div key={sec.id} className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded space-y-3 relative">
                <button
                  onClick={() => removeCustomSection(sec.id)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-red-400 cursor-pointer transition p-1"
                  title="Delete Section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                
                <div className="pr-8">
                  <label className="text-4xs font-mono text-zinc-500 uppercase">Section Title</label>
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => {
                      setBiodata(prev => ({
                        ...prev,
                        customSections: (prev.customSections || []).map(s => s.id === sec.id ? { ...s, title: e.target.value } : s)
                      }));
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-semibold focus:outline-none"
                    placeholder="e.g. Astrological Details"
                  />
                </div>

                <div className="space-y-2">
                  {sec.fields.map((field) => (
                    <div key={field.id} className="flex gap-1.5 items-center bg-zinc-950/40 p-2 rounded border border-zinc-900">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateFieldInCustomSection(sec.id, field.id, "label", e.target.value)}
                        className="w-1/3 px-2 py-1 bg-zinc-900 border border-zinc-850 rounded text-3xs text-white focus:outline-none"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateFieldInCustomSection(sec.id, field.id, "value", e.target.value)}
                        className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-850 rounded text-3xs text-white focus:outline-none"
                        placeholder="Value"
                      />
                      <button
                        onClick={() => removeFieldFromCustomSection(sec.id, field.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition"
                        title="Delete Field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addFieldToCustomSection(sec.id, "New Field", "")}
                  className="w-full py-1.5 border border-dashed border-zinc-800 hover:border-zinc-700 text-4xs text-zinc-400 hover:text-white rounded flex items-center justify-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3 h-3" /> Add Field to Section
                </button>
              </div>
            ))}

            <button
              onClick={() => addCustomSection("New Custom Section")}
              className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 text-xs text-white rounded flex items-center justify-center gap-1.5 cursor-pointer font-semibold transition"
            >
              <Plus className="w-4 h-4 text-indigo-400" /> Create Custom Section
            </button>
          </div>
        )}
      </div>

      {/* Footer copyright */}
      <div className="p-3 border-t border-zinc-900 text-center bg-zinc-950/40">
        <p className="text-4xs font-mono text-zinc-600 tracking-wider">
          interactive engine &copy; 2026 • built for academic showcase
        </p>
      </div>

    </div>
  );
}
