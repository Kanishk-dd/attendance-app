// src/utils/excelExport.js
import * as XLSX from 'xlsx';

/**
 * Export single date or multi-date range attendance records into Excel
 * @param {Array} students - List of student objects
 * @param {Object} attendanceByDate - Mapping of date string -> { records: { studentId: status } }
 * @param {String} startDate - Start date YYYY-MM-DD
 * @param {String} endDate - End date YYYY-MM-DD (optional)
 */
export const exportAttendanceToExcel = (students, attendanceByDate, startDate, endDate = null) => {
    if (!students || students.length === 0) {
        alert("No students available to export.");
        return;
    }

    const isRange = endDate && endDate !== startDate;

    if (!isRange) {
        // Single Date Export
        const dateRecords = attendanceByDate[startDate] || {};
        const rows = students.map((student) => {
            const status = dateRecords[student.id] || 'unmarked';
            return {
                'Student ID': student.id,
                'Student Name': student.name,
                'Group Number': `Group ${student.groupId}`,
                'Attendance Status': status.toUpperCase(),
                'Date': startDate
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        XLSX.writeFile(workbook, `Attendance_${startDate}.xlsx`);
    } else {
        // Multi-Date Range Export (Pivot Table Style + Master Log)
        const dateKeys = Object.keys(attendanceByDate)
            .filter(d => d >= startDate && d <= endDate)
            .sort();

        if (dateKeys.length === 0) {
            // Include start and end dates even if empty
            dateKeys.push(startDate);
            if (startDate !== endDate) dateKeys.push(endDate);
        }

        // Sheet 1: Matrix Summary (Rows: Students, Columns: Dates)
        const summaryRows = students.map(student => {
            const row = {
                'Student ID': student.id,
                'Student Name': student.name,
                'Group': `Group ${student.groupId}`
            };

            let presentCount = 0;
            let totalCount = dateKeys.length;

            dateKeys.forEach(date => {
                const status = (attendanceByDate[date] && attendanceByDate[date][student.id]) || 'unmarked';
                row[date] = status.toUpperCase();
                if (status === 'present') presentCount++;
            });

            row['Total Present'] = presentCount;
            row['Attendance %'] = `${Math.round((presentCount / totalCount) * 100)}%`;
            return row;
        });

        // Sheet 2: Flat Log Records
        const flatRows = [];
        dateKeys.forEach(date => {
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
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Range Summary');

        const logSheet = XLSX.utils.json_to_sheet(flatRows);
        XLSX.utils.book_append_sheet(workbook, logSheet, 'Detailed Log');

        XLSX.writeFile(workbook, `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
    }
};