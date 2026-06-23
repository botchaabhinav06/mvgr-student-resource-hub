import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { UserCheck, Search, ShieldAlert, Loader2, Edit2, X, Save } from "lucide-react";
import { getEffectiveDepartment, getEffectiveYear, getEffectiveSemester } from "../../lib/normalization";

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);

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

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Users...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">User Management</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Dept</th>
              <th className="p-3">Year</th>
              <th className="p-3">Sem</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-800">
                <td className="p-3">{user.fullName || user.facultyName || "N/A"}</td>
                <td className="p-3 uppercase text-xs font-bold">{user.role}</td>
                <td className="p-3">{user.department || "N/A"}</td>
                <td className="p-3">{user.currentYear || user.year || "N/A"}</td>
                <td className="p-3">{user.currentSemester || user.semester || "N/A"}</td>
                <td className="p-3">
                  {user.role === "student" && (
                    <button onClick={() => setEditingUser(user)} className="p-1 hover:text-cyan-400 cursor-pointer">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Edit Student Academic Fields</h3>
            <input className="w-full bg-slate-950 p-2 border border-slate-700 rounded" value={editingUser.department} onChange={e => setEditingUser({...editingUser, department: e.target.value})} placeholder="Department" />
            <input className="w-full bg-slate-950 p-2 border border-slate-700 rounded" value={editingUser.year} onChange={e => setEditingUser({...editingUser, year: Number(e.target.value)})} placeholder="Year" />
            <input className="w-full bg-slate-950 p-2 border border-slate-700 rounded" value={editingUser.semester} onChange={e => setEditingUser({...editingUser, semester: Number(e.target.value)})} placeholder="Semester" />
            <div className="flex gap-2">
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 bg-slate-800 rounded">Cancel</button>
                <button onClick={() => handleUpdate(editingUser)} className="px-4 py-2 bg-cyan-600 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
