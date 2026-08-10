// src/components/GroupManagementModal.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { FolderPlus, Trash2, UserPlus, X, Users, AlertCircle, Plus } from 'lucide-react';

export default function GroupManagementModal({ user, groups, students, onClose }) {
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState(groups[0] || '');
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentId, setNewStudentId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Add New Group
    const handleAddGroup = async (e) => {
        e.preventDefault();
        setError('');
        const trimmed = newGroupName.trim();
        if (!trimmed) return;

        const groupNum = parseInt(trimmed, 10);
        const gId = isNaN(groupNum) ? trimmed : groupNum;

        if (groups.includes(gId)) {
            setError(`Group ${gId} already exists!`);
            return;
        }

        setLoading(true);
        try {
            // Create group doc in Firestore under user scope
            await setDoc(doc(db, 'users', user.uid, 'groups', `group-${gId}`), {
                groupId: gId,
                createdAt: new Date().toISOString()
            });
            setNewGroupName('');
            setSelectedGroupId(gId);
        } catch (err) {
            console.error("Error creating group:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete Group and its students
    const handleDeleteGroup = async (gId) => {
        if (!window.confirm(`Are you sure you want to delete Group ${gId} and all students inside it?`)) return;
        setLoading(true);
        try {
            // Delete group metadata
            await deleteDoc(doc(db, 'users', user.uid, 'groups', `group-${gId}`));
            
            // Delete associated students
            const groupStudents = students.filter(s => s.groupId === gId);
            const batch = writeBatch(db);
            groupStudents.forEach(s => {
                const sRef = doc(db, 'users', user.uid, 'students', s.id);
                batch.delete(sRef);
            });
            await batch.commit();

            if (selectedGroupId === gId) {
                const remaining = groups.filter(g => g !== gId);
                setSelectedGroupId(remaining[0] || '');
            }
        } catch (err) {
            console.error("Error deleting group:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Add Student to Selected Group
    const handleAddStudent = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedGroupId) {
            setError('Please select or create a group first.');
            return;
        }
        if (!newStudentName.trim()) {
            setError('Student Name is required.');
            return;
        }

        const customId = newStudentId.trim() || `std-${Date.now()}`;
        setLoading(true);
        try {
            await setDoc(doc(db, 'users', user.uid, 'students', customId), {
                name: newStudentName.trim(),
                groupId: selectedGroupId,
                createdAt: new Date().toISOString()
            });
            setNewStudentName('');
            setNewStudentId('');
        } catch (err) {
            console.error("Error adding student:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete Single Student
    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm("Remove this student from group?")) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'students', studentId));
        } catch (err) {
            console.error("Error removing student:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const currentGroupStudents = students.filter(s => s.groupId === selectedGroupId);

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
                            <FolderPlus className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-extrabold text-white">Manage Groups & Roster</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2.5 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    
                    {/* 1. Add Group Section */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            <FolderPlus className="w-4 h-4" /> Create New Group
                        </h3>
                        <form onSubmit={handleAddGroup} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Group Number or Name (e.g. 6 or Group 6)"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={loading || !newGroupName.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" /> Add Group
                            </button>
                        </form>
                    </div>

                    {/* 2. Group Selector & Student Addition */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Group to Modify</label>
                            <span className="text-xs text-indigo-400 font-semibold">{groups.length} Active Groups</span>
                        </div>

                        {/* Group Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                            {groups.map(gId => (
                                <div key={gId} className="flex items-center shrink-0">
                                    <button
                                        onClick={() => setSelectedGroupId(gId)}
                                        className={`px-3.5 py-2 rounded-l-xl text-xs font-bold transition border ${
                                            selectedGroupId === gId
                                                ? 'bg-indigo-600 text-white border-indigo-500'
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                    >
                                        Group {gId}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(gId)}
                                        className={`px-2 py-2 rounded-r-xl border border-l-0 text-xs transition ${
                                            selectedGroupId === gId
                                                ? 'bg-indigo-700 text-rose-300 border-indigo-500 hover:bg-rose-600 hover:text-white'
                                                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-rose-400'
                                        }`}
                                        title={`Delete Group ${gId}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Student Form */}
                        {selectedGroupId && (
                            <form onSubmit={handleAddStudent} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-3">
                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <UserPlus className="w-4 h-4" /> Add Student to Group {selectedGroupId}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Student Name *"
                                        value={newStudentName}
                                        onChange={(e) => setNewStudentName(e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Student ID (Optional)"
                                        value={newStudentId}
                                        onChange={(e) => setNewStudentId(e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !newStudentName.trim()}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <UserPlus className="w-4 h-4" /> Add Student
                                </button>
                            </form>
                        )}

                        {/* Current Group Student List */}
                        {selectedGroupId && (
                            <div className="bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-300">Group {selectedGroupId} Roster</span>
                                    <span className="text-[11px] text-slate-400 font-semibold">{currentGroupStudents.length} Students</span>
                                </div>
                                <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto">
                                    {currentGroupStudents.length === 0 ? (
                                        <p className="p-4 text-xs text-center text-slate-500">No students in Group {selectedGroupId} yet.</p>
                                    ) : (
                                        currentGroupStudents.map(student => (
                                            <div key={student.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/30 transition">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-200">{student.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">ID: {student.id}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                                    title="Delete Student"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
