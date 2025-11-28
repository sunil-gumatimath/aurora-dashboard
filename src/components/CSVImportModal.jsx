import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Upload, X, AlertCircle, CheckCircle, Download } from "lucide-react";
import { parseCSV, validateEmployeeData } from "../../utils/csvUtils";
import "./csv-import-modal-styles.css";

const CSVImportModal = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [errors, setErrors] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            setErrors(['Please select a valid CSV file']);
            return;
        }

        setFile(selectedFile);
        setErrors([]);
        setIsProcessing(true);

        try {
            const text = await selectedFile.text();
            const { headers, data } = parseCSV(text);

            // Validate data
            const validationErrors = validateEmployeeData(data);

            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                setPreviewData(null);
            } else {
                setPreviewData({ headers, data });
            }
        } catch (error) {
            setErrors([error.message]);
            setPreviewData(null);
        }

        setIsProcessing(false);
    };

    const handleImport = () => {
        if (!previewData || errors.length > 0) return;
        onImport(previewData.data);
        handleClose();
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData(null);
        setErrors([]);
        setIsProcessing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            // Create a synthetic event to reuse handleFileSelect
            handleFileSelect({ target: { files: [droppedFile] } });
        } else {
            setErrors(['Please drop a valid CSV file']);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal csv-import-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Import Employees from CSV</h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={handleClose}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* File Upload Area */}
                    {!file && (
                        <div
                            className="csv-upload-area"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <Upload size={48} className="upload-icon" />
                            <h3>Drop CSV file here or click to browse</h3>
                            <p className="text-muted">
                                Upload a CSV file containing employee data
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="file-input"
                                id="csv-file-input"
                            />
                            <label htmlFor="csv-file-input" className="btn btn-primary">
                                <Upload size={18} />
                                Select CSV File
                            </label>
                        </div>
                    )}

                    {/* Processing State */}
                    {isProcessing && (
                        <div className="csv-processing">
                            <div className="spinner" />
                            <p>Processing CSV file...</p>
                        </div>
                    )}

                    {/* Errors */}
                    {errors.length > 0 && (
                        <div className="csv-errors">
                            <div className="error-header">
                                <AlertCircle size={20} />
                                <h3>Validation Errors ({errors.length})</h3>
                            </div>
                            <ul className="error-list">
                                {errors.slice(0, 10).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                                {errors.length > 10 && (
                                    <li className="text-muted">
                                        ... and {errors.length - 10} more errors
                                    </li>
                                )}
                            </ul>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setFile(null);
                                    setErrors([]);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                            >
                                Choose Different File
                            </button>
                        </div>
                    )}

                    {/* Preview */}
                    {previewData && errors.length === 0 && (
                        <div className="csv-preview">
                            <div className="preview-header">
                                <CheckCircle size={20} className="success-icon" />
                                <h3>Preview ({previewData.data.length} employees)</h3>
                            </div>

                            <div className="preview-table-container">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            {previewData.headers.map((header) => (
                                                <th key={header}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.data.slice(0, 5).map((row, index) => (
                                            <tr key={index}>
                                                {previewData.headers.map((header) => (
                                                    <td key={header}>{row[header] || '-'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {previewData.data.length > 5 && (
                                <p className="preview-note">
                                    Showing first 5 of {previewData.data.length} employees
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {previewData && errors.length === 0 && (
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleImport}
                        >
                            <Download size={18} />
                            Import {previewData.data.length} Employees
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

CSVImportModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onImport: PropTypes.func.isRequired,
};

export default CSVImportModal;
