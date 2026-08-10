// src/components/RapidMarkingModal.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Check, X, Clock, ArrowRight, XCircle, ChevronLeft, UserCheck } from 'lucide-react';

export default function RapidMarkingModal({ students, groupTitle, selectedDate, user, onClose, currentAttendance }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionRecords, setSessionRecords] = useState(currentAttendance || {});
    const [isSaving, setIsSaving] = useState(false);

    if (!students || students.length === 0) {
        return (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No Students Available</h3>
                    <p className="text-xs text-slate-400">There are no registered students in this group selection.</p>
                    <button onClick={onClose} className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-500 transition">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentStudent = students[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / students.length) * 100);

    const saveMarking = async (status) => {
        setIsSaving(true);
        const updatedRecords = { ...sessionRecords, [currentStudent.id]: status };
        setSessionRecords(updatedRecords);

        try {
            if (user?.uid) {
                await setDoc(doc(db, 'users', user.uid, 'attendance', selectedDate), {
                    records: updatedRecords
                }, { merge: true });
            } else {
                await setDoc(doc(db, 'attendance', selectedDate), {
                    records: updatedRecords
                }, { merge: true });
            }
        } catch (err) {
            console.error("Error saving attendance record:", err);
        } finally {
            setIsSaving(false);
        }

        if (currentIndex < students.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-6 py-4 text-white flex justify-between items-center shrink-0">
                    <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/15 px-2.5 py-0.5 rounded-full text-indigo-100">
                            {groupTitle}
                        </span>
                        <h2 className="font-extrabold text-xl mt-0.5">Rapid Marking</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
                    >
                        <XCircle className="w-7 h-7" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 shrink-0">
                    <div
                        className="bg-emerald-500 h-2 transition-all duration-300 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Student Card Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5 overflow-y-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 rounded-full">
                            Student {currentIndex + 1} of {students.length}
                        </span>
                        <span className="text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
                            Group {currentStudent.groupId}
                        </span>
                    </div>

                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-indigo-500/25 my-2">
                        {currentStudent.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            {currentStudent.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                            ID: <span className="font-mono text-slate-300">{currentStudent.id}</span>
                        </p>
                    </div>

                    {/* Status Pill */}
                    <div className="pt-1">
                        <span className="text-xs font-semibold text-slate-400">Current Status: </span>
                        {sessionRecords[currentStudent.id] === 'present' && (
                            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 stroke-[3]" /> PRESENT
                            </span>
                        )}
                        {sessionRecords[currentStudent.id] === 'absent' && (
                            <span className="text-xs font-bold bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full border border-rose-500/30 inline-flex items-center gap-1">
                                <X className="w-3.5 h-3.5 stroke-[3]" /> ABSENT
                            </span>
                        )}
                        {sessionRecords[currentStudent.id] === 'pending' && (
                            <span className="text-xs font-bold bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> MARK LATER
                            </span>
                        )}
                        {!sessionRecords[currentStudent.id] && (
                            <span className="text-xs font-semibold bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
                                UNMARKED
                            </span>
                        )}
                    </div>
                </div>

                {/* Primary Action Panel */}
                <div className="p-4 sm:p-5 bg-slate-950/50 border-t border-slate-800 shrink-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => saveMarking('present')}
                            disabled={isSaving}
                            className="py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition disabled:opacity-50"
                        >
                            <Check className="w-6 h-6 stroke-[3]" /> Present
                        </button>

                        <button
                            onClick={() => saveMarking('absent')}
                            disabled={isSaving}
                            className="py-3.5 sm:py-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition disabled:opacity-50"
                        >
                            <X className="w-6 h-6 stroke-[3]" /> Absent
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => saveMarking('pending')}
                            disabled={isSaving}
                            className="py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition disabled:opacity-50"
                        >
                            <Clock className="w-4 h-4" /> Mark Later
                        </button>

                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
                                disabled={currentIndex === 0}
                                className="px-3 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 disabled:opacity-40 transition"
                                title="Previous Student"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => currentIndex < students.length - 1 ? setCurrentIndex(c => c + 1) : onClose()}
                                className="flex-1 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition"
                            >
                                {currentIndex < students.length - 1 ? (
                                    <>Skip <ArrowRight className="w-4 h-4" /></>
                                ) : (
                                    'Done'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}