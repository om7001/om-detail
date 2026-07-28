export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface CustomSection {
  id: string;
  title: string;
  fields: CustomField[];
}

export interface PersonalDetails {
  fullName: string;
  briefIntro: string;
  dateOfBirth: string;
  height: string;
  weight: string;
  caste: string;
  languagesKnown: string[];
  hobbies: string[];
  nativePlace: string;
  address: string;
  contactName: string;
  contactPhone: string;
  customFields?: CustomField[];
}

export interface QualificationItem {
  category: "Professional" | "Graduation" | "Post Graduation" | "Schooling" | "Other";
  degree: string;
  institution?: string;
  year?: string;
}

export interface ProfessionDetails {
  currentRole: string;
  currentCompany: string;
  formerRole?: string;
  formerCompany?: string;
  skills: string[];
  customFields?: CustomField[];
}

export interface SiblingItem {
  name: string;
  relation: "Brother" | "Sister";
  occupation: string;
  education?: string;
}

export interface FamilyDetails {
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  siblings: SiblingItem[];
  customFields?: CustomField[];
}

export interface MaternalDetails {
  grandfatherName: string;
  nativePlace: string;
  uncleName: string;
  uncleOccupation?: string;
  customFields?: CustomField[];
}

export interface BiodataPhoto {
  id: number;
  url: string;
  title: string;
  caption: string;
}

export interface Biodata {
  personal: PersonalDetails;
  qualifications: QualificationItem[];
  profession: ProfessionDetails;
  family: FamilyDetails;
  maternal: MaternalDetails;
  photos: BiodataPhoto[];
  customSections?: CustomSection[];
  watermarkText?: string;
  pdfFileData?: string;
  pdfFileName?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  primaryClass: string;     /* tailwind text color e.g., text-cyan-400 */
  borderClass: string;      /* tailwind border color */
  bgGradient: string;       /* tailwind gradient classes e.g., from-cyan-500/10 to-transparent */
  glowColor: string;        /* rgba or hexadecimal shadow glow */
  accentText: string;       /* text color for tags/highlights */
  chipBg: string;           /* background for badges/chips */
  activeBorder: string;     /* border ring for active element */
}

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
}
