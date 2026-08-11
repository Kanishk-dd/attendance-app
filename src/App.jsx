// src/App.jsx
import React, { useState, useEffect } from 'react';
import { db, auth, signOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import RapidMarkingModal from './components/RapidMarkingModal';
import LoginModal from './components/LoginModal';
import GroupManagementModal from './components/GroupManagementModal';
import ExcelExportModal from './components/ExcelExportModal';
import { 
  Calendar, 
  Download, 
  UserCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  Sparkles,
  Search,
  BarChart3,
  Layers,
  LogOut,
  FolderCog,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Data state scoped to User
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [allAttendanceData, setAllAttendanceData] = useState({});
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Navigation & Modal State
  const [activeGroupFilter, setActiveGroupFilter] = useState('all');
  const [markingModalState, setMarkingModalState] = useState({
    isOpen: false,
    groupFilter: 'all',
    title: 'All Students'
  });
  const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(false);
      if (currentUser) {
        if (currentUser.email && currentUser.email.endsWith('@iiitd.ac.in')) {
          setUser(currentUser);
          setAuthError('');
        } else {
          await signOut(auth);
          setUser(null);
          setAuthError('Access restricted: Only official IIITD emails (@iiitd.ac.in) are allowed.');
        }
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Fetch User Groups
  useEffect(() => {
    if (!user) return;

    const unsubGroups = onSnapshot(collection(db, 'users', user.uid, 'groups'), (snapshot) => {
      const fetchedGroups = snapshot.docs.map(d => d.data().groupId);
      fetchedGroups.sort((a, b) => (typeof a === 'number' && typeof b === 'number') ? a - b : String(a).localeCompare(String(b)));
      setGroups(fetchedGroups);
    });

    return () => unsubGroups();
  }, [user]);

  // Fetch User Students
  useEffect(() => {
    if (!user) return;

    const unsubStudents = onSnapshot(collection(db, 'users', user.uid, 'students'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        if (a.groupId === b.groupId) return a.name.localeCompare(b.name);
        return (typeof a.groupId === 'number' && typeof b.groupId === 'number') ? a.groupId - b.groupId : String(a.groupId).localeCompare(String(b.groupId));
      });
      setStudents(docs);
    });

    return () => unsubStudents();
  }, [user]);

  // Fetch ALL Attendance Records for range export & current date
  useEffect(() => {
    if (!user) return;

    const unsubAllAttendance = onSnapshot(collection(db, 'users', user.uid, 'attendance'), (snapshot) => {
      const history = {};
      snapshot.docs.forEach(docSnap => {
        history[docSnap.id] = docSnap.data().records || {};
      });
      setAllAttendanceData(history);
      setAttendance(history[selectedDate] || {});
    });

    return () => unsubAllAttendance();
  }, [user, selectedDate]);

  // Compute Group Analytics
  const groupStats = groups.map(gId => {
    const groupStudents = students.filter(s => s.groupId === gId);
    const present = groupStudents.filter(s => attendance[s.id] === 'present').length;
    const absent = groupStudents.filter(s => attendance[s.id] === 'absent').length;
    const pending = groupStudents.filter(s => attendance[s.id] === 'pending').length;
    const unmarked = groupStudents.length - (present + absent + pending);

    return {
      groupId: gId,
      total: groupStudents.length,
      present,
      absent,
      pending,
      unmarked,
      percentage: groupStudents.length ? Math.round((present / groupStudents.length) * 100) : 0,
      students: groupStudents
    };
  });

  // Global Overall Stats
  const totalStudents = students.length;
  const totalPresent = students.filter(s => attendance[s.id] === 'present').length;
  const totalAbsent = students.filter(s => attendance[s.id] === 'absent').length;
  const totalPending = students.filter(s => attendance[s.id] === 'pending').length;
  const totalUnmarked = totalStudents - (totalPresent + totalAbsent + totalPending);
  const overallPercentage = totalStudents ? Math.round((totalPresent / totalStudents) * 100) : 0;

  // Filtered Roster View
  const displayedStudents = students.filter(s => {
    const matchesGroup = activeGroupFilter === 'all' || s.groupId === activeGroupFilter || s.groupId === Number(activeGroupFilter);
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleOpenMarking = (groupFilter = 'all', title = 'All Students') => {
    setMarkingModalState({
      isOpen: true,
      groupFilter,
      title
    });
  };

  const getStudentsForModal = () => {
    if (markingModalState.groupFilter === 'all') {
      return students;
    }
    return students.filter(s => s.groupId === markingModalState.groupFilter || s.groupId === Number(markingModalState.groupFilter));
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading TA Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginModal user={user} error={authError} setError={setAuthError} />;
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-950 text-slate-100 pb-16 font-sans overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Logo & User Badge */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white shrink-0">
                <Users className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none">TA Attendance Hub</h1>
                  <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" /> IIITD
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Logout on Mobile */}
            <button
              onClick={handleLogout}
              className="sm:hidden p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Controls Cluster */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            
            {/* Manage Groups */}
            <button
              onClick={() => setIsGroupManagerOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs sm:text-sm px-3 py-2 rounded-xl transition border border-slate-700 active:scale-95"
            >
              <FolderCog className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Groups</span>
            </button>

            {/* Date Selector */}
            <div className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 px-2.5 py-1.5 rounded-xl transition min-w-[130px]">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer w-full"
              />
            </div>

            {/* Excel Export */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-3 py-2 rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Excel Export</span>
            </button>

            {/* Desktop Logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:block p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/80 via-slate-900 to-violet-950/80 border border-indigo-500/20 rounded-3xl p-5 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Dashboard • {user.displayName || user.email.split('@')[0]}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Single-card rapid marking, date-range Excel reporting, and live group analytics.
              </p>
            </div>

            {/* Global Marking Button */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => handleOpenMarking('all', `All ${students.length} Students`)}
                disabled={students.length === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-600/30 active:scale-95 transition disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                Mark All Students ({students.length})
              </button>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Global Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-3xl font-black text-white">{totalStudents}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">{groups.length} Groups</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Present</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-3xl font-black text-emerald-400">{totalPresent}</p>
              <p className="text-[10px] sm:text-[11px] text-emerald-500/80 font-semibold">{overallPercentage}% Rate</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-rose-500/20 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-xs font-bold uppercase tracking-wider">Absent</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-3xl font-black text-rose-400">{totalAbsent}</p>
              <p className="text-[10px] sm:text-[11px] text-rose-500/80 font-semibold">{totalStudents ? Math.round((totalAbsent/totalStudents)*100) : 0}% Rate</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">Later</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-3xl font-black text-amber-400">{totalPending}</p>
              <p className="text-[10px] sm:text-[11px] text-amber-500/80 font-medium">Pending</p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Unmarked</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-3xl font-black text-slate-300">{totalUnmarked}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Remaining</p>
            </div>
          </div>

        </div>

        {/* SECTION 1: Groups Analytics Grid */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-white">Groups & Analytics</h2>
            </div>
            <button 
              onClick={() => setIsGroupManagerOpen(true)}
              className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              + Add / Edit Groups
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
              <p className="text-slate-400 text-sm">No groups found for your account.</p>
              <button 
                onClick={() => setIsGroupManagerOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
              >
                Create First Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {groupStats.map((g) => (
                <div 
                  key={g.groupId}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-4 transition duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-400 transition">
                          Group {g.groupId}
                        </h3>
                        <span className="text-[10px] sm:text-[11px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                          {g.total} Students
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-black text-indigo-400">{g.percentage}%</span>
                      <p className="text-[9px] sm:text-[10px] uppercase font-extrabold text-slate-500">Present</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${g.total ? (g.present / g.total) * 100 : 0}%` }} title="Present" />
                      <div className="bg-rose-500 h-full" style={{ width: `${g.total ? (g.absent / g.total) * 100 : 0}%` }} title="Absent" />
                      <div className="bg-amber-500 h-full" style={{ width: `${g.total ? (g.pending / g.total) * 100 : 0}%` }} title="Mark Later" />
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium pt-1">
                      <span className="text-emerald-400">{g.present} Present</span>
                      <span className="text-rose-400">{g.absent} Absent</span>
                      <span className="text-amber-400">{g.pending} Later</span>
                      <span className="text-slate-400">{g.unmarked} Left</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenMarking(g.groupId, `Group ${g.groupId}`)}
                      disabled={g.total === 0}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      Mark Group {g.groupId}
                    </button>
                    <button
                      onClick={() => setActiveGroupFilter(g.groupId === activeGroupFilter ? 'all' : g.groupId)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
                        activeGroupFilter === g.groupId 
                          ? 'bg-slate-800 border-indigo-500 text-indigo-300' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Filter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: Roster */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          
          <div className="p-4 sm:p-6 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Student Roster 
                <span className="text-xs font-normal text-slate-400">({displayedStudents.length} Students)</span>
              </h2>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setActiveGroupFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeGroupFilter === 'all' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                All Groups
              </button>
              {groups.map((gNum) => (
                <button
                  key={gNum}
                  onClick={() => setActiveGroupFilter(gNum)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeGroupFilter === gNum 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  Group {gNum}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/40">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto">
            {displayedStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No students found in roster matching criteria.
              </div>
            ) : (
              displayedStudents.map((student) => {
                const status = attendance[student.id];
                return (
                  <div 
                    key={student.id} 
                    className="p-3.5 sm:p-4 hover:bg-slate-800/40 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 text-indigo-300 font-bold text-xs flex items-center justify-center border border-slate-700 shrink-0">
                        G{student.groupId}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-slate-200 truncate">{student.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">ID: {student.id}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {status === 'present' && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] sm:text-xs font-bold rounded-xl border border-emerald-500/20 inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Present
                        </span>
                      )}
                      {status === 'absent' && (
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 text-[11px] sm:text-xs font-bold rounded-xl border border-rose-500/20 inline-flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Absent
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[11px] sm:text-xs font-bold rounded-xl border border-amber-500/20 inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Later
                        </span>
                      )}
                      {!status && (
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-500 text-[11px] sm:text-xs font-semibold rounded-xl border border-slate-700">
                          Unmarked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </section>

      </main>

      {/* Rapid Attendance Marking Modal */}
      {markingModalState.isOpen && (
        <RapidMarkingModal
          students={getStudentsForModal()}
          groupTitle={markingModalState.title}
          selectedDate={selectedDate}
          user={user}
          currentAttendance={attendance}
          onClose={() => setMarkingModalState(prev => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Group & Roster Management Modal */}
      {isGroupManagerOpen && (
        <GroupManagementModal
          user={user}
          groups={groups}
          students={students}
          onClose={() => setIsGroupManagerOpen(false)}
        />
      )}

      {/* Date Range Excel Export Modal */}
      {isExportModalOpen && (
        <ExcelExportModal
          students={students}
          allAttendanceData={allAttendanceData}
          currentDate={selectedDate}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

    </div>
  );
}