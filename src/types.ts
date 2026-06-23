export type UserRole = "student" | "faculty";

export interface StudentProfile {
  id: string;
  fullName: string;
  registerNumber: string;
  email: string;
  department: string;
  currentYear: number;
  currentSemester: number;
  role: "student";
  profilePhotoUrl?: string;
  accountStatus: "active" | "inactive";
}

export interface FacultyProfile {
  id: string;
  facultyName: string;
  facultyId: string;
  email: string;
  department: string;
  designation: string;
  role: "faculty" | "admin";
  profilePhotoUrl?: string;
  accountStatus: "active" | "inactive";
}

export interface Material {
  id: string;
  title: string;
  category: string;
  department: string;
  year: number | string;
  semester: number | string;
  uploadedBy: string; // faculty ID
  uploadedByName: string; // faculty Name
  uploadedById?: string; // Doc Owner ID
  uploadDate: string; // ISO date string
  downloadsCount: number;
  fileName: string;
  previewUrl: string; // simulated data
  fileSize: string; // e.g. "2.4 MB"
  status: "active" | "inactive";
  storagePath?: string;
  storageProvider?: "supabase" | "firebase" | string;
  bucketName?: string;
  contentType?: string;
  downloadUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  subject?: string;
  unit?: string;
}

export interface IssueReport {
  id: string; // matches reportId
  reportId?: string;
  materialId: string;
  materialTitle: string;
  studentId?: string;
  studentName: string;
  studentRoll: string; // matches registerNumber
  registerNumber?: string;
  department?: string;
  year?: string;
  semester?: string;
  facultyName?: string;
  issueType: "Wrong PDF" | "Corrupted File" | "Old Material" | "Wrong Department Mapping" | "Wrong Semester Mapping" | "Duplicate Material" | "Other Issue" | "Broken Link" | "Wrong Category" | "Poor Legibility" | "Incorrect Content" | "Other";
  reportReason?: string;
  description: string;
  reportDate: string; // matches timestamp
  timestamp?: string;
  status: "pending" | "resolved" | "dismissed";
}

export type ActiveScreen =
  | "LAUNCHER"
  | "LOGIN"
  | "STUDENT_DASHBOARD"
  | "STUDENT_BROWSE"
  | "STUDENT_QUESTION_PAPERS"
  | "STUDENT_REPORTS"
  | "STUDENT_PROFILE"
  | "FACULTY_DASHBOARD"
  | "FACULTY_UPLOAD"
  | "FACULTY_MANAGE"
  | "FACULTY_QUESTION_PAPERS"
  | "FACULTY_REPORTS"
  | "FACULTY_PROFILE"
  | "ADMIN_USERS";
