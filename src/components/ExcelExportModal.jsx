// src/components/ExcelExportModal.jsx
import React, { useState } from 'react';
import { exportAttendanceToExcel } from '../utils/excelExport';
import { Download, Calendar, X, FileSpreadsheet, Check } from 'lucide-react';

export default function ExcelExportModal({ students, allAttendanceData, currentDate, onClose }) {
    const [exportMode, setExportMode] = useState('single'); // 'single' or 'range'
    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(currentDate);

    const handleExport = () => {
        if (exportMode === 'single') {
            exportAttendanceToExcel(students, allAttendanceData, startDate, null);
        } else {
            if (startDate > endDate) {
                alert("Start Date cannot be after End Date.");
                return;
            }
            exportAttendanceToExcel(students, allAttendanceData, startDate, endDate);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-white">Export Attendance Report</h3>
                            <p className="text-[11px] text-slate-400">Download Excel (.xlsx) file</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mode Switcher */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setExportMode('single')}
                        className={`py-2 text-xs font-bold rounded-xl transition ${
                            exportMode === 'single'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Selected Date
                    </button>
                    <button
                        onClick={() => setExportMode('range')}
                        className={`py-2 text-xs font-bold rounded-xl transition ${
                            exportMode === 'range'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Date Range
                    </button>
                </div>

                {/* Date Inputs */}
                {exportMode === 'single' ? (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Date</label>
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl">
                            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full cursor-pointer"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
                                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-xs font-semibold text-white focus:outline-none w-full cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
                                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-xs font-semibold text-white focus:outline-none w-full cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Action */}
                <button
                    onClick={handleExport}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition"
                >
                    <Download className="w-4 h-4" /> Download Excel Report
                </button>

            </div>
        </div>
    );
}
