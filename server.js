
/* =====================================================
   PDFCHAT AI - BACKEND SERVER
   Express + Gemini AI
===================================================== */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const PORT = process.env.PORT || 5000;

// INITIALIZE GEMINI
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing in .env file.");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-2.5-flash";

// MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// SERVE FRONTEND FILES
app.use(express.static(__dirname));


// CHECK SERVER
app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "PDFChat AI server is running."
    });
});


// GEMINI HELPER

async function generateAIResponse(prompt) {

    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            console.log(`Gemini API request: Attempt ${attempt}/${maxAttempts}`);

            const response = await ai.models.generateContent({
                model: MODEL,
                contents: prompt
            });

            return response.text || "No response generated.";

        } catch (error) {

            const status = error.status;

            const temporaryError = [
                408, 429, 500, 502, 503, 504
            ].includes(status);

            if (!temporaryError || attempt === maxAttempts) {
                throw error;
            }

            const delay = Math.pow(2, attempt) * 1000;

            console.log(
                `Gemini temporarily unavailable. Retrying in ${delay / 1000} seconds...`
            );

            await new Promise(resolve => setTimeout(resolve, delay));

        }
    }

    throw new Error("Gemini AI service is temporarily unavailable.");
}



// VALIDATE DOCUMENT
function validateDocument(req, res) {

    const { documentText } = req.body;

    if (!documentText || !documentText.trim()) {
        res.status(400).json({
            error: "Please upload a readable PDF document."
        });

        return false;
    }

    if (documentText.length > 100000) {
        res.status(413).json({
            error: "The document is too large to process in one request."
        });

        return false;
    }

    return true;
}


// 1. CHAT WITH PDF
app.post("/api/chat", async (req, res) => {

    try {

        const { question, documentText, documentName } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        if (!validateDocument(req, res)) return;

        const prompt = `
You are PDFChat AI, an intelligent document assistant.

Answer the user's question using the supplied PDF content.

Rules:
1. Use the document as your main source.
2. Give clear and simple explanations.
3. Do not invent information that is not in the document.
4. If the answer is unavailable, clearly say so.
5. Use headings and bullet points when useful.

DOCUMENT NAME:
${documentName || "Uploaded PDF"}

DOCUMENT CONTENT:
${documentText}

USER QUESTION:
${question}
`;

        const answer = await generateAIResponse(prompt);

        res.json({
            success: true,
            answer: answer
        });

    } catch (error) {

        console.error("Chat API error:", error);

        res.status(500).json({
            error: "Unable to generate an AI answer."
        });

    }

});


// 2. PDF SUMMARIZER
app.post("/api/summarize", async (req, res) => {

    try {

        if (!validateDocument(req, res)) return;

        const { documentText, documentName } = req.body;

        const prompt = `
You are an expert PDF summarization assistant.

Summarize the following PDF document.

Provide:
1. Document overview.
2. Main topics.
3. Important explanations.
4. Key findings.
5. Final conclusion.

Use simple language and organized headings.
Do not add facts that are not in the document.

DOCUMENT:
${documentName || "Uploaded PDF"}

CONTENT:
${documentText}
`;

        const result = await generateAIResponse(prompt);

        res.json({
            success: true,
            result: result
        });

    } catch (error) {

        console.error("Summary API error:", error);

        res.status(500).json({
            error: "Unable to summarize the PDF."
        });

    }

});


// 3. IMPORTANT POINTS EXTRACTOR
app.post("/api/keypoints", async (req, res) => {

    try {

        if (!validateDocument(req, res)) return;

        const { documentText } = req.body;

        const prompt = `
You are an expert study assistant.

Extract the most important points from this PDF.

Requirements:
1. Give a suitable heading.
2. Extract the important concepts.
3. Use numbered bullet points.
4. Keep explanations short and clear.
5. Include important definitions and facts.
6. Do not invent information.

PDF CONTENT:
${documentText}
`;

        const result = await generateAIResponse(prompt);

        res.json({
            success: true,
            result: result
        });

    } catch (error) {

        console.error("Keypoints API error:", error);

        res.status(500).json({
            error: "Unable to extract important points."
        });

    }

});


// 4. QUIZ GENERATOR
app.post("/api/quiz", async (req, res) => {

    try {

        if (!validateDocument(req, res)) return;

        const { documentText } = req.body;

        const prompt = `
You are an educational quiz generator.

Create 10 multiple-choice questions from the supplied PDF.

For each question provide:
- Question number.
- Question.
- Four options (A, B, C, D).
- Correct answer.
- Short explanation.

Use only information found in the PDF.
Make the questions useful for student exam preparation.
Do not repeat questions.

PDF CONTENT:
${documentText}
`;

        const result = await generateAIResponse(prompt);

        res.json({
            success: true,
            result: result
        });

    } catch (error) {

        console.error("Quiz API error:", error);

        res.status(500).json({
            error: "Unable to generate quiz questions."
        });

    }

});


// UNKNOWN API ROUTES
app.use("/api", (req, res) => {

    res.status(404).json({
        error: "API endpoint not found."
    });

});


// START SERVER
app.listen(PORT, () => {

    console.log("-------------------------------------");
    console.log("       PDFCHAT AI SERVER");
    console.log("-------------------------------------");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("AI model:", MODEL);
    console.log("-------------------------------------");

});
