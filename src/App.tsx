import React, { useState, useEffect } from "react";
import { Sparkles, Terminal, Box, Shield, ArrowRight, CornerDownRight, LogOut, CheckCircle, Flame, Building, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

// Types
import { ActiveScreen, StudentProfile, FacultyProfile, Material, IssueReport } from "./types";

// Firebase integrations
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot, collection, query, where, setDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase/firebaseConfig";

// Supabase integrations
import { supabase } from "./lib/supabaseClient";

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

// Views faculty layout
import { DashboardView as FacultyDashboard } from "./views/faculty/DashboardView";
import { UploadView as FacultyUpload } from "./views/faculty/UploadView";
import { ManageView as FacultyManage } from "./views/faculty/ManageView";
import { ReportsView as FacultyReports } from "./views/faculty/ReportsView";
import { ProfileView as FacultyProfileView } from "./views/faculty/ProfileView";

const mapFirestoreUser = (uid: string, data: any): StudentProfile | FacultyProfile => {
  const role = data.role === "student" ? "student" : "faculty";
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
    return {
      id: uid,
      facultyName: name,
      facultyId: data.facultyId || "MVGR-FAC-IT-01",
      email: data.email || "faculty.it@mvgr.edu",
      department: data.department || "IT",
      designation: data.designation || "Professor & HOD",
      role: "faculty",
      accountStatus: status as "active" | "inactive",
    };
  }
};

export default function App() {
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
          fileName: data.fileName || "",
          previewUrl: data.previewUrl || "",
          fileSize: data.fileSize || "1.5 MB",
          status: (data.status || "active") as "active" | "inactive",
          subject: data.subject || "General",
          unit: data.unit || "General",
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

        // Align selected loginRole with account role
        const profileRole = data.role === "student" ? "student" : "faculty";
        if (loginRole === "student" && profileRole !== "student") {
          setLoginError("UNAUTHORIZED ROLE: SELECTED STUDENT LOGIN BUT ACCOUNT IS FACULTY.");
          setLoginLoading(false);
          await signOut(auth);
          return;
        }
        if (loginRole === "faculty" && profileRole !== "student" && profileRole !== "faculty" && data.role !== "admin") {
          setLoginError("UNAUTHORIZED ROLE: SELECTED FACULTY LOGIN BUT ACCOUNT IS STUDENT.");
          setLoginLoading(false);
          await signOut(auth);
          return;
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
      createdAt: now,
      updatedAt: now,
      subject: newMatData.subject || "General",
      unit: newMatData.unit || "General",
    };

    try {
      const docRef = doc(db, "materials", matId);
      await setDoc(docRef, docData);
      
      setToastMessage("Material uploaded and linked successfully using Supabase Storage.");
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
    const failures: string[] = [];

    for (const id of idList) {
      const item = materials.find(m => m.id === id);
      try {
        if (item && item.storageProvider === "supabase" && item.storagePath) {
          // Delete PDF in Supabase Storage
          const { error } = await supabase.storage.from("materials-pdfs").remove([item.storagePath]);
          if (error) {
            throw new Error(`Supabase PDF destruction failed: ${error.message}`);
          }
        }
        
        // Delete Firestore document
        const docRef = doc(db, "materials", id);
        await deleteDoc(docRef);
        successes++;
      } catch (err: any) {
        console.error(`Failed to delete material ${id}:`, err);
        failures.push(item?.title || id);
      }
    }

    if (failures.length > 0) {
      const errorMsg = `Completed with issues. Purged ${successes}/${idList.length} files. Failed files: ${failures.join(", ")}`;
      setToastMessage(errorMsg);
      setTimeout(() => setToastMessage(""), 7000);
      throw new Error(errorMsg);
    } else {
      setToastMessage(idList.length > 1 
        ? `Successfully purged ${successes} materials from catalog indexing and Supabase Storage.`
        : `Successfully deleted material and associated Supabase PDF.`
      );
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
                }
                setActiveScreen(screen);
              }}
              prefilledSubject={facultyUploadPrefilledSubject || undefined}
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
                }
                setActiveScreen(screen);
              }}
              triggerPreview={(m) => setPreviewingMaterial(m)}
              onUploadToSubject={(subj) => {
                setFacultyUploadPrefilledSubject(subj);
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

  if (authInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,229,255,0.03),transparent_40%)]" />
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
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 relative min-h-screen gap-12 lg:gap-16 max-w-7xl mx-auto w-full">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,229,255,0.04),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(139,92,246,0.04),transparent_40%)] pointer-events-none" />

          {/* PREMIUM HERO SECTION (FIX 1) */}
          <div className="flex-1 flex flex-col justify-center max-w-lg space-y-6 text-left relative z-10 animate-in fade-in slide-in-from-left-6 duration-500">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl w-fit flex items-center gap-3 backdrop-blur shadow-xl">
              <img
                src="https://www.mvgrce.com/sites/default/files/logo.png"
                alt="MVGR College Logo"
                className="h-14 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="text-left font-sans">
                <p className="text-[9px] font-mono font-bold text-slate-500 tracking-widest uppercase">Estd 1997</p>
                <h4 className="text-xs font-black text-white tracking-tight uppercase leading-none">MVGR College</h4>
                <p className="text-[9px] text-slate-400">Autonomous Institution</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white block uppercase leading-none">
                MVGR College <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Student Resource Hub</span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed font-sans font-medium">
                Academic materials, collaboration, and smart resource management for students and faculty. Access notes, syllabus, term solutions, and file discrepancies instantly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 font-sans text-xs text-slate-400">
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span className="text-cyber-cyan font-bold font-mono">01 // BROWSE DISCOVER</span>
                <p className="text-[11px] leading-snug text-slate-500">Academic databases, study guides, and notes mapped exactly by term semester.</p>
              </div>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span className="text-cyber-violet font-bold font-mono">02 // REPORT COMPLIANCE</span>
                <p className="text-[11px] leading-snug text-slate-500">Lodge file discrepancies directly to department coordinators for real-time fixes.</p>
              </div>
            </div>
          </div>

          {/* LOGIN CARD COLUMN */}
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative block overflow-hidden box-glow-cyan/5 z-10 self-center animate-in fade-in slide-in-from-right-6 duration-500">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-rose-500" />

            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyber-cyan flex items-center justify-center">
                <Box className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight text-white uppercase block leading-none">
                  Login
                </h1>
              </div>
            </div>

            {/* Selector Trigger Slider */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setLoginRole("student");
                  setLoginError("");
                }}
                className={`py-2 rounded-lg font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                  loginRole === "student"
                    ? "bg-cyan-500/15 text-cyber-cyan border border-cyan-500/20 shadow"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
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
                className={`py-2 rounded-lg font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                  loginRole === "faculty"
                    ? "bg-violet-500/15 text-cyber-violet border border-violet-500/20 shadow"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                HOD Faculty
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5 font-bold">
                  Institutional Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500 font-mono text-xs font-bold uppercase">
                    @:
                  </span>
                  <input
                    type="email"
                    required
                    placeholder={loginRole === "student" ? "student@mvgr.edu" : "faculty.it@mvgr.edu"}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 text-sm rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono tracking-wide placeholder-slate-600 block"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5 font-bold">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500 font-mono text-xs font-extrabold uppercase bg-slate-950 pr-1 select-none">
                    ***
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter secure password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3.5 text-sm rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono tracking-wide placeholder-slate-600 block"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
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
                className="w-full py-3.5 rounded-lg bg-slate-100 hover:bg-white text-slate-950 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    Authenticating Security Gate...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4 text-slate-950" />
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
