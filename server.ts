import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "src", "db.json");

// Default seed biodata matching SAMPLE_BIODATA
const SEED_BIODATA = {
  personal: {
    fullName: "Yashvi B. Vankadi",
    briefIntro: "I am a humble, kind, family-oriented girl. I'm a food lover who likes to taste more. Also an adventurous person who loves to travel & explore places.",
    dateOfBirth: "14th January 1999",
    height: "5ft 2inchs",
    weight: "55 kgs",
    caste: "Leuva Patel",
    languagesKnown: ["Gujarati", "English", "Hindi", "Marathi"],
    hobbies: ["Listening Podcasts", "Foodie", "Exploring Places", "Reading Autobiographies"],
    nativePlace: "Mandava, Botad",
    address: "A-9, 202, Shanti Vihar, Opp. Sector 2, Mira Road (E), Thane - 401107",
    contactName: "Bakulbhai Vankadi",
    contactPhone: "+91 93 244 90797",
    customFields: []
  },
  qualifications: [
    {
      category: "Post Graduation",
      degree: "Post Graduation in Data Science",
      institution: "Upgrad - IIIT Bangalore"
    },
    {
      category: "Post Graduation",
      degree: "CS - Executive",
      institution: "ICSI"
    },
    {
      category: "Graduation",
      degree: "Bachelor of Commerce (B.Com)",
      institution: "Bhavan's College Andheri"
    },
    {
      category: "Graduation",
      degree: "Bachelor of Law (L.L.B.)"
    }
  ],
  profession: {
    currentRole: "Manager (E-commerce & Quick Commerce)",
    currentCompany: "Madmix",
    formerRole: "Business Analyst",
    formerCompany: "Planet Paaduks",
    skills: ["Data Analysis", "SQL Programming", "E-Commerce Strategy", "Python Scripting", "Logistics Operations", "Business Intelligence"],
    customFields: []
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
    ],
    customFields: []
  },
  maternal: {
    grandfatherName: "Bhimjibhai Talsibhai Gabani",
    nativePlace: "Alampar, Umrala",
    uncleName: "Malkeshbhai Gabani",
    uncleOccupation: "Business Owner (Mumbai)",
    customFields: []
  },
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
  ],
  customSections: []
};

// Ensure database file exists
function initDatabase() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(SEED_BIODATA, null, 2), "utf8");
    console.log("Database initialized with seed data.");
  }
}

async function startServer() {
  initDatabase();

  const app = express();
  app.use(express.json({ limit: "50mb" })); // Support large base64 uploads

  // API Route: Get Biodata
  app.get("/api/biodata", (req, res) => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf8");
        const parsed = JSON.parse(raw);
        return res.json(parsed);
      }
      return res.json(SEED_BIODATA);
    } catch (e) {
      console.error("Failed to read database file:", e);
      return res.status(500).json({ error: "Failed to read database" });
    }
  });

  // API Route: Save Biodata
  app.post("/api/biodata", (req, res) => {
    try {
      const data = req.body;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
      return res.json({ success: true, message: "Biodata saved successfully" });
    } catch (e) {
      console.error("Failed to write to database file:", e);
      return res.status(500).json({ error: "Failed to save biodata" });
    }
  });

  // Serve static assets or mount Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
