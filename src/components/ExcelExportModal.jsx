// src/components/ExcelExportModal.jsx
import React, { useState } from 'react';
import { exportAttendanceToExcel } from '../utils/excelExport';
import { Download, Calendar, X, FileSpreadsheet, Plus, Trash2, CalendarDays } from 'lucide-react';

export default function ExcelExportModal({ students, allAttendanceData, currentDate, onClose }) {
    const [exportMode, setExportMode] = useState('single'); // 'single', 'range', or 'custom'
    
    // Single & Range Date States
    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(currentDate);

    // Custom Selected Dates State (Option 3)
    const [pickerDate, setPickerDate] = useState(currentDate);
    const [selectedDatesList, setSelectedDatesList] = useState([currentDate]);

    // Available dates with attendance records in database for quick picker
    const availableRecordDates = Object.keys(allAttendanceData || {}).sort().reverse();

    const handleAddCustomDate = (dateToAdd) => {
        if (!dateToAdd) return;
        if (!selectedDatesList.includes(dateToAdd)) {
            setSelectedDatesList(prev => [...prev, dateToAdd].sort());
        }
    };

    const handleRemoveCustomDate = (dateToRemove) => {
        setSelectedDatesList(prev => prev.filter(d => d !== dateToRemove));
    };

    const handleExport = () => {
        if (exportMode === 'single') {
            exportAttendanceToExcel(students, allAttendanceData, startDate, null);
        } else if (exportMode === 'range') {
            if (startDate > endDate) {
                alert("Start Date cannot be after End Date.");
                return;
            }
            exportAttendanceToExcel(students, allAttendanceData, startDate, endDate);
        } else if (exportMode === 'custom') {
            if (selectedDatesList.length === 0) {
                alert("Please select at least one date.");
                return;
            }
            exportAttendanceToExcel(students, allAttendanceData, selectedDatesList, null);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-white">Export Attendance Report</h3>
                            <p className="text-[11px] text-slate-400">Download Excel (.xlsx) spreadsheet</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mode Switcher Tabs (3 Options) */}
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
                    <button
                        onClick={() => setExportMode('single')}
                        className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition ${
                            exportMode === 'single'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Single Date
                    </button>
                    <button
                        onClick={() => setExportMode('range')}
                        className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition ${
                            exportMode === 'range'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Date Range
                    </button>
                    <button
                        onClick={() => setExportMode('custom')}
                        className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition ${
                            exportMode === 'custom'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Select Dates
                    </button>
                </div>

                {/* Tab 1: Single Date */}
                {exportMode === 'single' && (
                    <div className="space-y-2 py-2">
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
                )}

                {/* Tab 2: Date Range */}
                {exportMode === 'range' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
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

                {/* Tab 3: Custom Specific Selected Dates */}
                {exportMode === 'custom' && (
                    <div className="space-y-4 py-1 flex-1 overflow-y-auto pr-1">
                        
                        {/* Input & Add Button */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add Specific Dates</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
                                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                                    <input
                                        type="date"
                                        value={pickerDate}
                                        onChange={(e) => setPickerDate(e.target.value)}
                                        className="bg-transparent text-xs font-semibold text-white focus:outline-none w-full cursor-pointer"
                                    />
                                </div>
                                <button
                                    onClick={() => handleAddCustomDate(pickerDate)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1 shrink-0"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </div>

                        {/* Quick Add from History Dates */}
                        {availableRecordDates.length > 0 && (
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                    <CalendarDays className="w-3.5 h-3.5 text-indigo-400" /> Recorded Dates in System:
                                </span>
                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                                    {availableRecordDates.map(dateStr => (
                                        <button
                                            key={dateStr}
                                            onClick={() => handleAddCustomDate(dateStr)}
                                            disabled={selectedDatesList.includes(dateStr)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                                                selectedDatesList.includes(dateStr)
                                                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 opacity-50 cursor-default'
                                                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-500'
                                            }`}
                                        >
                                            + {dateStr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Dates Chips */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-300 uppercase tracking-wider">
                                    Selected ({selectedDatesList.length} Dates)
                                </span>
                                {selectedDatesList.length > 0 && (
                                    <button 
                                        onClick={() => setSelectedDatesList([])} 
                                        className="text-rose-400 hover:underline text-[11px]"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                                {selectedDatesList.length === 0 ? (
                                    <p className="text-xs text-slate-500 text-center w-full py-2">No dates selected yet. Add dates above.</p>
                                ) : (
                                    selectedDatesList.map(d => (
                                        <span 
                                            key={d} 
                                            className="px-2.5 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                                        >
                                            {d}
                                            <button 
                                                onClick={() => handleRemoveCustomDate(d)}
                                                className="hover:text-rose-400 transition"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* Export Action */}
                <button
                    onClick={handleExport}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition shrink-0"
                >
                    <Download className="w-4 h-4" /> Download Excel Report
                </button>

            </div>
        </div>
    );
}
