import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to XLSX
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Desired file name
 */
export const exportToXLSX = (data, fileName = 'export') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Import data from XLSX
 * @param {File} file - File object from input
 * @returns {Promise<Array>} - Resolves to array of objects
 */
export const importFromXLSX = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                resolve(json);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Export data to PDF
 * @param {Array} headers - Column headers
 * @param {Array} data - Rows to export
 * @param {String} title - PDF title
 * @param {String} fileName - Desired file name
 */
export const exportToPDF = (headers, data, title = 'Report', fileName = 'report') => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Add table
    doc.autoTable({
        head: [headers],
        body: data,
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }, // Primary-500 color
    });

    doc.save(`${fileName}.pdf`);
};
