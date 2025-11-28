/**
 * CSV Export/Import Utilities
 * Handles CSV generation, parsing, and validation
 */

/**
 * Convert array of objects to CSV string
 */
export const arrayToCSV = (data, headers) => {
    if (!data || data.length === 0) {
        return '';
    }

    // Create header row
    const headerRow = headers.join(',');

    // Create data rows
    const dataRows = data.map(row => {
        return headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma or newline
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
};

/**
 * Parse CSV string to array of objects
 */
export const parseCSV = (csvString) => {
    const lines = csvString.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
        throw new Error('CSV file must contain headers and at least one row of data');
    }

    // Parse headers
    const headers = parseCSVRow(lines[0]);

    // Parse data rows
    const data = lines.slice(1).map((line, index) => {
        const values = parseCSVRow(line);

        if (values.length !== headers.length) {
            throw new Error(`Row ${index + 2} has ${values.length} columns, expected ${headers.length}`);
        }

        const row = {};
        headers.forEach((header, i) => {
            row[header] = values[i];
        });

        return row;
    });

    return { headers, data };
};

/**
 * Parse a single CSV row, handling quoted values
 */
const parseCSVRow = (row) => {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        const nextChar = row[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                // Escaped quote
                currentValue += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // End of value
            values.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }

    // Add last value
    values.push(currentValue.trim());

    return values;
};

/**
 * Validate employee data from CSV
 */
export const validateEmployeeData = (data) => {
    const errors = [];
    const requiredFields = ['name', 'email', 'role', 'department'];
    const validStatuses = ['Active', 'On Leave', 'Offline'];

    data.forEach((row, index) => {
        const rowNumber = index + 2; // +2 because index starts at 0 and header is row 1

        // Check required fields
        requiredFields.forEach(field => {
            if (!row[field] || row[field].trim() === '') {
                errors.push(`Row ${rowNumber}: Missing required field "${field}"`);
            }
        });

        // Validate email format
        if (row.email && !isValidEmail(row.email)) {
            errors.push(`Row ${rowNumber}: Invalid email format "${row.email}"`);
        }

        // Validate status if provided
        if (row.status && !validStatuses.includes(row.status)) {
            errors.push(`Row ${rowNumber}: Invalid status "${row.status}". Must be one of: ${validStatuses.join(', ')}`);
        }

        // Validate join_date if provided
        if (row.join_date && !isValidDate(row.join_date)) {
            errors.push(`Row ${rowNumber}: Invalid date format "${row.join_date}". Use YYYY-MM-DD`);
        }
    });

    return errors;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate date format (YYYY-MM-DD)
 */
const isValidDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

/**
 * Get CSV template for employee import
 */
export const getEmployeeCSVTemplate = () => {
    const headers = ['name', 'email', 'role', 'department', 'status', 'join_date'];
    const sampleData = [
        {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Software Engineer',
            department: 'Engineering',
            status: 'Active',
            join_date: '2024-01-15',
        },
        {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'Product Manager',
            department: 'Product',
            status: 'Active',
            join_date: '2024-02-20',
        },
    ];

    return arrayToCSV(sampleData, headers);
};

/**
 * Transform employee data for CSV export
 */
export const transformEmployeesForExport = (employees) => {
    return employees.map(emp => ({
        name: emp.name,
        email: emp.email,
        role: emp.role,
        department: emp.department,
        status: emp.status,
        join_date: emp.join_date,
    }));
};
