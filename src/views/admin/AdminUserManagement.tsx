import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { UserCheck, Search, ShieldAlert, Loader2, Edit2, X, Save, Shield, Users, Award, BookOpen } from "lucide-react";
import { getEffectiveDepartment, getEffectiveYear, getEffectiveSemester } from "../../lib/normalization";

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCol = collection(db, "users");
      const userSnapshot = await getDocs(usersCol);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedUser: any) => {
    try {
      const userDocRef = doc(db, "users", updatedUser.id);
      await updateDoc(userDocRef, {
        department: updatedUser.department,
        year: updatedUser.year,
        semester: updatedUser.semester,
        norm_department: getEffectiveDepartment({ department: updatedUser.department }),
        norm_year: String(updatedUser.year),
        norm_semester: String(updatedUser.semester),
        updatedAt: new Date().toISOString()
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
       console.error("Error updating user:", error);
    }
  };

  const getUserDisplayName = (user: any) =>
    user.name || user.displayName || user.fullName || user.facultyName || user.email || user.registerNumber || "N/A";
  
  const getUserEmail = (user: any) => user.email || "N/A";
  const getUserRegNo = (user: any) => user.registerNumber || user.rollNumber || "N/A";
  const getUserStatus = (user: any) => user.status || "N/A";

  // Filter coordinates
  const filteredUsers = users.filter(user => {
    const displayName = getUserDisplayName(user).toLowerCase();
    const email = getUserEmail(user).toLowerCase();
    const regNo = getUserRegNo(user).toLowerCase();
    const matchesSearch = displayName.includes(searchTerm.toLowerCase()) || 
                          email.includes(searchTerm.toLowerCase()) || 
                          regNo.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Aggregates
  const totalStudents = users.filter(u => u.role === "student").length;
  const totalFaculty = users.filter(u => u.role === "faculty" || u.role === "staff").length;
  const totalAdmins = users.filter(u => u.role === "admin").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
        <span className="text-xs font-mono text-slate-500 tracking-wider uppercase">Loading Roster Database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-xs sm:text-sm">
      {/* Header info */}
      <div>
        <h2 className="font-display font-medium text-lg md:text-xl text-slate-100 uppercase tracking-tight">
          Campus User Management Command
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Supervise user access permissions, alter student academic fields, and synchronize department levels in real-time.
        </p>
      </div>

      {/* Aggregate stats banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Total Undergraduates</span>
            <span className="text-xl font-display font-bold text-slate-200">{totalStudents} Students</span>
          </div>
          <div className="p-2 bg-cyan-500/10 text-cyber-cyan rounded-lg border border-cyan-500/20">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Total Instruction Staff</span>
            <span className="text-xl font-display font-bold text-slate-200">{totalFaculty} Staff</span>
          </div>
          <div className="p-2 bg-violet-500/10 text-cyber-cyan rounded-lg border border-violet-500/20">
            <Award className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Repository Controllers</span>
            <span className="text-xl font-display font-bold text-slate-200">{totalAdmins} Admins</span>
          </div>
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
            <Shield className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Search and filter panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, register number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/10 dark:border-slate-800 text-xs focus:outline-none focus:border-cyan-500/50 text-slate-200 focus:ring-1 focus:ring-cyan-500/10"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Role filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Main Users Table Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-700/10 dark:border-slate-800 bg-slate-950/40 shadow-xl">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-700/10 dark:border-slate-800 text-[10px] font-mono tracking-wider text-slate-400 uppercase bg-slate-955/70">
              <th className="px-4 py-3.5">User Identity</th>
              <th className="px-4 py-3.5">Register Number</th>
              <th className="px-4 py-3.5">Security Level</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Department</th>
              <th className="px-4 py-3.5">Year / Sem</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/10">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const role = user.role || "N/A";
                const isStudent = role === "student";
                const isFaculty = role === "faculty" || role === "staff";
                const isAdmin = role === "admin";

                return (
                  <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="space-y-1 max-w-xs sm:max-w-md">
                        <h4 className="font-semibold text-slate-200 text-xs sm:text-sm truncate">
                          {getUserDisplayName(user)}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono break-all">{getUserEmail(user)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-slate-300">
                      {getUserRegNo(user)}
                    </td>
                    <td className="px-4 py-4">
                      {isAdmin ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                          Admin
                        </span>
                      ) : isFaculty ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-violet-500/10 text-cyber-cyan border border-violet-500/15 uppercase">
                          Faculty
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20 uppercase">
                          Student
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 capitalize text-xs text-slate-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${getUserStatus(user) === "active" ? "bg-emerald-500 box-glow" : "bg-slate-600"}`} />
                        {getUserStatus(user)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-300">
                      {user.department || "N/A"}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-450">
                      {isStudent ? (
                        <span>
                          Yr {user.currentYear || user.year || "N/A"} / Sem {user.currentSemester || user.semester || "N/A"}
                        </span>
                      ) : (
                        <span className="text-slate-650">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {isStudent && (
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/30 text-cyan-400 hover:text-white transition cursor-pointer"
                          title="Modify Academic Fields"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs font-mono text-slate-500">
                  No matching user accounts registered in this partition.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Student Academic Fields Modal overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <h3 className="font-display font-bold text-sm text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                <BookOpen className="w-4.5 h-4.5 text-cyber-cyan" />
                Edit Student Academic Fields
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded bg-slate-950 hover:bg-slate-850 text-slate-455 hover:text-white cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Selected Student Identity</p>
                <h4 className="text-xs font-bold text-slate-250 mt-1">{getUserDisplayName(editingUser)}</h4>
                <p className="text-[10px] font-mono text-slate-450 mt-0.5">{getUserEmail(editingUser)} // Roll: {getUserRegNo(editingUser)}</p>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-450 uppercase tracking-wider block mb-1.5">
                  Academic Department
                </label>
                <input
                  className="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  value={editingUser.department}
                  onChange={e => setEditingUser({...editingUser, department: e.target.value})}
                  placeholder="e.g. IT, CSE, MECH"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-455 uppercase tracking-wider block mb-1.5">
                    Year Link
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    className="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    value={editingUser.year}
                    onChange={e => setEditingUser({...editingUser, year: Number(e.target.value)})}
                    placeholder="Year (e.g. 3)"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-455 uppercase tracking-wider block mb-1.5">
                    Semester term
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={2}
                    className="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    value={editingUser.semester}
                    onChange={e => setEditingUser({...editingUser, semester: Number(e.target.value)})}
                    placeholder="Semester (e.g. 2)"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 font-sans">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border-slate-850 rounded-xl text-xs font-semibold text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(editingUser)}
                className="px-5 py-2 bg-cyber-cyan hover:bg-cyber-cyan/90 text-slate-950 rounded-xl text-xs font-black shadow-lg cursor-pointer"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
