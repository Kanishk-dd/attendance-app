// src/utils/excelExport.js
import * as XLSX from 'xlsx';

/**
 * Export single date, date range, or multiple custom selected dates attendance records into Excel
 * @param {Array} students - List of student objects
 * @param {Object} attendanceByDate - Mapping of date string -> { records: { studentId: status } }
 * @param {String|Array} dateOrDates - Single date string (YYYY-MM-DD) OR Array of date strings [YYYY-MM-DD, ...]
 * @param {String} endDate - End date YYYY-MM-DD (optional, for continuous date range)
 */
export const exportAttendanceToExcel = (students, attendanceByDate, dateOrDates, endDate = null) => {
    if (!students || students.length === 0) {
        alert("No students available to export.");
        return;
    }

    // Determine target dates list
    let targetDates = [];
    let isSingle = false;

    if (Array.isArray(dateOrDates)) {
        // Option 3: Multiple Custom Selected Dates
        targetDates = [...dateOrDates].sort();
        if (targetDates.length === 1) {
            isSingle = true;
        }
    } else if (endDate && endDate !== dateOrDates) {
        // Option 2: Continuous Date Range
        const start = dateOrDates;
        const end = endDate;
        targetDates = Object.keys(attendanceByDate)
            .filter(d => d >= start && d <= end)
            .sort();

        if (targetDates.length === 0) {
            targetDates.push(start);
            if (start !== end) targetDates.push(end);
        }
    } else {
        // Option 1: Single Date
        isSingle = true;
        targetDates = [dateOrDates];
    }

    if (targetDates.length === 0) {
        alert("No dates selected for export.");
        return;
    }

    if (isSingle) {
        const singleDate = targetDates[0];
        const dateRecords = attendanceByDate[singleDate] || {};
        const rows = students.map((student) => {
            const status = dateRecords[student.id] || 'unmarked';
            return {
                'Student ID': student.id,
                'Student Name': student.name,
                'Group Number': `Group ${student.groupId}`,
                'Attendance Status': status.toUpperCase(),
                'Date': singleDate
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        XLSX.writeFile(workbook, `Attendance_${singleDate}.xlsx`);
    } else {
        // Multi-Date Export (Matrix Summary + Detailed Log)
        const summaryRows = students.map(student => {
            const row = {
                'Student ID': student.id,
                'Student Name': student.name,
                'Group': `Group ${student.groupId}`
            };

            let presentCount = 0;
            let totalCount = targetDates.length;

            targetDates.forEach(date => {
                const status = (attendanceByDate[date] && attendanceByDate[date][student.id]) || 'unmarked';
                row[date] = status.toUpperCase();
                if (status === 'present') presentCount++;
            });

            row['Total Present'] = presentCount;
            row['Attendance %'] = `${Math.round((presentCount / totalCount) * 100)}%`;
            return row;
        });

        // Flat Log Records
        const flatRows = [];
        targetDates.forEach(date => {
            const records = attendanceByDate[date] || {};
            students.forEach(student => {
                const status = records[student.id] || 'unmarked';
                flatRows.push({
                    'Date': date,
                    'Student ID': student.id,
                    'Student Name': student.name,
                    'Group Number': `Group ${student.groupId}`,
                    'Attendance Status': status.toUpperCase()
                });
            });
        });

        const workbook = XLSX.utils.book_new();
        
        const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Selected Dates Summary');

        const logSheet = XLSX.utils.json_to_sheet(flatRows);
        XLSX.utils.book_append_sheet(workbook, logSheet, 'Detailed Log');

        const fileName = Array.isArray(dateOrDates)
            ? `Attendance_Selected_Dates_${targetDates.length}_days.xlsx`
            : `Attendance_Report_${dateOrDates}_to_${endDate}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    }
};