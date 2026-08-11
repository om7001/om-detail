import { Biodata, ThemeConfig, AnimationPreset } from "./types";

export const SAMPLE_BIODATA: Biodata = {
  personal: {
    fullName: "Om S. Maniya",
    briefIntro: "I am a humble, kind, family-oriented girl. I'm a food lover who likes to taste more. Also an adventurous person who loves to travel & explore places.",
    dateOfBirth: "18th November 2002",
    height: "5ft 11inch",
    weight: "93 kgs",
    caste: "Leuva Patel",
    languagesKnown: ["Gujarati", "English", "Hindi"],
    hobbies: ["Listening Podcasts", "Foodie", "Exploring Places", "Driving"],
    nativePlace: "Jaliya, Umarala",
    address: "A-502 Sukan Flats, near Rajpalace, New Mahollo, Katargam, Surat - 395004",
    contactName: "Sanjaybhai Maniya",
    contactPhone: "+91 98259 08437"
  },
  qualifications: [
    {
      category: "Graduation",
      degree: "B.Tech Information & Technology",
      institution: "Ganpat University"
    }
  ],
  profession: {
    currentRole: "Manager (E-commerce & Quick Commerce)",
    currentCompany: "Madmix",
    formerRole: "Business Analyst",
    formerCompany: "Planet Paaduks",
    skills: ["Data Analysis", "SQL Programming", "E-Commerce Strategy", "Python Scripting", "Logistics Operations", "Business Intelligence"]
  },
  family: {
    fatherName: "Bakulbhai Mohanbhai Vankadi",
    fatherOccupation: "Diamond Broker",
    motherName: "Sonalben Bakulbhai Vankadi",
    motherOccupation: "Tutor",
    siblings: [
      {
        name: "Mithil Bakulbhai Vankadi",
        relation: "Brother",
        occupation: "Analyst - Internal Audit (Deloitte, Mumbai)",
        education: "Bachelors: B.M.S., Mumbai University"
      }
    ]
  },
  maternal: {
    grandfatherName: "Bhimjibhai Talsibhai Gabani",
    nativePlace: "Alampar, Umrala",
    uncleName: "Malkeshbhai Gabani",
    uncleOccupation: "Business Owner (Mumbai)"
  },
  watermarkText: "Yashvi B. Vankadi",
  photos: [
    {
      id: 1,
      url: "/src/assets/images/photo_primary_1783960106958.jpg",
      title: "Primary Profile",
      caption: "Yashvi B. Vankadi - Main Portrait"
    },
    {
      id: 2,
      url: "/src/assets/images/photo_tech_1783960123937.jpg",
      title: "Professional",
      caption: "IT & Data Analyst Professional Showcase"
    },
    {
      id: 3,
      url: "/src/assets/images/photo_casual_1783960140038.jpg",
      title: "Casual & Travel",
      caption: "Adventurous spirit, exploring new places"
    },
    {
      id: 4,
      url: "/src/assets/images/photo_workspace_1783960156340.jpg",
      title: "Creative Space",
      caption: "Creative workspace & IT student lifestyle"
    }
  ]
};

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: "artistic-flair",
    name: "Artistic Flair",
    primaryClass: "text-sky-400",
    borderClass: "border-sky-500/20",
    bgGradient: "from-sky-500/10 to-transparent",
    glowColor: "rgba(14, 165, 233, 0.15)",
    accentText: "text-sky-300",
    chipBg: "bg-sky-950/40 text-sky-300 border-sky-500/20",
    activeBorder: "ring-2 ring-sky-400"
  },
  {
    id: "cyber-indigo",
    name: "Cyber Indigo",
    primaryClass: "text-indigo-400",
    borderClass: "border-indigo-500/30",
    bgGradient: "from-indigo-600/10 to-transparent",
    glowColor: "rgba(99, 102, 241, 0.15)",
    accentText: "text-indigo-300",
    chipBg: "bg-indigo-950/40 text-indigo-300 border-indigo-500/20",
    activeBorder: "ring-2 ring-indigo-500"
  },
  {
    id: "rose-gold-dark",
    name: "Rose Gold & Gold",
    primaryClass: "text-amber-300",
    borderClass: "border-rose-400/20",
    bgGradient: "from-rose-500/10 to-transparent",
    glowColor: "rgba(244, 63, 94, 0.12)",
    accentText: "text-rose-300",
    chipBg: "bg-rose-950/40 text-amber-200 border-rose-400/20",
    activeBorder: "ring-2 ring-amber-400"
  },
  {
    id: "neon-emerald",
    name: "Terminal Mint",
    primaryClass: "text-emerald-400",
    borderClass: "border-emerald-500/25",
    bgGradient: "from-emerald-600/8 to-transparent",
    glowColor: "rgba(16, 185, 129, 0.15)",
    accentText: "text-emerald-300",
    chipBg: "bg-emerald-950/40 text-emerald-300 border-emerald-500/20",
    activeBorder: "ring-2 ring-emerald-500"
  },
  {
    id: "cyan-vapor",
    name: "Cyan Synthwave",
    primaryClass: "text-cyan-400",
    borderClass: "border-cyan-500/25",
    bgGradient: "from-cyan-500/10 to-transparent",
    glowColor: "rgba(6, 182, 212, 0.15)",
    accentText: "text-cyan-300",
    chipBg: "bg-cyan-950/40 text-cyan-200 border-cyan-500/20",
    activeBorder: "ring-2 ring-cyan-400"
  },
  {
    id: "amber-obsidian",
    name: "Amber Obsidian",
    primaryClass: "text-amber-400",
    borderClass: "border-amber-500/30",
    bgGradient: "from-amber-600/10 to-transparent",
    glowColor: "rgba(245, 158, 11, 0.15)",
    accentText: "text-amber-300",
    chipBg: "bg-amber-950/40 text-amber-300 border-amber-500/25",
    activeBorder: "ring-2 ring-amber-400"
  }
];

export const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: "fade-up",
    name: "Smooth Drift Up",
    description: "Elements gently float upwards and fade in sequentially as you scroll."
  },
  {
    id: "slide-in",
    name: "Staggered Slide-In",
    description: "Alternate sections slide in elegantly from the left and right margins."
  },
  {
    id: "scale-focus",
    name: "Spring Scale Zoom",
    description: "Modern micro-scaling zoom-ins with organic spring physics on entering."
  },
  {
    id: "rotate-3d",
    name: "3D Perspective Reveal",
    description: "Advanced technological 3D tilt-flip reveal that turns into place as you scroll."
  }
];
