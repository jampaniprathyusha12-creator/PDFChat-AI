# PDFChat AI – AI Document Intelligence Platform

PDFChat AI is an AI-powered document intelligence platform that allows users to upload PDF documents, interact with their content, and generate useful information using Artificial Intelligence.

Instead of manually reading lengthy PDF documents, users can ask questions, generate summaries, extract important points, and create quizzes.

## Features

- **PDF Upload:** Upload and view PDF documents.
- **Chat with PDF:** Ask questions and receive AI-generated answers based on document content.
- **AI Summarizer:** Generate concise summaries of PDF documents.
- **Important Points:** Extract key information from uploaded documents.
- **Quiz Generator:** Generate quizzes based on PDF content.
- **Chat History:** Access previous conversations.
- **Dark and Light Mode:** Switch between themes.
- **PDF Export:** Download summaries, important points, quizzes, and chat conversations as PDF files.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | Backend API |
| Gemini API | AI-powered responses |
| PDF.js | PDF text extraction and viewing |
| jsPDF | PDF generation and export |
| Multer | Backend file-upload support |

## Project Structure

```text
PDFChat-AI/
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   └── pdf.js
│
├── uploads/
│   └── .gitkeep
│
├── index.html
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the Project Folder

```bash
cd PDFChat-AI
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the Gemini API Key

Create a `.env` file in the project root directory.

Add your Gemini API key:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PORT=5000
```

Get your API key from [Google AI Studio](https://aistudio.google.com/).

### 5. Start the Backend Server

```bash
node server.js
```

### 6. Open the Application

Visit:

```text
http://localhost:5000
```

## How to Use

1. Open PDFChat AI in your browser.
2. Upload a PDF document.
3. View the uploaded document.
4. Ask questions using the AI chat interface.
5. Generate an AI summary.
6. Extract important points.
7. Generate a quiz from the document.
8. Download generated results as PDF files.
9. Switch between dark mode and light mode.

## Security

- Keep the Gemini API key inside the `.env` file.
- Never upload `.env` to GitHub.
- The `.gitignore` file excludes sensitive environment variables and unnecessary dependencies.

## Future Enhancements

- User authentication and personalized accounts.
- Permanent document storage.
- Support for multiple document formats.
- Improved chat history management.
- Advanced document analysis.

## Author

**Jampani Prathyusha**

B.Tech – School of Computing and Data Science

Sai University, Chennai

## Project Title

**PDFChat AI – AI Document Intelligence Platform**

An intelligent platform designed to make document reading, understanding, and analysis easier using Artificial Intelligence.