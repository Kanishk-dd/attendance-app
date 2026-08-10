// src/utils/excelExport.js
import * as XLSX from 'xlsx';

export const exportAttendanceToExcel = (students, attendanceData, dateString) => {
    // Format data for sheet rows
    const rows = students.map((student) => {
        const status = attendanceData[student.id] || 'unmarked';
        return {
            'Student ID': student.id,
            'Student Name': student.name,
            'Group Number': `Group ${student.groupId}`,
            'Attendance Status': status.toUpperCase(),
            'Date': dateString
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    // Download .xlsx file
    XLSX.writeFile(workbook, `Attendance_${dateString}.xlsx`);
};