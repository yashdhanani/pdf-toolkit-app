import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver'; // Corrected import syntax: 'from' instead of '='
// Corrected import: 'Signature' changed to 'SignatureIcon'
import { ArrowLeft, UploadCloud, File as FileIcon, Merge, Split, FileArchive, FileText, FileType, FileImage, Edit, Scan, Lock, Unlock, Droplet, RotateCcw, Replace, Braces, ScanText, GitCompareArrows, Crop, ListOrdered, ShieldQuestion, Signature as SignatureIcon, Pencil, Trash2 } from 'lucide-react';

// Main App Component
const App = () => {
    const [activeTool, setActiveTool] = useState(null);
    const [libsReady, setLibsReady] = useState(false);

    // Effect to load external libraries from a CDN
    // This ensures that large libraries are loaded only once and are available globally
    useEffect(() => {
        const loadScript = (src, id) => {
            return new Promise((resolve) => {
                // Check if script already exists to prevent duplicate loading
                if (document.getElementById(id)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.id = id;
                // Resolve promise when script loads successfully
                script.onload = () => resolve();
                // Log warning but still resolve to not block the app if a script fails
                script.onerror = () => {
                    console.warn(`Failed to load script: ${src}. Some features may be unavailable.`);
                    resolve();
                };
                document.body.appendChild(script);
            });
        };

        // Load all necessary external libraries concurrently
        Promise.all([
            loadScript("https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js", "pdf-lib-script"),
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js", "pdfjs-script"),
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/pixelmatch/5.3.0/pixelmatch.min.js", "pixelmatch-script"),
            loadScript("https://unpkg.com/react-rnd@10.4.10/dist/react-rnd.umd.js", "react-rnd-script"),
            loadScript("https://unpkg.com/react-pdf@5.7.2/dist/umd/react-pdf.js", "react-pdf-script")
        ]).then(() => {
            // Configure PDF.js worker source once pdf.js is loaded
            if (window['pdfjs-dist/build/pdf']) {
                window['pdfjs-dist/build/pdf'].GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
            }
            setLibsReady(true); // Indicate that all libraries are ready
        }).catch(error => {
            console.error("A critical error occurred while loading libraries:", error);
            setLibsReady(true); // Still set to true to allow basic UI to render even if libs fail
        });
    }, []); // Empty dependency array ensures this runs only once on mount


    // Define the list of available tools with their properties
    const tools = [
        { name: 'Merge PDF', slug: 'merge', icon: Merge, component: MergeTool, description: 'Combine multiple PDFs into one document.' },
        { name: 'Split PDF', slug: 'split', icon: Split, component: SplitTool, description: 'Extract pages from a PDF.' },
        { name: 'Compress PDF', slug: 'compress', icon: FileArchive, component: PlaceholderTool, description: 'Reduce the file size of your PDF.' },
        { name: 'PDF to Word', slug: 'pdf-to-word', icon: FileType, component: PlaceholderTool, description: 'Convert PDF to editable Word documents.' },
        { name: 'PDF to JPG', slug: 'pdf-to-jpg', icon: FileImage, component: PdfToJpgTool, description: 'Convert PDF pages to JPG images.' },
        { name: 'JPG to PDF', slug: 'jpg-to-pdf', icon: FileType, component: JpgToPdfTool, description: 'Convert JPG images to a PDF file.' },
        { name: 'Edit PDF', slug: 'edit', icon: Edit, component: EditPdfTool, description: 'Add simple text to your PDF pages.' },
        { name: 'OCR PDF', slug: 'ocr', icon: ScanText, component: OcrPdfTool, description: 'Recognize and extract text from scans using AI.' },
        // Corrected icon usage: 'Signature' changed to 'SignatureIcon'
        { name: 'Sign PDF', slug: 'sign', icon: SignatureIcon, component: AdvancedSignPdfTool, description: 'Add your signature, initials, or date to a PDF document.' },
        { name: 'Watermark PDF', slug: 'watermark', icon: Droplet, component: WatermarkTool, description: 'Stamp an image or text over your PDF.' },
        { name: 'Rotate PDF', slug: 'rotate', icon: RotateCcw, component: RotatePdfTool, description: 'Rotate all or specific pages in your PDF.' },
        { name: 'Organize PDF', slug: 'organize', icon: Replace, component: OrganizePdfTool, description: 'Delete or reorder pages in your PDF.' },
        { name: 'Protect PDF', slug: 'protect', icon: Lock, component: ProtectPdfTool, description: 'Add a password to protect your PDF.' },
        { name: 'Unlock PDF', slug: 'unlock', icon: Unlock, component: UnlockPdfTool, description: 'Remove password protection from a PDF.' },
        { name: 'HTML to PDF', slug: 'html-to-pdf', icon: Braces, component: PlaceholderTool, description: 'Convert webpages to PDF.' },
        { name: 'Compare PDF', slug: 'compare', icon: GitCompareArrows, component: ComparePdfTool, description: 'Visually compare two PDF files.' },
        { name: 'Crop PDF', slug: 'crop', icon: Crop, component: CropPdfTool, description: 'Crop the visible area of PDF pages.' },
        { name: 'Page Numbers', slug: 'page-numbers', icon: ListOrdered, component: PageNumberTool, description: 'Add page numbers to your PDF.' },
    ];

    // Handler for when a tool is selected from the grid
    const handleToolSelect = (slug) => {
        const tool = tools.find(t => t.slug === slug);
        if (tool) {
            setActiveTool(tool); // Set the active tool to display its component
        }
    };

    // Handler to go back to the main tool grid
    const handleBack = () => {
        setActiveTool(null);
    };

    return (
        // Using UnoCSS classes for styling
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* Header Section */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            {/* Back button, shown only when a tool is active */}
                            {activeTool && (
                                <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                                </button>
                            )}
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                PDF Toolkit
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {/* Conditionally render ToolGrid or the active tool's component */}
                {!activeTool ? (
                    <ToolGrid tools={tools} onSelect={handleToolSelect} />
                ) : (
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900">{activeTool.name}</h2>
                            <p className="mt-2 text-lg text-gray-600">{activeTool.description}</p>
                        </div>
                        {/* Added overflow-hidden to contain potential child overflows */}
                        <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-lg overflow-hidden">
                            {/* Render the active tool's component if libraries are ready, otherwise show loading message */}
                            {libsReady ? 
                                React.createElement(activeTool.component, { tool: activeTool }) :
                                <MessageBox type="loading" message="Loading required libraries..." />
                            }
                        </div>
                    </div>
                )}
            </main>
            {/* Footer Section */}
            <footer className="bg-white mt-12 py-6">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} PDF Toolkit. All Rights Reserved.</p>
                    <p className="text-sm mt-1">Developed by Yash Dhanani</p> {/* Added developer name */}
                    <p className="text-sm mt-1">This is a demo application. Some features are simulated or simplified.</p>
                </div>
            </footer>
        </div>
    );
};

// Tool Grid Component: Displays all available PDF tools
const ToolGrid = ({ tools, onSelect }) => (
    <div>
        <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your All-in-One PDF Solution</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
                Select a tool below to start processing your PDF files quickly and easily.
            </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Map over tools to create a clickable card for each */}
            {tools.map(tool => (
                <ToolCard key={tool.slug} tool={tool} onSelect={onSelect} />
            ))}
        </div>
    </div>
);

// Tool Card Component: Individual card for each PDF tool
const ToolCard = ({ tool, onSelect }) => (
    <button
        onClick={() => onSelect(tool.slug)}
        className="group text-center p-4 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out border border-gray-200"
    >
        <div className="flex items-center justify-center h-16 w-16 mx-auto bg-blue-100 text-blue-600 rounded-full mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <tool.icon className="h-8 w-8" /> {/* Lucide icon for the tool */}
        </div>
        <h3 className="text-md sm:text-lg font-semibold text-gray-900">{tool.name}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">{tool.description}</p>
    </button>
);


// Generic File Uploader Component: Handles file drag-and-drop or selection
const FileUploader = ({ onFilesAccepted, accept, multiple, text }) => {
    // useDropzone hook for handling file uploads
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onFilesAccepted, accept, multiple });

    return (
        <div
            {...getRootProps()}
            // Added box-border to ensure padding and border are included within the width
            className={`w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors box-border
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
        >
            <input {...getInputProps()} /> {/* Hidden input for file selection */}
            <div className="flex flex-col items-center justify-center">
                <UploadCloud className="w-12 h-12 text-gray-400 mb-4" /> {/* Upload icon */}
                <p className="text-lg font-semibold text-gray-700">{text || "Drag & drop files here, or click to select"}</p>
                <p className="text-sm text-gray-500">
                    {multiple ? 'Multiple files allowed' : 'Single file'}
                </p>
                {/* Display accepted file formats if specified */}
                {accept && <p className="text-xs text-gray-400 mt-2">Accepted formats: {Object.values(accept).flat().join(', ')}</p>}
            </div>
        </div>
    );
};

// Message Box Component: Displays status messages (error, success, info, loading)
const MessageBox = ({ type, message }) => {
    const baseClasses = "p-4 rounded-lg my-4 text-sm";
    // UnoCSS classes for different message types
    const typeClasses = {
        error: "bg-red-100 border border-red-400 text-red-800",
        success: "bg-green-100 border border-green-400 text-green-800",
        info: "bg-blue-100 border border-blue-400 text-blue-800",
        loading: "bg-yellow-100 border border-yellow-400 text-yellow-800 animate-pulse"
    };

    if (!message) return null; // Don't render if no message

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            {message}
        </div>
    );
};

// --- TOOL IMPLEMENTATIONS ---

// Placeholder for tools that require server-side processing
const PlaceholderTool = ({ tool }) => {
    let detailedMessage = `The '${tool.name}' feature requires advanced processing not suitable for the browser. In a full-stack application, this would involve a backend server.`;

    // Specific messages for certain placeholder tools
    if (tool.slug === 'compress') {
        detailedMessage = "High-quality PDF compression involves complex algorithms that are too resource-intensive for a browser. A dedicated server is needed to analyze and rewrite the file structure for optimal size reduction.";
    } else if (tool.slug === 'pdf-to-word') {
        detailedMessage = "Converting PDF to a structured format like DOCX requires a sophisticated layout engine to interpret text flow, tables, and images. This functionality relies on powerful server-side libraries.";
    } else if (tool.slug === 'html-to-pdf') {
        detailedMessage = "Converting arbitrary HTML pages to PDF typically requires a headless browser environment on a server to accurately render and capture the content.";
    }

    return (
        <div className="text-center p-4">
            <FileUploader onFilesAccepted={() => {}} /> {/* File uploader is still present for consistency */}
            <MessageBox type="info" message={detailedMessage} />
            <button disabled className="w-full mt-4 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg opacity-50 cursor-not-allowed">
                Process File
            </button>
        </div>
    );
};

// Merge PDF Tool: Combines multiple PDF files into one
const MergeTool = () => {
    const [files, setFiles] = useState([]); // State to store selected PDF files
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for when files are dropped or selected
    const onDrop = useCallback(acceptedFiles => {
        // Add new files, filtering out out-of-scope files
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length !== acceptedFiles.length) {
            setStatus({ type: 'error', message: 'Only PDF files are accepted for merging.' });
        } else {
            setFiles(prev => [...prev, ...pdfFiles].filter((file, index, self) => self.findIndex(f => f.name === file.name) === index));
            setStatus({ type: '', message: '' }); // Clear previous status messages
        }
    }, []);

    // Handles the PDF merging process
    const handleMerge = async () => {
        if (files.length < 2) {
            setStatus({ type: 'error', message: 'Please select at least two PDF files to merge.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Merging PDFs... please wait.' });
        try {
            // Access PDFLib functions from the global window object
            const { PDFDocument } = window.PDFLib;
            const mergedPdf = await PDFDocument.create(); // Create a new empty PDF document

            // Iterate over each selected file and copy its pages to the new document
            for (const file of files) {
                const pdfBytes = await file.arrayBuffer(); // Read file content as ArrayBuffer
                // Load each PDF, ignoring encryption errors for simpler handling
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                // Copy all pages from the current PDF to the merged PDF
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page)); // Add copied pages
            }

            const mergedPdfBytes = await mergedPdf.save(); // Save the merged PDF to bytes
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' }); // Create a Blob from the bytes
            saveAs(blob, 'merged.pdf'); // Trigger file download
            setStatus({ type: 'success', message: 'PDFs merged successfully! Download has started.' });
        } catch (e) {
            setStatus({ type: 'error', message: `An error occurred during merging: ${e.message}` });
        }
    };

    // Removes a file from the list of files to be merged
    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop} 
                accept={{ 'application/pdf': ['.pdf'] }} // Accept only PDF files
                multiple={true} // Allow multiple files
                text="Drag & drop PDFs to merge"
            />
            {/* Display list of selected files */}
            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Files to Merge:</h3>
                    <ul className="space-y-2">
                        {files.map(file => (
                            <li key={file.name} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                                <span className="flex items-center">
                                    <FileIcon className="h-5 w-5 mr-2 text-red-500"/> {file.name}
                                </span>
                                <button onClick={() => removeFile(file.name)} className="text-red-500 hover:text-red-700">Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleMerge}
                disabled={files.length < 2 || status.type === 'loading'} // Disable button if less than 2 files or loading
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Merging...' : 'Merge PDFs'}
            </button>
        </div>
    );
};

// Split PDF Tool: Extracts specific pages from a PDF
const SplitTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [totalPages, setTotalPages] = useState(0); // State for total pages in the PDF
    const [ranges, setRanges] = useState(''); // State for user-defined page ranges (e.g., "1, 3-5, 8")
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages
    
    // Callback for when a single PDF file is dropped/selected
    const onDrop = useCallback(async (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setStatus({ type: 'loading', message: 'Loading PDF info...' });
        try {
            // Use PDFLib to load the document and get its page count
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            setTotalPages(pdfDoc.getPageCount()); // Set total pages
            setStatus({ type: '', message: '' });
        } catch (e) {
            setStatus({ type: 'error', message: `Could not load PDF: ${e.message}` });
            setFile(null);
            setTotalPages(0);
        }
    }, []);

    // Handles the PDF splitting process
    const handleSplit = async () => {
        if (!file || !ranges) {
            setStatus({ type: 'error', message: 'Please select a file and specify page ranges.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Splitting PDF...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pageIndices = new Set(); // Use a Set to store unique 0-based page indices
            const parts = ranges.split(',').map(p => p.trim()); // Split input by comma and trim whitespace

            // Parse each part of the ranges input
            for (const part of parts) {
                if (part.includes('-')) {
                    // Handle page ranges (e.g., "3-5")
                    const [start, end] = part.split('-').map(Number);
                    // Validate range inputs
                    if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > totalPages) {
                        throw new Error(`Invalid range: ${part}. Pages must be within 1 and ${totalPages}.`);
                    }
                    // Add all pages in the range (0-based index)
                    for (let i = start; i <= end; i++) {
                        pageIndices.add(i - 1);
                    }
                } else {
                    // Handle single page numbers (e.g., "1")
                    const pageNum = Number(part);
                    // Validate page number
                    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
                        throw new Error(`Invalid page number: ${part}. Page must be within 1 and ${totalPages}.`);
                    }
                    pageIndices.add(pageNum - 1); // Add single page (0-based index)
                }
            }

            if (pageIndices.size === 0) {
                throw new Error("No valid pages selected for splitting.");
            }

            const pdfBytes = await file.arrayBuffer();
            const originalPdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            
            const newPdf = await PDFDocument.create(); // Create a new PDF for extracted pages
            // Copy selected pages from original PDF to the new one
            const copiedPages = await newPdf.copyPages(originalPdf, Array.from(pageIndices));
            copiedPages.forEach(page => newPdf.addPage(page));
            
            const newPdfBytes = await newPdf.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            saveAs(blob, `split_${file.name}`); // Trigger download
            setStatus({ type: 'success', message: 'PDF split successfully! Download has started.' });

        } catch (e) {
            setStatus({ type: 'error', message: `An error occurred during splitting: ${e.message}` });
        }
    };
    
    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF"}
            />
            {totalPages > 0 && (
                <div className="mt-6">
                    <p className="text-center mb-4">This PDF has {totalPages} pages.</p>
                    <label htmlFor="ranges" className="block text-sm font-medium text-gray-700">Pages to extract (e.g., 1, 3-5, 8)</label>
                    <input
                        type="text"
                        id="ranges"
                        value={ranges}
                        onChange={e => setRanges(e.target.value)}
                        placeholder="e.g., 1, 3-5, 8"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            )}
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleSplit}
                disabled={!file || !ranges || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Splitting...' : 'Split PDF'}
            </button>
        </div>
    );
};

// Watermark PDF Tool: Adds text watermark to a PDF
const WatermarkTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL'); // State for the watermark text
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for file drop/selection
    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    // Handles adding the watermark to the PDF
    const handleWatermark = async () => {
        if (!file || !watermarkText) {
            setStatus({ type: 'error', message: 'Please select a file and enter watermark text.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Adding watermark...' });
        try {
            // Access PDFLib functions for document manipulation, colors, fonts, and degrees
            const { PDFDocument, rgb, StandardFonts, degrees } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold); // Embed a bold font

            const pages = pdfDoc.getPages(); // Get all pages in the document
            
            // Iterate over each page to draw the watermark
            for (const page of pages) {
                const { width, height } = page.getSize(); // Get page dimensions
                page.drawText(watermarkText, {
                    x: width / 2 - 150, // Center horizontally (adjusted for text width)
                    y: height / 2,     // Center vertically
                    font: helveticaFont,
                    size: 50,          // Large font size
                    color: rgb(0.9, 0.2, 0.2), // Reddish color
                    opacity: 0.3,      // Semi-transparent
                    rotate: degrees(-45), // Rotate by -45 degrees
                });
            }

            const watermarkedPdfBytes = await pdfDoc.save();
            const blob = new Blob([watermarkedPdfBytes], { type: 'application/pdf' });
            saveAs(blob, `watermarked_${file.name}`); // Trigger download
            setStatus({ type: 'success', message: 'Watermark added successfully!' });
        } catch (e) {
            setStatus({ type: 'error', message: `An error occurred during watermarking: ${e.message}` });
        }
    };
    
    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF"}
            />
            {file && (
                <div className="mt-6">
                    <label htmlFor="watermark" className="block text-sm font-medium text-gray-700">Watermark Text</label>
                    <input
                        type="text"
                        id="watermark"
                        value={watermarkText}
                        onChange={e => setWatermarkText(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            )}
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleWatermark}
                disabled={!file || !watermarkText || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Applying...' : 'Add Watermark'}
            </button>
        </div>
    );
};

// Rotate PDF Tool: Rotates all pages in a PDF
const RotatePdfTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [rotation, setRotation] = useState(90); // State for the rotation angle (default 90 degrees clockwise)
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for file drop/selection
    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    // Handles rotating the PDF pages
    const handleRotate = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a PDF file.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Rotating pages...' });
        try {
            const { PDFDocument, degrees } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            
            // Iterate through each page and apply the rotation
            pdfDoc.getPages().forEach(page => {
                const currentRotation = page.getRotation().angle; // Get current rotation
                page.setRotation(degrees(currentRotation + rotation)); // Add desired rotation
            });
            
            const rotatedPdfBytes = await pdfDoc.save();
            const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
            saveAs(blob, `rotated_${file.name}`); // Trigger download
            setStatus({ type: 'success', message: 'PDF rotated successfully!' });

        } catch (e) {
            setStatus({ type: 'error', message: `An error occurred during rotation: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF"}
            />
            {file && (
                <div className="mt-6">
                    <label htmlFor="rotation" className="block text-sm font-medium text-gray-700">Rotation Angle</label>
                    <select
                        id="rotation"
                        value={rotation}
                        onChange={e => setRotation(Number(e.target.value))} // Update rotation state
                        className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value={90}>90° (Clockwise)</option>
                        <option value={180}>180°</option>
                        <option value={270}>270° (Counter-clockwise)</option>
                    </select>
                </div>
            )}
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleRotate}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Rotating...' : 'Rotate PDF'}
            </button>
        </div>
    );
};

// PDF to JPG Tool: Converts the first page of a PDF to a JPG image
const PdfToJpgTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages
    const canvasRef = useRef(null); // Ref for a hidden canvas used for rendering PDF pages

    // Callback for file drop/selection
    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);
    
    // Handles the conversion of PDF to JPG
    const handleConvert = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a PDF file.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Converting to JPG... this may take a moment.' });
        
        try {
            const pdfjsLib = window['pdfjs-dist/build/pdf']; // Access PDF.js library
            const pdfBytes = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({data: pdfBytes}).promise; // Load PDF document
            
            const pageNum = 1; // For simplicity, only the first page is converted
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 }); // Define viewport for rendering (scale for higher quality)
            
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page onto the hidden canvas
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            await page.render(renderContext).promise;
            
            // Convert canvas content to JPG Blob and trigger download
            canvas.toBlob((blob) => {
                if (blob) {
                    saveAs(blob, `${file.name.replace('.pdf', '')}_page${pageNum}.jpg`);
                    setStatus({ type: 'success', message: 'Successfully converted first page to JPG!' });
                } else {
                    throw new Error("Canvas could not be converted to a Blob.");
                }
            }, 'image/jpeg'); // Specify image/jpeg format

        } catch(e) {
            setStatus({ type: 'error', message: `Conversion failed: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF"}
            />
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleConvert}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Converting...' : 'Convert to JPG (First Page)'}
            </button>
            <canvas ref={canvasRef} className="hidden"></canvas> {/* Hidden canvas for PDF rendering */}
        </div>
    );
};

// JPG to PDF Tool: Converts multiple JPG images into a single PDF
const JpgToPdfTool = () => {
    const [files, setFiles] = useState([]); // State to store selected JPG files
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for when files are dropped or selected
    const onDrop = useCallback(acceptedFiles => {
        // Add new files to the list
        setFiles(prev => [...prev, ...acceptedFiles]);
        setStatus({ type: '', message: '' });
    }, []);

    // Handles the conversion of JPGs to PDF
    const handleConvert = async () => {
        if (files.length === 0) {
            setStatus({ type: 'error', message: 'Please select at least one JPG file.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Converting images to PDF...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pdfDoc = await PDFDocument.create(); // Create a new PDF document

            // Iterate over each JPG file
            for (const file of files) {
                const imgBytes = await file.arrayBuffer(); // Read image content as ArrayBuffer
                const image = await pdfDoc.embedJpg(imgBytes); // Embed the JPG image into the PDF document
                
                // Add a new page to the PDF with dimensions matching the image
                const page = pdfDoc.addPage([image.width, image.height]);
                // Draw the image onto the new page
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                });
            }
            
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'converted_from_jpg.pdf'); // Trigger download
            setStatus({ type: 'success', message: 'Images converted to PDF successfully!' });
        } catch (e) {
            setStatus({ type: 'error', message: `An error occurred during conversion: ${e.message}` });
        }
    };
    
    // Removes a file from the list of files to be converted
    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }} // Accept only JPG/JPEG files
                multiple={true} // Allow multiple files
                text="Drag & drop JPG images"
            />
            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Images to Convert:</h3>
                    <ul className="space-y-2">
                        {files.map(file => (
                            <li key={file.name} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                                <span className="flex items-center">
                                    <FileIcon className="h-5 w-5 mr-2 text-blue-500"/> {file.name}
                                </span>
                                <button onClick={() => removeFile(file.name)} className="text-red-500 hover:text-red-700">Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleConvert}
                disabled={files.length === 0 || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Converting...' : 'Convert to PDF'}
            </button>
        </div>
    );
};

// Protect PDF Tool: Adds password protection to a PDF
const ProtectPdfTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [password, setPassword] = useState(''); // State for the password input
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for file drop/selection
    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    // Handles adding password protection
    const handleProtect = async () => {
        if (!file || !password) {
            setStatus({ type: 'error', message: 'Please select a file and enter a password.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Encrypting PDF...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes); // Load the PDF

            // Set metadata for the document (optional but good practice)
            pdfDoc.setProducer('PDF Toolkit');
            pdfDoc.setCreator('PDF Toolkit');
            
            // Save the PDF with user password encryption
            const protectedPdfBytes = await pdfDoc.save({ 
                useObjectStreams: false, // Recommended for compatibility with password protection
                userPassword: password, // Set the user password
            });
            
            const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
            saveAs(blob, `protected_${file.name}`); // Trigger download
            setStatus({ type: 'success', message: 'PDF protected successfully!' });
        } catch (e) {
            setStatus({ type: 'error', message: `An error occurred during protection: ${e.message}` });
        }
    };
    
    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to protect"}
            />
            {file && (
                <div className="mt-6">
                    <label htmlFor="password-protect" className="block text-sm font-medium text-gray-700">Set Password</label>
                    <input
                        type="password"
                        id="password-protect"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            )}
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleProtect}
                disabled={!file || !password || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Protecting...' : 'Protect PDF'}
            </button>
        </div>
    );
};

// Unlock PDF Tool: Removes password protection from a PDF
const UnlockPdfTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [password, setPassword] = useState(''); // State for the password input
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for file drop/selection
    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    // Handles unlocking the PDF
    const handleUnlock = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a file.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Attempting to unlock PDF...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            // Attempt to load the PDF with the provided password
            const pdfDoc = await PDFDocument.load(pdfBytes, {
                userPassword: password, // Provide the user password for decryption
            });
            
            // If load succeeds, save without any password to "unlock" it
            const unlockedPdfBytes = await pdfDoc.save();
            
            const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
            saveAs(blob, `unlocked_${file.name}`); // Trigger download
            setStatus({ type: 'success', message: 'PDF unlocked successfully!' });
        } catch (e) {
            // Check for specific error indicating incorrect password
            if (e.name === 'EncryptedPDFError') {
                setStatus({ type: 'error', message: `Unlock failed. The password may be incorrect.` });
            } else {
                setStatus({ type: 'error', message: `An error occurred: ${e.message}` });
            }
        }
    };
    
    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF to unlock"}
            />
            {file && (
                <div className="mt-6">
                    <label htmlFor="password-unlock" className="block text-sm font-medium text-gray-700">Enter Password (if any)</label>
                    <input
                        type="password"
                        id="password-unlock"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Leave blank if not encrypted"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            )}
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleUnlock}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Unlocking...' : 'Unlock PDF'}
            </button>
        </div>
    );
};

// Organize PDF Tool: Allows deleting pages and saving the modified PDF.
// Note: This version supports deleting pages. For full reordering (drag-and-drop),
// a dedicated UI library like react-sortable-hoc or dnd-kit would be integrated.
const OrganizePdfTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [pages, setPages] = useState([]); // State to store page thumbnails and their original numbers
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for when a PDF file is dropped/selected
    const onDrop = useCallback(async (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setStatus({ type: 'loading', message: 'Loading PDF pages for organization...' });
        
        try {
            const pdfjsLib = window['pdfjs-dist/build/pdf']; // Access PDF.js library
            const pdfBytes = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise; // Load the PDF document
            
            const pageThumbnails = [];
            // Render each page to a hidden canvas to create a thumbnail
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.3 }); // Scale down for thumbnail
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                pageThumbnails.push({ num: i, dataUrl: canvas.toDataURL() }); // Store page number and data URL of thumbnail
            }
            setPages(pageThumbnails); // Update state with thumbnails
            setStatus({ type: '', message: '' });
        } catch (e) {
            setStatus({ type: 'error', message: `Could not load PDF pages: ${e.message}` });
        }
    }, []);
    
    // Deletes a page from the current list of pages (visually)
    const deletePage = (pageNum) => {
        setPages(pages.filter(p => p.num !== pageNum));
    };
    
    // Handles reorganizing (saving) the PDF with the current set of pages
    const handleReorganize = async () => {
        if (!file || pages.length === 0) {
            setStatus({ type: 'error', message: 'No pages to organize.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Reorganizing PDF...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes); // Load the original PDF
            const newDoc = await PDFDocument.create(); // Create a new PDF document

            // Get original 0-based indices of the pages that remain in `pages` state
            const originalPageIndices = pages.map(p => p.num - 1);
            // Copy only the selected (non-deleted) pages to the new document
            const copiedPages = await newDoc.copyPages(pdfDoc, originalPageIndices);
            copiedPages.forEach(page => newDoc.addPage(page));
            
            const newPdfBytes = await newDoc.save();
            saveAs(new Blob([newPdfBytes], { type: 'application/pdf' }), `organized_${file.name}`); // Trigger download
            setStatus({ type: 'success', message: 'PDF reorganized successfully!' });
        } catch (e) {
            setStatus({ type: 'error', message: `Failed to save reorganized PDF: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a single PDF"}
            />
            <MessageBox type={status.type} message={status.message} />
            {pages.length > 0 && (
                <>
                    <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {/* Display thumbnails of pages with a delete button */}
                        {pages.map((page) => (
                            <div key={page.num} className="relative group border rounded-md p-1 shadow-sm">
                                <img src={page.dataUrl} alt={`Page ${page.num}`} className="w-full h-auto rounded"/>
                                <div className="absolute top-1 right-1">
                                    <button onClick={() => deletePage(page.num)} className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Delete page">
                                        &times;
                                    </button>
                                </div>
                                <div className="text-center text-sm font-semibold mt-1">{`Page ${page.num}`}</div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleReorganize}
                        disabled={status.type === 'loading'}
                        className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {status.type === 'loading' ? 'Saving...' : 'Save Reorganized PDF'}
                    </button>
                </>
            )}
        </div>
    );
};

// Page Numbering Tool: Adds sequential page numbers to the bottom of each PDF page
const PageNumberTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for file drop/selection
    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
    }, []);

    // Handles adding page numbers to the PDF
    const handleProcess = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a PDF file.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Adding page numbers...' });
        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const helveticaFont = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica); // Use window.PDFLib.StandardFonts

            const pages = pdfDoc.getPages(); // Get all pages in the document
            // Iterate through each page to add page numbers
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width } = page.getSize(); // Get page width to center the text
                page.drawText(`${i + 1} / ${pages.length}`, { // Format: "current_page / total_pages"
                    x: width / 2 - 20, // Center horizontally
                    y: 20,             // Position from bottom
                    size: 12,
                    font: helveticaFont,
                    color: window.PDFLib.rgb(0.5, 0.5, 0.5), // Use window.PDFLib.rgb
                });
            }

            const numberedPdfBytes = await pdfDoc.save();
            saveAs(new Blob([numberedPdfBytes], { type: 'application/pdf' }), `numbered_${file.name}`); // Trigger download
            setStatus({ type: 'success', message: 'Page numbers added successfully!' });
        } catch (e) {
            setStatus({ type: 'error', message: `An error occurred while adding page numbers: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop PDF to add page numbers"}
            />
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleProcess}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Processing...' : 'Add Page Numbers'}
            </button>
        </div>
    );
};

// OCR PDF Tool: Extracts text from PDF pages using the Gemini API
const OcrPdfTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages
    const [extractedText, setExtractedText] = useState(''); // State to store the extracted text
    const canvasRef = useRef(null); // Ref for a hidden canvas to render PDF pages as images

    // Callback for file drop/selection
    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setStatus({ type: '', message: '' });
        setExtractedText(''); // Clear previous results
    }, []);
    
    // Helper function to render a PDF page to a canvas and convert to base64 PNG data
    const pdfPageToBase64 = async (pdfPage) => {
        const viewport = pdfPage.getViewport({ scale: 2.0 }); // Render at higher scale for better OCR quality
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await pdfPage.render({ canvasContext: context, viewport }).promise;
        
        return canvas.toDataURL('image/png').split(',')[1]; // Return base64 data part
    };

    // Handles the OCR process using Gemini API
    const handleOcr = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a PDF file.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Performing OCR... This may take a while.' });
        setExtractedText(''); // Clear previous text

        try {
            const pdfjsLib = window['pdfjs-dist/build/pdf']; // Access PDF.js library
            const pdfBytes = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({data: pdfBytes}).promise; // Load PDF document
            
            // Limit processing to the first few pages to manage API calls and performance
            const numPagesToProcess = Math.min(pdf.numPages, 3); 
            let fullText = ''; // Accumulate extracted text from all processed pages
            
            for (let i = 1; i <= numPagesToProcess; i++) {
                setStatus({ type: 'loading', message: `Processing page ${i} of ${numPagesToProcess}...` });
                const page = await pdf.getPage(i);
                const base64ImageData = await pdfPageToBase64(page); // Get base64 image of the page

                // Prepare the payload for Gemini API call
                const prompt = "Extract all text from this image of a document page.";
                const payload = {
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: prompt },
                                { inlineData: { mimeType: "image/png", data: base64ImageData } }
                            ]
                        }
                    ],
                };
                
                const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                
                // Make the API call to Gemini
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`API call failed with status ${response.status}`);
                }
                
                const result = await response.json();
                
                // Extract text from the API response
                if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    fullText += `--- Page ${i} ---\n${text}\n\n`; // Append text with page separator
                } else {
                   fullText += `--- Page ${i} ---\nNo text found or unexpected response structure.\n\n`;
                }
            }
            
            setExtractedText(fullText); // Display all extracted text
            setStatus({ type: 'success', message: `OCR complete! Extracted text from ${numPagesToProcess} pages.` });

        } catch (e) {
            setStatus({ type: 'error', message: `OCR failed: ${e.message}` });
            console.error("OCR Error:", e);
        }
    };

    return (
        <div>
            <canvas ref={canvasRef} className="hidden"></canvas> {/* Hidden canvas for image generation */}
            <FileUploader 
                onFilesAccepted={onDrop}
                accept={{ 'application/pdf': ['.pdf'] }}
                multiple={false}
                text={file ? `Selected: ${file.name}` : "Drag & drop a PDF for OCR"}
            />
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleOcr}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Running OCR...' : 'Extract Text with AI'}
            </button>

            {extractedText && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Extracted Text:</h3>
                    <textarea
                        readOnly
                        value={extractedText}
                        className="w-full h-64 p-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                    />
                </div>
            )}
        </div>
    );
};

// Compare PDF Tool: Visually compares the first page of two PDF files and highlights differences
const ComparePdfTool = () => {
    const [file1, setFile1] = useState(null); // State for the first PDF file
    const [file2, setFile2] = useState(null); // State for the second PDF file
    const [diffResult, setDiffResult] = useState(null); // State to store the data URL of the difference image
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    const canvas1Ref = useRef(null); // Ref for canvas to render file1
    const canvas2Ref = useRef(null); // Ref for canvas to render file2
    const diffCanvasRef = useRef(null); // Ref for canvas to draw differences
    
    // Handles the comparison logic
    const handleCompare = async () => {
        if (!file1 || !file2) {
            setStatus({ type: 'error', message: 'Please provide two PDF files to compare.' });
            return;
        }

        // Check if pixelmatch library is loaded
        if (typeof window.pixelmatch === 'undefined') {
            setStatus({ type: 'error', message: 'Comparison library could not be loaded. This may be due to browser security settings or network issues. Please try again later.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Comparing PDFs... (first page only)' });
        setDiffResult(null); // Clear previous difference result

        try {
            const pdfjsLib = window['pdfjs-dist/build/pdf']; // Access PDF.js library
            // Helper function to render a PDF page to a canvas and get its image data
            const renderPage = async (file, canvas) => {
                const pdfBytes = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
                const page = await pdf.getPage(1); // Compare only the first page
                const viewport = page.getViewport({ scale: 1.5 }); // Scale for better comparison resolution
                
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.width; // Changed to width for square aspect ratio
                await page.render({ canvasContext: context, viewport }).promise;
                return context.getImageData(0, 0, canvas.width, canvas.height); // Get pixel data
            };
            
            // Render both PDF files' first pages concurrently
            const [imgData1, imgData2] = await Promise.all([
                renderPage(file1, canvas1Ref.current),
                renderPage(file2, canvas2Ref.current)
            ]);

            // Determine dimensions for the difference canvas
            const width = Math.max(imgData1.width, imgData2.width);
            const height = Math.max(imgData1.height, imgData2.height);

            const diffCanvas = diffCanvasRef.current;
            diffCanvas.width = width;
            diffCanvas.height = height;
            const diffCtx = diffCanvas.getContext('2d');
            const diffImageData = diffCtx.createImageData(width, height); // Create empty image data for differences
            
            // Use pixelmatch to compare image data
            const numDiffPixels = window.pixelmatch(
                imgData1.data, imgData2.data, diffImageData.data, width, height,
                { threshold: 0.1, includeAA: true, diffColor: [255, 0, 0] } // Highlight differences in red
            );

            diffCtx.putImageData(diffImageData, 0, 0); // Draw differences onto the diff canvas
            setDiffResult(diffCanvas.toDataURL()); // Store data URL for display
            setStatus({ type: 'success', message: `Comparison complete. Found ${numDiffPixels} differing pixels.` });

        } catch(e) {
            setStatus({ type: 'error', message: `Failed to compare PDFs: ${e.message}` });
        }
    };
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File uploaders for the two PDF files */}
                <FileUploader onFilesAccepted={files => setFile1(files[0])} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} text={file1 ? `Selected: ${file1.name}` : "Drop original PDF"} />
                <FileUploader onFilesAccepted={files => setFile2(files[0])} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} text={file2 ? `Selected: ${file2.name}` : "Drop revised PDF"} />
            </div>
            
            <MessageBox type={status.type} message={status.message} />
            
            <button onClick={handleCompare} disabled={!file1 || !file2 || status.type === 'loading'} className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {status.type === 'loading' ? 'Comparing...' : 'Compare First Page'}
            </button>
            
            {diffResult && <div className="mt-6">
                <h3 className="font-semibold mb-2 text-center">Comparison Result (Differences in Red)</h3>
                <img src={diffResult} alt="PDF Comparison Difference" className="w-full border rounded-md shadow-sm" />
            </div>}
            
            {/* Hidden canvases for rendering PDF pages and differences */}
            <canvas ref={canvas1Ref} className="hidden"></canvas>
            <canvas ref={canvas2Ref} className="hidden"></canvas>
            <canvas ref={diffCanvasRef} className="hidden"></canvas>
        </div>
    );
};


// Edit PDF Tool (Simplified): Adds static text to the first page of a PDF
const EditPdfTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [textToAdd, setTextToAdd] = useState("Example Text"); // State for the text to be added
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for file drop/selection
    const onDrop = useCallback(acceptedFiles => { setFile(acceptedFiles[0]); }, []);
    
    // Handles adding text to the PDF
    const handleEdit = async () => {
        if (!file || !textToAdd) {
            setStatus({ type: 'error', message: 'Please provide a PDF and text to add.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Editing PDF...' });

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const helveticaFont = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica); // Use window.PDFLib.StandardFonts

            const firstPage = pdfDoc.getPages()[0];
            const { height } = firstPage.getSize();

            firstPage.drawText(textToAdd, {
                x: 60,
                y: height - 60,
                font: helveticaFont,
                size: 24,
                color: window.PDFLib.rgb(0.95, 0.1, 0.1), // Use window.PDFLib.rgb
            });
            
            const editedPdfBytes = await pdfDoc.save();
            saveAs(new Blob([editedPdfBytes], { type: 'application/pdf' }), `edited_${file.name}`);
            setStatus({ type: 'success', message: 'PDF edited successfully!' });
            
        } catch(e) {
            setStatus({ type: 'error', message: `Failed to edit PDF: ${e.message}` });
        }
    };

    return (
        <div>
            <FileUploader onFilesAccepted={onDrop} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} text={file ? `Selected: ${file.name}` : "Drag & drop a PDF"}/>
            
            {file && <div className="mt-6">
                <label htmlFor="text-to-add" className="block text-sm font-medium text-gray-700">Text to Add (on first page)</label>
                <input
                    type="text"
                    id="text-to-add"
                    value={textToAdd}
                    onChange={e => setTextToAdd(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>}
            
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleEdit}
                disabled={!file || !textToAdd || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Editing...' : 'Add Text and Download'}
            </button>
        </div>
    );
};

// Crop PDF Tool: Crops the visible area of PDF pages based on user-defined margins
const CropPdfTool = () => {
    const [file, setFile] = useState(null); // State for the selected PDF file
    const [margins, setMargins] = useState({ top: 50, right: 50, bottom: 50, left: 50 }); // State for crop margins
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for file drop/selection
    const onDrop = useCallback(acceptedFiles => { setFile(acceptedFiles[0]); }, []);
    
    // Handles cropping the PDF
    const handleCrop = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'Please provide a PDF file.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Cropping PDF...' });

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            
            const pages = pdfDoc.getPages();
            for (const page of pages) {
                const { width, height } = page.getSize();
                // Set the crop box for each page
                // Arguments: x, y, width, height of the new crop box
                page.setCropBox(
                    margins.left,             // X: left margin
                    margins.bottom,           // Y: bottom margin
                    width - margins.left - margins.right, // Width: original width minus left and right margins
                    height - margins.top - margins.bottom // Height: original height minus top and bottom margins
                );
            }
            
            const croppedPdfBytes = await pdfDoc.save();
            saveAs(new Blob([croppedPdfBytes], { type: 'application/pdf' }), `cropped_${file.name}`); // Trigger download
            setStatus({ type: 'success', message: 'PDF cropped successfully!' });
            
        } catch(e) {
            setStatus({ type: 'error', message: `Failed to crop PDF: ${e.message}` });
        }
    };

    // Handles changes to margin input fields
    const handleMarginChange = (e) => {
        const { name, value } = e.target;
        setMargins(prev => ({...prev, [name]: Number(value) }));
    };

    return (
        <div>
            <FileUploader onFilesAccepted={onDrop} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} text={file ? `Selected: ${file.name}` : "Drag & drop a PDF"}/>
            
            {file && <div className="mt-6">
                <h3 className="font-semibold mb-2 text-center">Set Crop Margins (in points)</h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Input fields for top, right, bottom, left margins */}
                    <div>
                        <label htmlFor="top-margin" className="block text-sm font-medium text-gray-700">Top</label>
                        <input type="number" name="top" id="top-margin" value={margins.top} onChange={handleMarginChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="right-margin" className="block text-sm font-medium text-gray-700">Right</label>
                        <input type="number" name="right" id="right-margin" value={margins.right} onChange={handleMarginChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="bottom-margin" className="block text-sm font-medium text-gray-700">Bottom</label>
                        <input type="number" name="bottom" id="bottom-margin" value={margins.bottom} onChange={handleMarginChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="left-margin" className="block text-sm font-medium text-gray-700">Left</label>
                        <input type="number" name="left" id="left-margin" value={margins.left} onChange={handleMarginChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </div>
            </div>}
            
            <MessageBox type={status.type} message={status.message} />
            <button
                onClick={handleCrop}
                disabled={!file || status.type === 'loading'}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status.type === 'loading' ? 'Cropping...' : 'Crop and Download'}
            </button>
        </div>
    );
};


// --- Advanced Sign PDF Tool ---
// This tool allows users to add signature, initials, or date text fields to a PDF.
// These fields can be dragged and resized on a live preview.
// Note: This implementation uses text for signatures/initials. For actual drawn signatures,
// a more complex canvas-based drawing mechanism would be required.
const AdvancedSignPdfTool = () => {
    const [pdfFile, setPdfFile] = useState(null); // State for the selected PDF file
    const [numPages, setNumPages] = useState(0); // State for total pages in the PDF
    const [currentPage, setCurrentPage] = useState(1); // State for the currently viewed page
    // State to store the position, size, type, and value of placed fields
    const [placements, setPlacements] = useState([]); 
    const [signature, setSignature] = useState("John Doe"); // State for signature text
    const [initials, setInitials] = useState("JD"); // State for initials text
    const [status, setStatus] = useState({ type: '', message: '' }); // State for status messages

    // Callback for when a PDF file is selected
    const onFileChange = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setPdfFile(file);
            setPlacements([]); // Clear existing placements for a new file
            setCurrentPage(1); // Reset to first page
            setNumPages(0); // Reset page count
            setStatus({ type: '', message: ''});
        }
    }, []);
    
    // Conditional rendering until external libraries (react-pdf, react-rnd) are loaded
    if (!window.ReactPDF || !window.Rnd) {
        return <MessageBox type="loading" message="Loading signature libraries... Please wait." />;
    }

    const { Rnd } = window; // Access Rnd component from global window
    const { Document, Page } = window.ReactPDF; // Access Document and Page from global window

    // Callback for when the PDF document is loaded successfully (used by react-pdf's Document component)
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    // Adds a new field (signature, initials, or date) to the current page
    const addField = (type) => {
        let value;
        switch(type) {
            case 'signature': value = signature; break;
            case 'initials': value = initials; break;
            case 'date': value = new Date().toLocaleDateString(); break;
            default: value = 'Text Field'; // Fallback for general text field
        }
        setPlacements(prev => [
            ...prev,
            // Add new field with a unique ID, type, value, current page, and default position/size
            { id: Date.now().toString(), type, value, page: currentPage, x: 50, y: 50, width: 150, height: 30 }
        ]);
    };
    
    // Handles stopping a drag event for an Rnd component
    const handleDragStop = (id, d) => {
        // Update the x and y coordinates of the moved field
        setPlacements(prev => prev.map(p => p.id === id ? { ...p, x: d.x, y: d.y } : p));
    };

    // Handles stopping a resize event for an Rnd component
    const handleResizeStop = (id, e, direction, ref, delta, position) => {
        // Update the width, height, and new position of the resized field
        setPlacements(prev => prev.map(p => p.id === id ? { ...p, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10), ...position } : p));
    };

    // Deletes a field from the current placements
    const deleteField = (id) => {
        setPlacements(prev => prev.filter(p => p.id !== id));
    };

    // Finalizes the PDF by drawing all placed fields onto it and triggers download
    const handleFinalize = async () => {
        if (!pdfFile) return; // Do nothing if no PDF is loaded
        setStatus({ type: 'loading', message: 'Applying fields to PDF...'});

        try {
            const { PDFDocument } = window.PDFLib;
            const existingPdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes); // Load the original PDF
            const font = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica); // Embed a font for drawing text

            const pages = pdfDoc.getPages(); // Get all pages
            
            // Iterate over each placed field
            for (const field of placements) {
                const page = pages[field.page - 1]; // Get the target page (0-indexed)
                if (!page) { // Basic check if page exists (should not happen if page numbers are valid)
                    console.warn(`Page ${field.page} not found for field ${field.id}. Skipping.`);
                    continue;
                }
                const { height } = page.getSize(); // Get page height for Y-coordinate conversion
                
                // Convert Rnd's top-left (x, y) coordinates to PDF's bottom-left (x, y) coordinates
                const pdfX = field.x;
                const pdfY = height - field.y - field.height; // Adjust Y-coordinate for PDFLib's coordinate system
                
                // Draw the text value onto the PDF page
                page.drawText(field.value, {
                    x: pdfX + 5, // Add a small padding from the Rnd box left edge
                    y: pdfY + 5, // Add a small padding from the Rnd box bottom edge
                    font,
                    size: 12, // Fixed font size for simplicity
                    color: window.PDFLib.rgb(0.1, 0.1, 0.4) // Dark blue color
                });
            }

            const pdfBytes = await pdfDoc.save(); // Save the modified PDF
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `signed-${pdfFile.name}`); // Trigger download
            setStatus({ type: 'success', message: 'PDF signed successfully!'});

        } catch (e) {
            setStatus({ type: 'error', message: `Failed to sign PDF: ${e.message}`});
        }
    };
    
    // If no PDF file is selected, show the file uploader
    if (!pdfFile) {
        return <FileUploader onFilesAccepted={onFileChange} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} text="Select a PDF to sign" />
    }

    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* Control Panel for signature/initials and page navigation */}
            <div className="w-full md:w-1/4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-bold mb-4">Signature Fields</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Signature Text</label>
                    <input type="text" value={signature} onChange={e => setSignature(e.target.value)} className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700">Initials Text</label>
                    <input type="text" value={initials} onChange={e => setInitials(e.target.value)} className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-6">
                    {/* Buttons to add various types of fields */}
                    <button onClick={() => addField('signature')} className="p-2 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200">+ Signature</button>
                    <button onClick={() => addField('initials')} className="p-2 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200">+ Initials</button>
                    <button onClick={() => addField('date')} className="p-2 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200">+ Date</button>
                </div>

                {/* Page navigation controls */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50">Prev</button>
                    <span>Page {currentPage} of {numPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages} className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50">Next</button>
                </div>
                
                {/* Button to apply changes and download */}
                <button onClick={handleFinalize} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                    Apply & Download
                </button>
                <MessageBox type={status.type} message={status.message} />
            </div>

            {/* PDF Viewer Area */}
            <div className="w-full md:w-3/4 bg-gray-200 p-2 overflow-auto relative">
                {/* React-PDF Document component */}
                <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
                    <div className="relative">
                        {/* React-PDF Page component for current page */}
                        <Page pageNumber={currentPage} />
                        {/* Render Rnd components for each field placed on the current page */}
                        {placements.filter(p => p.page === currentPage).map(field => (
                            <Rnd
                                key={field.id}
                                default={{ x: field.x, y: field.y, width: field.width, height: field.height }}
                                onDragStop={(e, d) => handleDragStop(field.id, d)}
                                onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(field.id, e, direction, ref, delta, position)}
                                bounds="parent" // Confine dragging/resizing within the parent element
                                className="border-2 border-dashed border-yellow-500 bg-yellow-500 bg-opacity-20 flex items-center justify-center group"
                            >
                                <span className="text-sm select-none">{field.value}</span>
                                {/* Delete button for each field */}
                                <button onClick={() => deleteField(field.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Delete field">
                                    &times;
                                </button>
                            </Rnd>
                        ))}
                    </div>
                </Document>
            </div>
        </div>
    );
};


export default App;
