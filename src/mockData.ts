import { StudentProfile, FacultyProfile, Material, IssueReport } from "./types";

export const DEPARTMENTS = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "CHEMICAL",
  "CHEM",
  "CSD",
  "CSM",
  "CSIC",
  "CIC",
  "CSIT",
  "CSE (AI & ML)"
] as const;

export const MATERIAL_CATEGORIES = [
  "Lesson PDF",
  "Lesson PPT / Slides PDF",
  "Subject Syllabus Copy",
  "Lab Manual",
  "Notes / Handwritten Notes"
] as const;

export const initialStudents: StudentProfile[] = [
  {
    id: "std-1",
    fullName: "Botcha Abhinav",
    registerNumber: "19331A1201",
    email: "student@mvgr.edu",
    department: "IT",
    currentYear: 3,
    currentSemester: 2,
    role: "student",
    accountStatus: "active"
  },
  {
    id: "std-2",
    fullName: "S. Sai Kiran",
    registerNumber: "19331A0501",
    email: "saikiran@mvgr.edu",
    department: "CSE",
    currentYear: 3,
    currentSemester: 2,
    role: "student",
    accountStatus: "active"
  }
];

export const initialStudent = initialStudents[0];

export const initialFaculty: FacultyProfile = {
  id: "fac-1",
  facultyName: "Dr. R. Prasada Rao",
  facultyId: "MVGR-FAC-IT-01",
  email: "faculty.it@mvgr.edu",
  department: "IT",
  designation: "Professor & HOD",
  role: "faculty",
  accountStatus: "active"
};

export const initialMaterials: Material[] = [
  {
    id: "mat-1",
    title: "Computer Networks Lecture Notes - Sliding Window Protocols",
    category: "Notes / Handwritten Notes",
    department: "IT",
    year: 3,
    semester: 2,
    uploadedBy: "MVGR-FAC-IT-01",
    uploadedByName: "Dr. R. Prasada Rao",
    uploadDate: "2026-05-10T10:00:00Z",
    downloadsCount: 14,
    fileName: "cn-sliding-window.pdf",
    previewUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf",
    fileSize: "1.8 MB",
    status: "active"
  },
  {
    id: "mat-2",
    title: "Data Structures & Algorithms - Complete Syllabus Guide",
    category: "Syllabus Copy",
    department: "IT",
    year: 2,
    semester: 1,
    uploadedBy: "MVGR-FAC-IT-01",
    uploadedByName: "Dr. R. Prasada Rao",
    uploadDate: "2026-05-15T14:30:00Z",
    downloadsCount: 38,
    fileName: "dsa-syllabus-core.pdf",
    previewUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf",
    fileSize: "2.4 MB",
    status: "active"
  }
];

export const initialReports: IssueReport[] = [
  {
    id: "TKT-3024",
    materialId: "mat-1",
    materialTitle: "Computer Networks Lecture Notes - Sliding Window Protocols",
    studentName: "Botcha Abhinav",
    studentRoll: "19331A1201",
    issueType: "Wrong Category",
    description: "This is tagged as Lecture Notes, but includes actual midterm study question sheets as well. Please verify.",
    reportDate: "2026-05-21T08:00:00Z",
    status: "pending",
    facultyName: "Dr. R. Prasada Rao"
  },
  {
    id: "TKT-4122",
    materialId: "mat-2",
    materialTitle: "Data Structures & Algorithms - Complete Syllabus Guide",
    studentName: "Botcha Abhinav",
    studentRoll: "19331A1201",
    issueType: "Wrong Semester Mapping",
    description: "DSA Syllabus is mapped to Sem 1, but we are taking it in Sem 2 according to recent MVGR IT r20 curriculum tweaks.",
    reportDate: "2026-05-22T11:45:00Z",
    status: "resolved",
    facultyName: "Dr. R. Prasada Rao"
  }
];
