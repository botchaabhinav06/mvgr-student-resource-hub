import React, { useState, useEffect } from "react";
import { Sparkles, Terminal, Box, Shield, ArrowRight, CornerDownRight, LogOut, CheckCircle, Flame, Building, Loader2, AlertCircle, Eye, EyeOff, Sun, Moon } from "lucide-react";

// Types
import { ActiveScreen, StudentProfile, FacultyProfile, Material, IssueReport } from "./types";

// Firebase integrations
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot, collection, query, where, setDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase/firebaseConfig";

// Supabase integrations
import { supabase } from "./lib/supabaseClient";
import { apiUrl } from "./lib/apiBase";

// Mock prebaked seed lists

// Structure navigation controllers
import { StudentSidebar } from "./components/StudentSidebar";
import { FacultySidebar } from "./components/FacultySidebar";
import { TopNavbar } from "./components/TopNavbar";
import { PDFPreviewModal } from "./components/PDFPreviewModal";

// Views student layout
import { DashboardView as StudentDashboard } from "./views/student/DashboardView";
import { BrowseView as StudentBrowse } from "./views/student/BrowseView";
import { ReportsView as StudentReports } from "./views/student/ReportsView";
import { ProfileView as StudentProfileView } from "./views/student/ProfileView";
import { QuestionPapersView as StudentQuestionPapers } from "./views/student/QuestionPapersView";

// Views faculty layout
import { DashboardView as FacultyDashboard } from "./views/faculty/DashboardView";
import { UploadView as FacultyUpload } from "./views/faculty/UploadView";
import { ManageView as FacultyManage } from "./views/faculty/ManageView";
import { QuestionPapersView as FacultyQuestionPapers } from "./views/faculty/QuestionPapersView";
import { ReportsView as FacultyReports } from "./views/faculty/ReportsView";
import { ProfileView as FacultyProfileView } from "./views/faculty/ProfileView";
import { R2TestView } from "./views/R2TestView";

const mapFirestoreUser = (uid: string, data: any): StudentProfile | FacultyProfile => {
  const role = data.role === "student" ? "student" : (data.role === "admin" ? "admin" : "faculty");
  const name = data.name || data.fullName || data.facultyName || "MVGR Member";
  const status = data.status || data.accountStatus || "active";
  
  if (role === "student") {
    return {
      id: uid,
      fullName: name,
      registerNumber: data.registerNumber || "19331A1201",
      email: data.email || "student@mvgr.edu",
      department: data.department || "IT",
      currentYear: Number(data.year || data.currentYear || 3),
      currentSemester: Number(data.semester || data.currentSemester || 2),
      role: "student",
      accountStatus: status as "active" | "inactive",
    };
  } else {
    // Both "faculty" and "admin" roles map to FacultyProfile
    return {
      id: uid,
      facultyName: name,
      facultyId: data.facultyId || "MVGR-FAC-IT-01",
      email: data.email || "faculty.it@mvgr.edu",
      department: data.department || "IT",
      designation: data.designation || "Professor & HOD",
      role: role as "faculty" | "admin",
      accountStatus: status as "active" | "inactive",
    };
  }
};

export default function App() {
  // Theme State Setup
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("mvgr-theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("mvgr-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Session Access state
  const [currentUser, setCurrentUser] = useState<StudentProfile | FacultyProfile | null>(null);
  const [loginRole, setLoginRole] = useState<"student" | "faculty">("student");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);

  // System Core Collections State
  const [materials, setMaterials] = useState<Material[]>([]);
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<Material[]>([]);
  const [toastMessage, setToastMessage] = useState("");

  // Routing State
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("STUDENT_DASHBOARD");
  const [facultyUploadPrefilledSubject, setFacultyUploadPrefilledSubject] = useState<string | null>(null);
  const [facultyUploadPrefilledType, setFacultyUploadPrefilledType] = useState<"study_material" | "question_paper" | undefined>(undefined);

  // UX modal triggers
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [previewingMaterial, setPreviewingMaterial] = useState<Material | null>(null);

  // Session Persistence on Mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          let userSnap;
          try {
            userSnap = await getDoc(userDocRef);
          } catch (dbErr) {
            handleFirestoreError(dbErr, OperationType.GET, `users/${firebaseUser.uid}`);
          }

          if (userSnap && userSnap.exists()) {
            const data = userSnap.data();
            if (data.status === "inactive" || data.accountStatus === "inactive") {
              setLoginError("ACCOUNT IS INACTIVE. PLEASE CONTACT THE DEPARTMENT ADVISOR.");
              setCurrentUser(null);
              await signOut(auth);
            } else {
              const mapped = mapFirestoreUser(firebaseUser.uid, data);
              setCurrentUser(mapped);
              
              // Set starting screen based on the loaded role
              if (mapped.role === "student") {
                setActiveScreen("STUDENT_DASHBOARD");
              } else {
                setActiveScreen("FACULTY_DASHBOARD");
              }
            }
          } else {
            console.warn("Firestore profile doesn't exist for signed-in UID:", firebaseUser.uid);
            // Dynamic profile fallback to ensure robust app preview experience
            const fallback = mapFirestoreUser(firebaseUser.uid, {
              name: firebaseUser.displayName || "MVGR Student",
              email: firebaseUser.email || "student@mvgr.edu",
              role: "student",
              status: "active"
            });
            setCurrentUser(fallback);
            setActiveScreen("STUDENT_DASHBOARD");
          }
        } catch (err: any) {
          console.error("Auth initialization failed:", err);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Materials Subscription matching Roles with background auto-seeding
  useEffect(() => {
    if (!currentUser) {
      setMaterials([]);
      return;
    }

    const materialsCol = collection(db, "materials");
    let q;
    if (currentUser.role === "student") {
      q = query(materialsCol, where("status", "==", "active"));
    } else {
      q = query(materialsCol);
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Material[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || "",
          category: data.category || "",
          department: data.department || "",
          year: data.year ? String(data.year) : "1",
          semester: data.semester ? String(data.semester) : "1",
          uploadedBy: data.uploadedBy || "",
          uploadedByName: data.uploadedByName || "",
          uploadedById: data.uploadedById || "",
          uploadDate: data.uploadDate || new Date().toISOString(),
          downloadsCount: Number(data.downloadsCount || 0),
          fileName: data.fileName || data.file || "",
          previewUrl: data.previewUrl || "",
          fileSize: String(data.fileSize || data.size || "1.5 MB"),
          status: (data.status || "active") as "active" | "inactive",
          subject: data.subject || "General",
          unit: data.unit || "General",
          storageProvider: data.storageProvider || "supabase",
          bucketName: data.bucketName || "",
          storagePath: data.storagePath || "",
          contentType: data.contentType || "application/pdf",
          downloadUrl: data.downloadUrl || "",
        });
      });
      list.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      setMaterials(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "materials");
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Real-time Reports Subscription matching Roles securely
  useEffect(() => {
    if (!currentUser) {
      setReports([]);
      return;
    }

    const reportsCol = collection(db, "reports");
    let q;
    if (currentUser.role === "student") {
      const rollNumber = (currentUser as StudentProfile).registerNumber || "";
      q = query(reportsCol, where("studentRoll", "==", rollNumber));
    } else {
      q = query(reportsCol);
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: IssueReport[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          reportId: data.reportId || docSnap.id,
          materialId: data.materialId || "",
          materialTitle: data.materialTitle || "",
          studentId: data.studentId || "",
          studentName: data.studentName || "",
          studentRoll: data.studentRoll || data.registerNumber || "",
          registerNumber: data.registerNumber || data.studentRoll || "",
          department: data.department || "",
          year: data.year ? String(data.year) : "",
          semester: data.semester ? String(data.semester) : "",
          issueType: data.issueType || data.reason || "Other",
          reportReason: data.reportReason || data.reason || data.issueType || "Other",
          description: data.description || data.note || "",
          reportDate: data.reportDate || data.createdAt || new Date().toISOString(),
          timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
          status: (data.status || "pending") as "pending" | "resolved" | "dismissed",
          facultyName: data.facultyName || ""
        });
      });
      list.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
      setReports(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "reports");
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Real-time Users Subscription for Faculty/Admin Analytics securely
  useEffect(() => {
    if (!currentUser || currentUser.role === "student") {
      setAllUsers([]);
      return;
    }

    const usersCol = collection(db, "users");
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      setAllUsers(list);
    }, (error) => {
      console.warn("Could not load users database analytics securely:", error);
      setAllUsers([]);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Routing and Role Access Security Guard
  useEffect(() => {
    if (!currentUser) return;
    const path = activeScreen;
    if (currentUser.role === "student" && !path.startsWith("STUDENT_")) {
      setActiveScreen("STUDENT_DASHBOARD");
    } else if ((currentUser.role === "faculty" || currentUser.role === "admin") && !path.startsWith("FACULTY_")) {
      setActiveScreen("FACULTY_DASHBOARD");
    }
  }, [currentUser, activeScreen]);

  // Authentication trigger workflow
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("PLEASE ENTER BOTH EMAIL AND SECURE PASSWORD.");
      return;
    }

    setLoginError("");
    setLoginLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      const uid = userCredential.user.uid;

      const userDocRef = doc(db, "users", uid);
      let userSnap;
      try {
        userSnap = await getDoc(userDocRef);
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.GET, `users/${uid}`);
      }

      if (userSnap && userSnap.exists()) {
        const data = userSnap.data();
        if (data.status === "inactive" || data.accountStatus === "inactive") {
          setLoginError("ACCOUNT IS INACTIVE. PLEASE CONTACT THE DEPARTMENT ADVISOR.");
          setLoginLoading(false);
          await signOut(auth);
          return;
        }

        // Role Validation
        const actualRole = data.role;
        
        if (loginRole === "student") {
          if (actualRole !== "student") {
            setLoginError("This account is not registered as a Student. Please use the correct login portal.");
            setLoginLoading(false);
            await signOut(auth);
            return;
          }
        } else if (loginRole === "faculty") {
          if (actualRole !== "faculty" && actualRole !== "admin") {
            setLoginError("This account is not registered as Faculty/Admin. Please use the correct login portal.");
            setLoginLoading(false);
            await signOut(auth);
            return;
          }
        }

        const mapped = mapFirestoreUser(uid, data);
        setCurrentUser(mapped);

        if (mapped.role === "student") {
          setActiveScreen("STUDENT_DASHBOARD");
        } else {
          setActiveScreen("FACULTY_DASHBOARD");
        }

        setLoginEmail("");
        setLoginPassword("");
      } else {
        // Fallback profile if Firestore user profiles was not seeded fully
        console.warn("Firestore record missing for authenticated UID:", uid);
        const fallback = mapFirestoreUser(uid, {
          name: userCredential.user.displayName || (loginRole === "student" ? "Botcha Abhinav" : "Dr. R. Prasada Rao"),
          email: userCredential.user.email || (loginRole === "student" ? "student@mvgr.edu" : "faculty.it@mvgr.edu"),
          role: loginRole,
          status: "active"
        });
        setCurrentUser(fallback);
        if (loginRole === "student") {
          setActiveScreen("STUDENT_DASHBOARD");
        } else {
          setActiveScreen("FACULTY_DASHBOARD");
        }
      }
    } catch (authErr: any) {
      console.error("Firebase Auth sign-in failed:", authErr);
      let msg = "AUTHENTICATION ERROR. VERIFY NETWORK AND SECURE PASSWORDS.";
      if (authErr.code === "auth/invalid-credential" || authErr.code === "auth/wrong-password" || authErr.code === "auth/user-not-found") {
        msg = "INVALID EMAIL OR PASSWORD. PLEASE RETRY.";
      } else if (authErr.code === "auth/invalid-email") {
        msg = "INVALID EMAIL FORMAT ASSIGNED.";
      } else if (authErr.code === "auth/too-many-requests") {
        msg = "TOO MANY ATTEMPTS. SECURELY LOCKED TEMPORARILY.";
      }
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setLogoutModalOpen(false);
      setActiveScreen("STUDENT_DASHBOARD");
    } catch (err: any) {
      console.error("Sign out process failed:", err);
    }
  };

  // State actions: Student download click triggers increment in Firestore
  const handleDownloadMaterial = async (m: Material) => {
    if (m.storageProvider === "cloudflare-r2") {
      if (!m.storagePath) {
        setToastMessage("Error: Missing secure storage path for R2 download.");
        setTimeout(() => setToastMessage(""), 5000);
        return;
      }
      setToastMessage("Preparing secure PDF download link...");
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          throw new Error("Your session expired. Please log in again.");
        }

        const response = await fetch(apiUrl("/api/r2/signed-url"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            materialId: m.id,
            storagePath: m.storagePath,
            action: "download",
            fileName: m.fileName
          })
        });

        if (!response.ok) {
          let errMsg = `Server responded with status ${response.status}`;
          if (response.status === 401) {
            errMsg = "Your session expired. Please log in again.";
          } else if (response.status === 403) {
            errMsg = "You are not authorized to access this material.";
          } else if (response.status === 404) {
            errMsg = "Backend API route not found. Check VITE_API_BASE_URL or backend deployment.";
          } else {
            const errData = await response.json().catch(() => ({}));
            errMsg = errData.error || errData.message || errMsg;
          }
          throw new Error(errMsg);
        }

        const data = await response.json();
        if (!data.ok || !data.signedUrl) {
          throw new Error("Invalid signed URL response from server");
        }

        const signedUrl = data.signedUrl;

        // Trigger safe client-side download by initiating open/redirect with _blank target to bypass sandbox iframe limits
        const a = document.createElement("a");
        a.href = signedUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        // Since we overridden ResponseContentDisposition, the browser will treat it as attachment natively
        a.setAttribute("download", m.fileName || "material.pdf");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Now update Firestore count since download successfully started
        const docRef = doc(db, "materials", m.id);
        await updateDoc(docRef, {
          downloadsCount: (m.downloadsCount || 0) + 1,
          updatedAt: new Date().toISOString()
        });

        // Record list metrics locally
        if (!downloadHistory.some((item) => item.id === m.id)) {
          setDownloadHistory((prev) => [{ ...m, downloadsCount: (m.downloadsCount || 0) + 1 }, ...prev]);
        }

        setToastMessage("PDF download started.");
        setTimeout(() => setToastMessage(""), 4000);
        return;
      } catch (err: any) {
        console.error("Cloudflare R2 signed URL download preparation failure:", err);
        const displayErr = err.message || "Unable to prepare secure PDF link. Please try again.";
        setToastMessage(displayErr);
        setTimeout(() => setToastMessage(""), 5000);
        return;
      }
    }

    if (!m.previewUrl) {
      setToastMessage("PDF preview is not available for this material.");
      setTimeout(() => setToastMessage(""), 4000);
      return;
    }

    setToastMessage(`Fetching "${m.fileName || m.title}" for download...`);

    let blob: Blob | null = null;

    try {
      if (m.storageProvider === "supabase" && m.storagePath) {
        // Use Supabase Storage download API with storagePath
        const { data, error } = await supabase.storage.from("materials-pdfs").download(m.storagePath);
        if (error) {
          throw new Error(error.message);
        }
        blob = data;
      } else {
        // Fallback behavior: Fetch previewUrl as a blob
        const res = await fetch(m.previewUrl);
        if (!res.ok) {
          throw new Error(`HTTP status check error during direct file stream retrieval: ${res.status}`);
        }
        blob = await res.blob();
      }

      if (!blob) {
        throw new Error("Unable to parse file blob content.");
      }

      // Trigger actual native direct browser download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = m.fileName || "material.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      // Now update Firestore count since download successfully started
      const docRef = doc(db, "materials", m.id);
      await updateDoc(docRef, {
        downloadsCount: (m.downloadsCount || 0) + 1,
        updatedAt: new Date().toISOString()
      });

      // Record list metrics locally
      if (!downloadHistory.some((item) => item.id === m.id)) {
        setDownloadHistory((prev) => [{ ...m, downloadsCount: m.downloadsCount + 1 }, ...prev]);
      }

      setToastMessage("PDF download started.");
      setTimeout(() => setToastMessage(""), 4000);
    } catch (err: any) {
      console.error("Direct download failure:", err);
      setToastMessage("Direct download failed. Please open the PDF in a new tab and download manually.");
      setTimeout(() => setToastMessage(""), 5000);
      throw err; // propagates to the UI so loading state stops
    }
  };

  // State actions: Student files report ticket to Firestore
  const handleReportIssue = async (newReportData: Omit<IssueReport, "id" | "studentName" | "studentRoll" | "reportDate" | "status">) => {
    if (!currentUser) return;
    const materialItem = materials.find((m) => m.id === newReportData.materialId);
    const reportId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const reportDoc = {
      id: reportId,
      reportId: reportId,
      materialId: newReportData.materialId,
      materialTitle: newReportData.materialTitle,
      studentId: currentUser.id,
      studentName: currentUser.role === "student" ? (currentUser as StudentProfile).fullName : "Coord Admin",
      studentRoll: currentUser.role === "student" ? (currentUser as StudentProfile).registerNumber : "ADMIN",
      registerNumber: currentUser.role === "student" ? (currentUser as StudentProfile).registerNumber : "ADMIN",
      department: currentUser.role === "student" ? (currentUser as StudentProfile).department : "IT",
      year: currentUser.role === "student" ? String((currentUser as StudentProfile).currentYear) : "3",
      semester: currentUser.role === "student" ? String((currentUser as StudentProfile).currentSemester) : "2",
      issueType: newReportData.issueType,
      reportReason: newReportData.issueType,
      reason: newReportData.issueType,
      description: newReportData.description,
      note: newReportData.description,
      status: "pending",
      reportDate: now,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
      facultyName: materialItem ? materialItem.uploadedByName : "Dr. R. Prasada Rao"
    };

    try {
      const docRef = doc(db, "reports", reportId);
      await setDoc(docRef, reportDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reports/${reportId}`);
    }
  };

  // State actions: Faculty compiles and inserts new file into Firestore
  const handleFacultyUploadSuccess = async (newMatData: any) => {
    if (!currentUser) return;
    const matId = newMatData.id || `MAT-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const docData = {
      id: matId,
      title: newMatData.title,
      category: newMatData.category,
      department: newMatData.department,
      year: String(newMatData.year),
      semester: String(newMatData.semester),
      uploadedBy: (currentUser as FacultyProfile).facultyId || "MVGR-FAC-IT-01",
      uploadedByName: (currentUser as FacultyProfile).facultyName || "Dr. R. Prasada Rao",
      uploadedById: currentUser.id,
      uploadDate: now,
      downloadsCount: 0,
      fileName: newMatData.fileName,
      previewUrl: newMatData.previewUrl || "",
      fileSize: newMatData.fileSize || "1.5 MB",
      status: "active",
      storagePath: newMatData.storagePath || "",
      storageProvider: newMatData.storageProvider || "supabase",
      bucketName: newMatData.bucketName || "",
      createdAt: now,
      updatedAt: now,
      subject: newMatData.subject || "General",
      unit: newMatData.unit || "General",
      norm_department: newMatData.norm_department,
      norm_year: newMatData.norm_year,
      norm_semester: newMatData.norm_semester,
      normalizationStatus: newMatData.normalizationStatus,
      normalizationVersion: newMatData.normalizationVersion,
    };

    try {
      const docRef = doc(db, "materials", matId);
      await setDoc(docRef, docData);
      
      if (newMatData.storageProvider === "cloudflare-r2") {
        setToastMessage("Material uploaded and linked successfully using Cloudflare R2.");
      } else {
        setToastMessage("Material uploaded and linked successfully using Supabase Storage.");
      }
      setTimeout(() => setToastMessage(""), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `materials/${matId}`);
    }
  };

  // State actions: Faculty updates file specifications in Firestore
  const handleFacultyUpdateMaterial = async (updatedMat: Material) => {
    try {
      const docRef = doc(db, "materials", updatedMat.id);
      await updateDoc(docRef, {
        title: updatedMat.title,
        category: updatedMat.category,
        department: updatedMat.department,
        year: String(updatedMat.year),
        semester: String(updatedMat.semester),
        status: updatedMat.status || "active",
        subject: updatedMat.subject || "General",
        unit: updatedMat.unit || "General",
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `materials/${updatedMat.id}`);
    }
  };

  // State actions: Faculty deletes file from Firestore (supports single ID or array of IDs)
  const handleFacultyDeleteMaterial = async (ids: string | string[]) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    let successes = 0;
    let r2Successes = 0;
    const failures: string[] = [];

    for (const id of idList) {
      const item = materials.find(m => m.id === id);
      try {
        if (item && item.storageProvider === "cloudflare-r2") {
          // 2. Validate material.storagePath exists
          if (!item.storagePath) {
            throw new Error("Missing secure storage path (storagePath) for Cloudflare R2 material.");
          }

          // 3. Call POST /api/r2/delete-object
          const idToken = await auth.currentUser?.getIdToken();
          
          const response = await fetch(apiUrl("/api/r2/delete-object"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify({
              storagePath: item.storagePath
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.message || `HTTP error ${response.status}`;
            throw new Error(`Cloudflare R2 file deletion failed. Material record was not deleted. Details: ${errMsg}`);
          }

          const resData = await response.json().catch(() => ({}));
          if (!resData.ok) {
            throw new Error(`Cloudflare R2 file deletion failed. Material record was not deleted. Details: ${resData.message || 'unknown error'}`);
          }

          r2Successes++;

          // 4. Delete Firestore document after successful R2 delete
          try {
            const docRef = doc(db, "materials", id);
            await deleteDoc(docRef);
            successes++;
          } catch (fsErr: any) {
            console.error(`Firestore delete failed after R2 delete succeeded for ${id}:`, fsErr);
            throw new Error(`Cloudflare R2 file was deleted, but Firestore record deletion failed. Please retry or clean the record manually. Error: ${fsErr.message}`);
          }

        } else if (item && (item.storageProvider === "supabase" || !item.storageProvider) && item.storagePath) {
          // Delete PDF in Supabase Storage
          const { error } = await supabase.storage.from("materials-pdfs").remove([item.storagePath]);
          if (error) {
            console.warn(`Legacy Supabase file deletion failed for ${item.storagePath}: ${error.message}. Proceeding to delete Firestore document.`);
            setToastMessage("Legacy Supabase record removed from catalog. The old storage file may remain in Supabase and can be cleaned manually later.");
            setTimeout(() => setToastMessage(""), 6000);
          }
          
          // Delete Firestore document
          const docRef = doc(db, "materials", id);
          await deleteDoc(docRef);
          successes++;
        } else {
          // Default fallback (e.g. catalog indexing only)
          const docRef = doc(db, "materials", id);
          await deleteDoc(docRef);
          successes++;
        }
      } catch (err: any) {
        console.error(`Failed to delete material ${id}:`, err);
        failures.push(item?.title || id);
        // Direct descriptive toast message update since we want immediate visibility
        setToastMessage(err.message || String(err));
        setTimeout(() => setToastMessage(""), 6000);
      }
    }

    if (failures.length > 0) {
      const errorMsg = `Completed with issues. Purged ${successes}/${idList.length} files. Failed files: ${failures.join(", ")}`;
      // Check if it was an R2-specific error and we already set the toast inside the loop,
      // but let's override with a summary or keep it descriptive.
      throw new Error(errorMsg);
    } else {
      const containsR2 = idList.some(id => {
        const item = materials.find(m => m.id === id);
        return item && item.storageProvider === "cloudflare-r2";
      });

      if (containsR2 && idList.length === 1) {
        setToastMessage("Material and Cloudflare R2 file deleted successfully.");
      } else {
        setToastMessage(idList.length > 1 
          ? `Successfully purged ${successes} materials from catalog indexing and storage.`
          : `Successfully deleted material and associated Supabase PDF.`
        );
      }
      setTimeout(() => setToastMessage(""), 4000);
    }
  };

  // State actions: Faculty resolves student reported ticket in Firestore
  const handleFacultyResolveReport = async (id: string) => {
    try {
      const docRef = doc(db, "reports", id);
      await updateDoc(docRef, {
        status: "resolved",
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${id}`);
    }
  };

  // State actions: Faculty dismisses student reported ticket in Firestore
  const handleFacultyDismissReport = async (id: string) => {
    try {
      const docRef = doc(db, "reports", id);
      await updateDoc(docRef, {
        status: "dismissed",
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${id}`);
    }
  };

  // State actions: Faculty deletes student reported ticket from Firestore
  const handleFacultyDeleteReport = async (id: string) => {
    try {
      const docRef = doc(db, "reports", id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${id}`);
    }
  };

  // Render content according to router state
  const renderMainViewContent = () => {
    if (!currentUser) return null;

    if (currentUser.role === "student") {
      switch (activeScreen) {
        case "STUDENT_DASHBOARD":
          return (
            <StudentDashboard
              user={currentUser as StudentProfile}
              materials={materials}
              reports={reports}
              setScreen={setActiveScreen}
              recordedDownloadsCount={downloadHistory.length}
              triggerPreview={(m) => setPreviewingMaterial(m)}
            />
          );
        case "STUDENT_BROWSE":
          return (
            <StudentBrowse
              user={currentUser as StudentProfile}
              materials={materials}
              onDownload={handleDownloadMaterial}
              triggerPreview={(m) => setPreviewingMaterial(m)}
              onSubmitReport={handleReportIssue}
            />
          );
        case "STUDENT_QUESTION_PAPERS":
          return (
            <StudentQuestionPapers
              user={currentUser as StudentProfile}
              materials={materials}
              onDownload={handleDownloadMaterial}
              triggerPreview={(m) => setPreviewingMaterial(m)}
              onSubmitReport={handleReportIssue}
            />
          );
        case "STUDENT_REPORTS":
          return (
            <StudentReports
              user={currentUser as StudentProfile}
              reports={reports}
              setScreen={(s) => setActiveScreen(s)}
            />
          );
        case "STUDENT_PROFILE":
          return (
            <StudentProfileView
              user={currentUser as StudentProfile}
              onUpdateUser={(updated) => setCurrentUser(updated)}
            />
          );
        default:
          return <p className="text-slate-400">View Not Configured</p>;
      }
    } else {
      switch (activeScreen) {
        case "FACULTY_DASHBOARD":
          return (
            <FacultyDashboard
              user={currentUser as FacultyProfile}
              materials={materials}
              reports={reports}
              setScreen={setActiveScreen}
            />
          );
        case "FACULTY_UPLOAD":
          return (
            <FacultyUpload
              user={currentUser as FacultyProfile}
              onUploadSuccess={handleFacultyUploadSuccess}
              setScreen={(screen) => {
                if (screen !== "FACULTY_UPLOAD") {
                  setFacultyUploadPrefilledSubject(null);
                  setFacultyUploadPrefilledType(undefined);
                }
                setActiveScreen(screen);
              }}
              prefilledSubject={facultyUploadPrefilledSubject || undefined}
              prefilledUploadType={facultyUploadPrefilledType}
            />
          );
        case "FACULTY_MANAGE":
          return (
            <FacultyManage
              materials={materials}
              onDeleteMaterial={handleFacultyDeleteMaterial}
              onUpdateMaterial={handleFacultyUpdateMaterial}
              setScreen={(screen) => {
                if (screen !== "FACULTY_UPLOAD") {
                  setFacultyUploadPrefilledSubject(null);
                  setFacultyUploadPrefilledType(undefined);
                }
                setActiveScreen(screen);
              }}
              triggerPreview={(m) => setPreviewingMaterial(m)}
              onUploadToSubject={(subj) => {
                setFacultyUploadPrefilledSubject(subj);
                setFacultyUploadPrefilledType("study_material");
                setActiveScreen("FACULTY_UPLOAD");
              }}
            />
          );
        case "FACULTY_QUESTION_PAPERS":
          return (
            <FacultyQuestionPapers
              materials={materials}
              onDeleteMaterial={handleFacultyDeleteMaterial}
              onUpdateMaterial={handleFacultyUpdateMaterial}
              setScreen={(screen) => {
                if (screen !== "FACULTY_UPLOAD") {
                  setFacultyUploadPrefilledSubject(null);
                  setFacultyUploadPrefilledType(undefined);
                }
                setActiveScreen(screen);
              }}
              triggerPreview={(m) => setPreviewingMaterial(m)}
              onUploadToSubject={(subj, type) => {
                setFacultyUploadPrefilledSubject(subj);
                setFacultyUploadPrefilledType(type || "question_paper");
                setActiveScreen("FACULTY_UPLOAD");
              }}
            />
          );
        case "FACULTY_REPORTS":
          return (
            <FacultyReports
              reports={reports}
              onResolveReport={handleFacultyResolveReport}
              onDismissReport={handleFacultyDismissReport}
              onDeleteReport={handleFacultyDeleteReport}
              setScreen={setActiveScreen}
            />
          );
        case "FACULTY_PROFILE":
          return (
            <FacultyProfileView
              user={currentUser as FacultyProfile}
              materialsCount={materials.filter((m) => m.uploadedBy === (currentUser as FacultyProfile).facultyId).length}
            />
          );
        default:
          return <p className="text-slate-400">View Not Configured</p>;
      }
    }
  };

  // Render R2 test view directly if on that route
  if (window.location.pathname === "/r2-test" || window.location.hash === "#/r2-test") {
    return <R2TestView />;
  }

  if (authInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans relative">
        <div className="academic-bg-glow absolute inset-0 pointer-events-none" />
        <div className="text-center space-y-4 animate-pulse relative z-10">
          <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyber-cyan inline-flex items-center justify-center">
            <Box className="w-8 h-8 animate-spin text-cyber-cyan" />
          </div>
          <p className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            Connecting Secure Session Gateways...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-white flex flex-col font-sans antialiased overflow-x-hidden">
      {!currentUser ? (
        /* Cyber Neon Secure Login Page Screen with Premium Hero Section */
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 relative min-h-screen gap-8 lg:gap-16 max-w-7xl mx-auto w-full">
          {/* Floating Theme Toggle Switch for Login Screen (Icon-only) */}
          <div className="absolute top-6 right-6 z-50">
            <button
              onClick={toggleTheme}
              id="auth-theme-toggle"
              className="p-3 cyber-glass text-slate-400 hover:text-slate-850 dark:hover:text-white rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
              ) : (
                <Moon className="w-5 h-5 text-emerald-600 animate-pulse" />
              )}
            </button>
          </div>
          
          <div className="academic-bg-glow absolute inset-0 pointer-events-none" />

          {/* PREMIUM HERO SECTION (FIX 1) */}
          <div className="flex-1 flex flex-col justify-center max-w-lg space-y-6 text-center lg:text-left relative z-10 animate-in fade-in slide-in-from-left-6 duration-500 w-full px-4 sm:px-0">
            <div className="p-3 cyber-glass rounded-2xl w-fit mx-auto lg:mx-0 flex items-center gap-3 shadow-xl">
              <img
                src="https://www.mvgrce.com/sites/default/files/logo.png"
                alt="MVGR College Logo"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="text-left font-sans hidden sm:block">
                <p className="text-[9px] font-mono font-bold text-theme-muted-text tracking-widest uppercase">Estd 1997</p>
                <h4 className="text-sm font-black text-theme-hero-main tracking-tight uppercase leading-none">MVGR College</h4>
                <p className="text-[9px] text-theme-muted-text">Autonomous Institution</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-theme-hero-main block uppercase leading-none">
                MVGR College <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-hero-cyan to-theme-hero-violet">Student Resource Hub</span>
              </h1>
              <p className="text-sm text-theme-body-text leading-relaxed font-sans font-medium px-2 sm:px-6 lg:px-0">
                Academic materials, collaboration, and smart resource management for students and faculty. Access notes, syllabus, term solutions, and file discrepancies instantly.
              </p>
            </div>

            <div className="hidden sm:grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 font-sans text-xs text-theme-body-text">
              <div className="space-y-1.5 p-3 rounded-xl cyber-glass">
                <span className="text-theme-hero-cyan font-extrabold font-mono text-[11px] uppercase tracking-wide">01 // BROWSE DISCOVER</span>
                <p className="text-[11px] leading-snug text-theme-body-text">Academic databases, study guides, and notes mapped exactly by term semester.</p>
              </div>
              <div className="space-y-1.5 p-3 rounded-xl cyber-glass">
                <span className="text-theme-hero-violet font-extrabold font-mono text-[11px] uppercase tracking-wide">02 // REPORT COMPLIANCE</span>
                <p className="text-[11px] leading-snug text-theme-body-text">Lodge file discrepancies directly to department coordinators for real-time fixes.</p>
              </div>
            </div>
          </div>

          {/* LOGIN CARD COLUMN */}
          <div className="w-full max-w-md p-5 sm:p-6 pb-6 sm:pb-7 rounded-2xl cyber-glass shadow-2xl relative block overflow-hidden z-10 self-center animate-in fade-in slide-in-from-right-6 duration-500">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-theme-hero-cyan via-theme-hero-violet to-rose-500" />

            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <div className="p-2.5 bg-theme-teal-action/10 rounded-xl border border-theme-teal-action/20 text-theme-teal-action flex items-center justify-center">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display font-black text-xl tracking-tight text-theme-hero-main uppercase block leading-none">
                  Login
                </h1>
              </div>
            </div>

            {/* Selector Trigger Slider */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setLoginRole("student");
                  setLoginError("");
                }}
                className={`py-2 rounded-lg font-bold uppercase transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  loginRole === "student"
                    ? "bg-theme-teal-action/10 text-theme-teal-action border-theme-teal-action/25 shadow-sm"
                    : "text-theme-muted-text border-transparent hover:text-theme-hero-main hover:bg-theme-teal-action/5"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole("faculty");
                  setLoginError("");
                }}
                className={`py-2 rounded-lg font-bold uppercase transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  loginRole === "faculty"
                    ? "bg-theme-teal-action/10 text-theme-teal-action border-theme-teal-action/25 shadow-sm"
                    : "text-theme-muted-text border-transparent hover:text-theme-hero-main hover:bg-theme-teal-action/5"
                }`}
              >
                HOD Faculty
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-theme-muted-text uppercase tracking-widest block mb-1.5 font-bold">
                  Institutional Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-theme-muted-text font-mono text-xs font-bold uppercase">
                    @:
                  </span>
                  <input
                    type="email"
                    required
                    placeholder={loginRole === "student" ? "student@mvgr.edu" : "faculty.it@mvgr.edu"}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-lg bg-theme-input-bg border border-theme-input-border text-theme-input-text focus:outline-none focus:border-theme-teal-action font-mono tracking-wide placeholder-theme-input-placeholder block"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-theme-muted-text uppercase tracking-widest block mb-1.5 font-bold">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-theme-muted-text font-mono text-xs font-extrabold uppercase pr-1 select-none">
                    ***
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter secure password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-lg bg-theme-input-bg border border-theme-input-border text-theme-input-text focus:outline-none focus:border-theme-teal-action font-mono tracking-wide placeholder-theme-input-placeholder block"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-theme-muted-text hover:text-theme-hero-main transition-colors focus:outline-none cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono font-bold text-rose-400 text-center uppercase tracking-wide">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-lg bg-theme-login-btn-bg hover:bg-theme-login-btn-hover text-theme-login-btn-text text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-theme-login-btn-text" />
                    Authenticating Security Gate...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4 text-theme-login-btn-text" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Main Workspace Framed Dashboard Layout */
        <div className="flex-1 flex max-w-full relative">
          
          {/* Responsive custom-built sidebars */}
          {currentUser.role === "student" ? (
            <StudentSidebar
              currentScreen={activeScreen}
              setScreen={setActiveScreen}
              onLogoutClick={() => setLogoutModalOpen(true)}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
          ) : (
            <FacultySidebar
              currentScreen={activeScreen}
              setScreen={setActiveScreen}
              onLogoutClick={() => setLogoutModalOpen(true)}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
          )}

          {/* Main workspace container wrapper */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
            <TopNavbar
              currentScreen={activeScreen}
              setMobileOpenHandler={() => setMobileOpen(true)}
              user={currentUser}
              reports={reports}
              onResolveReport={handleFacultyResolveReport}
              onDismissReport={handleFacultyDismissReport}
              setScreen={setActiveScreen}
              onLogoutClick={() => setLogoutModalOpen(true)}
              theme={theme}
              onToggleTheme={toggleTheme}
            />

            {/* Inner scroll container layout */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
              {renderMainViewContent()}
            </main>
          </div>
        </div>
      )}

      {/* Logout system alert overlay */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/15">
              <LogOut className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 mb-1">
              Confirm Account Logout?
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed font-sans">
              Are you sure you want to log out of your session?
            </p>

            <div className="grid grid-cols-2 gap-3 font-sans">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-850 text-xs text-slate-400 font-semibold cursor-pointer"
              >
                No, Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Screen overlay */}
      {previewingMaterial && (
        <PDFPreviewModal
          material={previewingMaterial}
          onClose={() => setPreviewingMaterial(null)}
          onDownload={handleDownloadMaterial} // Increment counts dynamically
        />
      )}

      {/* Floating System Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-mono font-bold text-cyber-cyan box-glow-cyan shadow-2xl animate-bounce">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
