📄 PDF Toolkit: Your All-in-One Browser-Based PDF Utility
✨ About the Project
The PDF Toolkit is a modern, responsive web application designed to simplify common PDF manipulation tasks directly within your browser. Built with React and Vite, and styled with the lightweight UnoCSS framework, this tool prioritizes user privacy by performing all core PDF operations client-side. This means your sensitive documents never leave your device.

From combining multiple files to extracting text with artificial intelligence, the PDF Toolkit provides a seamless and efficient experience for managing your PDF documents.

🚀 Live Demo
Experience the PDF Toolkit live on GitHub Pages:
https://yashdhanani.github.io/pdf-toolkit-app/

💡 Features
The PDF Toolkit offers a comprehensive suite of tools to handle your PDF needs:

Merge PDF: Combine multiple PDF documents into a single file.

Split PDF: Extract specific pages or ranges of pages from a PDF.

Compress PDF (Placeholder): (Future: Reduce the file size of your PDF for easier sharing.)

PDF to Word (Placeholder): (Future: Convert PDF documents into editable Word files.)

PDF to JPG: Convert individual PDF pages into high-quality JPG image files.

JPG to PDF: Convert one or more JPG images into a single PDF document.

Edit PDF: Add simple text annotations or content to your PDF pages.

OCR PDF: Utilize AI to recognize and extract text from scanned PDF documents.

Sign PDF: Easily add your signature, initials, or date fields to PDF documents interactively.

Watermark PDF: Stamp custom text or images as watermarks over your PDF pages.

Rotate PDF: Rotate all or specific pages within your PDF document by various angles.

Organize PDF: Reorder or delete pages within your PDF document.

Protect PDF: Add password protection to secure your PDF files.

Unlock PDF: Remove password protection from encrypted PDF documents.

HTML to PDF (Placeholder): (Future: Convert web pages into PDF documents.)

Compare PDF: Visually compare two PDF files and highlight the differences.

Page Numbers: Automatically add sequential page numbers to your PDF document.

🛠️ Technologies Used
Frontend Framework: React

Build Tool: Vite

Styling: UnoCSS (Utility-First CSS Engine)

PDF Manipulation:

PDF-Lib (for creating, modifying, and saving PDFs)

PDF.js (for rendering PDF pages to canvas)

File Handling: React Dropzone, FileSaver.js

Icons: Lucide React

Image Comparison: Pixelmatch

Draggable/Resizable Elements: React RND

AI Integration: Google Gemini API (for OCR functionality)

Deployment: GitHub Pages

🚀 Getting Started
Follow these steps to get a local copy of the project up and running on your machine.

Prerequisites
Node.js (LTS version recommended)

npm (comes with Node.js)

Git

Installation
Clone the repository:

git clone https://github.com/yashdhanani/pdf-toolkit-app.git
cd pdf-toolkit-app

Install dependencies:

npm install

Running Locally
Start the development server:

npm run dev

This will open the application in your browser at http://localhost:5173/ (or another available port).

🌐 Deployment to GitHub Pages
This project is configured for easy deployment to GitHub Pages using gh-pages.

Ensure your homepage in package.json is set correctly:

"homepage": "https://yashdhanani.github.io/pdf-toolkit-app/",

(This should already be set if you followed the setup guide.)

Run the deploy script:

npm run deploy

This command will build your application and push the dist folder content to the gh-pages branch of your repository. Your site will then be live at the homepage URL.

📁 Project Structure
pdf-toolkit-app/
├── public/                 # Static assets (e.g., vite.svg)
├── src/
│   ├── assets/             # Images or other assets
│   ├── App.jsx             # Main React application component & all tool implementations
│   ├── index.css           # Global CSS (minimal for UnoCSS)
│   └── main.jsx            # Entry point for the React application
├── .gitignore              # Specifies intentionally untracked files
├── index.html              # Main HTML file
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Records exact dependency versions
├── README.md               # This file
└── vite.config.js          # Vite configuration (includes UnoCSS plugin)

🤝 Contributing
Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please open an issue or submit a pull request.

📄 License
This project is licensed under the ISC License - see the LICENSE file for details.

👨‍💻 Developer
Developed by Yash Dhanani
