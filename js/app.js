
/* =====================================================
   PDFCHAT AI - MAIN APPLICATION
   Theme | Navigation | Chat | Summary | Key Points | Quiz
===================================================== */


/* =====================================================
   1. ELEMENTS
===================================================== */

const themeToggle = document.getElementById("themeToggle");
const settingsThemeToggle = document.getElementById("settingsThemeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.querySelector(".sidebar");

const pageTitle = document.getElementById("pageTitle");
const navigationLinks = document.querySelectorAll(".nav-link");

const workspace = document.getElementById("workspace");

const chatWindow = document.getElementById("chatWindow");
const questionInput = document.getElementById("questionInput");
const sendQuestion = document.getElementById("sendQuestion");
const newChatBtn = document.getElementById("newChatBtn");
const conversationSelect = document.getElementById("conversationSelect");
const editChatBtn = document.getElementById("editChatBtn");

const summarySelect = document.getElementById("summarySelect");
const generateSummary = document.getElementById("generateSummary");
const summaryOutput = document.getElementById("summaryOutput");

const keypointsSelect = document.getElementById("keypointsSelect");
const generateKeypoints = document.getElementById("generateKeypoints");
const keypointsOutput = document.getElementById("keypointsOutput");

const quizSelect = document.getElementById("quizSelect");
const generateQuiz = document.getElementById("generateQuiz");
const quizOutput = document.getElementById("quizOutput");


/* =====================================================
   2. THEME TOGGLE
===================================================== */

function applyTheme(theme) {

    document.body.classList.toggle("dark-mode", theme === "dark");

    if (themeIcon) {
        themeIcon.className = theme === "dark"
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";
    }

    if (themeText) {
        themeText.textContent = theme === "dark"
            ? "Light Mode"
            : "Dark Mode";
    }

    if (settingsThemeToggle) {

        const settingsIcon = settingsThemeToggle.querySelector("i");

        if (settingsIcon) {
            settingsIcon.className = theme === "dark"
                ? "fa-solid fa-sun"
                : "fa-solid fa-moon";
        }

        const textNode = Array.from(settingsThemeToggle.childNodes)
            .find(node => node.nodeType === Node.TEXT_NODE);

        if (textNode) {
            textNode.textContent = theme === "dark"
                ? " Light Mode"
                : " Dark Mode";
        }
    }

    localStorage.setItem("pdfchat-theme", theme);
}


// LOAD SAVED THEME
const savedTheme = localStorage.getItem("pdfchat-theme") || "light";

applyTheme(savedTheme);


// MAIN THEME BUTTON
themeToggle.addEventListener("click", () => {

    const newTheme = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";

    applyTheme(newTheme);

});


// SETTINGS THEME BUTTON
settingsThemeToggle.addEventListener("click", () => {

    const newTheme = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";

    applyTheme(newTheme);

});


/* =====================================================
   3. PAGE NAVIGATION
===================================================== */

const pageNames = {
    workspace: "Chat with PDF",
    summary: "AI PDF Summarizer",
    keypoints: "Important Key Points",
    quiz: "AI Quiz Generator",
    documents: "My Documents",
    history: "Chat History",
    settings: "Settings"
};


function showPage(pageName) {

    // HIDE ALL FEATURE PAGES
    document.querySelectorAll(".feature-page").forEach(page => {
        page.hidden = true;
    });

    // SHOW MAIN WORKSPACE OR SELECTED FEATURE
    if (pageName === "workspace") {

        workspace.hidden = false;

    } else {

        workspace.hidden = true;

        const selectedPage = document.getElementById(pageName);

        if (selectedPage) {
            selectedPage.hidden = false;
        }
    }

    // UPDATE HEADER
    pageTitle.textContent = pageNames[pageName] || "PDFChat AI";

    // UPDATE ACTIVE SIDEBAR LINK
    navigationLinks.forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.page === pageName
        );

    });

    // CLOSE MOBILE SIDEBAR
    sidebar.classList.remove("open");

}


// SIDEBAR NAVIGATION
navigationLinks.forEach(link => {

    link.addEventListener("click", (event) => {

        event.preventDefault();

        const pageName = link.dataset.page;

        if (pageName) {
            showPage(pageName);
        }

    });

});


// MOBILE SIDEBAR
mobileMenu.addEventListener("click", () => {

    sidebar.classList.toggle("open");

});


/* =====================================================
   4. CHAT MESSAGE FUNCTIONS
===================================================== */

let currentConversation = [];

let conversationCounter = 0;

let chatHistory = JSON.parse(
    localStorage.getItem("pdfchat-history") || "[]"
);


function addMessage(message, sender) {

    const messageContainer = document.createElement("div");

    messageContainer.className = sender === "user"
        ? "user-message"
        : "ai-message";

    if (sender === "ai") {

        const avatar = document.createElement("div");

        avatar.className = "message-avatar";
        avatar.innerHTML = '<i class="fa-solid fa-brain"></i>';

        messageContainer.appendChild(avatar);

    }

    const bubble = document.createElement("div");

    bubble.className = "message-bubble";

    const paragraph = document.createElement("p");

    paragraph.textContent = message;

    bubble.appendChild(paragraph);

    messageContainer.appendChild(bubble);

    chatWindow.appendChild(messageContainer);

    chatWindow.scrollTop = chatWindow.scrollHeight;

    return messageContainer;

}


function showWelcomeScreen() {

    chatWindow.innerHTML = `
        <div class="welcome-screen" id="welcomeScreen">

            <div class="welcome-icons">

                <div class="welcome-icon purple">
                    <i class="fa-solid fa-file-pdf"></i>
                </div>

                <div class="welcome-icon orange">
                    <i class="fa-solid fa-brain"></i>
                </div>

                <div class="welcome-icon blue">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>

            </div>

            <h1>How can I help you today?</h1>

            <p>
                Upload a PDF and let AI help you understand your document.
            </p>

            <div class="suggestion-cards">

                <button class="suggestion-card"
                    data-prompt="Summarize this PDF document">

                    <i class="fa-solid fa-file-lines"></i>
                    <span>Summarize this PDF</span>

                </button>

                <button class="suggestion-card"
                    data-prompt="Explain the important points in this document">

                    <i class="fa-solid fa-lightbulb"></i>
                    <span>Find important points</span>

                </button>

                <button class="suggestion-card"
                    data-prompt="Generate quiz questions from this PDF">

                    <i class="fa-solid fa-circle-question"></i>
                    <span>Generate quiz questions</span>

                </button>

            </div>

        </div>
    `;

    attachSuggestionEvents();

}


// CHECK PDF BEFORE AI ACTION
function checkSelectedPdf() {

    if (!window.currentPdf) {

        addMessage(
            "Please upload a PDF document first so I can help you.",
            "ai"
        );

        return false;
    }

    if (!window.currentPdfText) {

        addMessage(
            "Your PDF is still being processed. Please wait and try again.",
            "ai"
        );

        return false;
    }

    return true;

}


/* =====================================================
   5. CHAT WITH PDF
===================================================== */

async function askQuestion() {

    const question = questionInput.value.trim();

    if (!question) return;

    if (!checkSelectedPdf()) return;

    // SHOW USER MESSAGE
    addMessage(question, "user");

    currentConversation.push({
        role: "user",
        content: question
    });

    questionInput.value = "";

    // LOADING MESSAGE
    const loadingMessage = addMessage(
        "Thinking about your document...",
        "ai"
    );

    sendQuestion.disabled = true;

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                question: question,

                documentText: window.currentPdfText,

                documentName: window.currentPdf.name

            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to get an AI response.");
        }

        const answer = data.answer || "No answer was returned.";

        loadingMessage.querySelector(".message-bubble p").textContent = answer;

        currentConversation.push({
            role: "assistant",
            content: answer
        });

        saveCurrentConversation();

    } catch (error) {

        loadingMessage.querySelector(".message-bubble p").textContent =
            "Unable to connect to the AI service. Please check that the backend server is running and your AI API is configured.";

        console.error("Chat error:", error);

    } finally {

        sendQuestion.disabled = false;

        chatWindow.scrollTop = chatWindow.scrollHeight;

    }

}


// SEND BUTTON
sendQuestion.addEventListener("click", askQuestion);


// ENTER TO SEND
questionInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        askQuestion();

    }

});


/* =====================================================
   6. SUGGESTED QUESTIONS
===================================================== */

function attachSuggestionEvents() {

    document.querySelectorAll(".suggestion-card").forEach(button => {

        button.addEventListener("click", () => {

            questionInput.value = button.dataset.prompt || "";

            questionInput.focus();

        });

    });

}

attachSuggestionEvents();


/* =====================================================
   7. NEW CHAT
===================================================== */

newChatBtn.addEventListener("click", () => {

    if (currentConversation.length > 0) {
        saveCurrentConversation();
    }

    currentConversation = [];

    conversationCounter++;

    showWelcomeScreen();

    questionInput.value = "";

});


/* =====================================================
   8. CHAT HISTORY
===================================================== */

function saveCurrentConversation() {

    if (currentConversation.length === 0) return;

    const firstMessage = currentConversation.find(
        message => message.role === "user"
    );

    if (!firstMessage) return;

    const conversation = {
        id: Date.now(),
        title: firstMessage.content.substring(0, 45),
        messages: [...currentConversation],
        date: new Date().toLocaleString()
    };

    const existingIndex = chatHistory.findIndex(
        item => item.id === conversation.id
    );

    if (existingIndex === -1) {
        chatHistory.push(conversation);
    }

    // LIMIT HISTORY TO 30 CONVERSATIONS
    chatHistory = chatHistory.slice(-30);

    localStorage.setItem(
        "pdfchat-history",
        JSON.stringify(chatHistory)
    );

    updateConversationDropdown();

    renderChatHistory();

}


function updateConversationDropdown() {

    conversationSelect.innerHTML =
        '<option value="">Select conversation</option>';

    chatHistory.forEach(conversation => {

        const option = document.createElement("option");

        option.value = conversation.id;
        option.textContent = conversation.title;

        conversationSelect.appendChild(option);

    });

}


function renderChatHistory() {

    const historyOutput = document.getElementById("historyOutput");

    if (!historyOutput) return;

    historyOutput.innerHTML = "";

    if (chatHistory.length === 0) {

        historyOutput.textContent = "No previous conversations yet.";

        return;
    }

    [...chatHistory].reverse().forEach(conversation => {

        const item = document.createElement("div");

        item.className = "history-item";

        const title = document.createElement("h3");

        title.textContent = conversation.title;

        const date = document.createElement("p");

        date.textContent = conversation.date;

        const openButton = document.createElement("button");

        openButton.className = "secondary-btn";
        openButton.textContent = "Open Conversation";

        openButton.addEventListener("click", () => {
            openConversation(conversation.id);
        });

        item.appendChild(title);
        item.appendChild(date);
        item.appendChild(openButton);

        historyOutput.appendChild(item);

    });

}


function openConversation(conversationId) {

    const conversation = chatHistory.find(
        item => item.id === Number(conversationId)
    );

    if (!conversation) return;

    currentConversation = [...conversation.messages];

    chatWindow.innerHTML = "";

    currentConversation.forEach(message => {

        addMessage(
            message.content,
            message.role === "user" ? "user" : "ai"
        );

    });

    showPage("workspace");

}


conversationSelect.addEventListener("change", () => {

    const conversationId = conversationSelect.value;

    if (conversationId) {
        openConversation(conversationId);
    }

});


// EDIT CHAT TITLE
editChatBtn.addEventListener("click", () => {

    const conversationId = conversationSelect.value;

    if (!conversationId) {

        alert("Please select a conversation first.");

        return;
    }

    const conversation = chatHistory.find(
        item => item.id === Number(conversationId)
    );

    if (!conversation) return;

    const newTitle = prompt(
        "Enter a new conversation title:",
        conversation.title
    );

    if (!newTitle || !newTitle.trim()) return;

    conversation.title = newTitle.trim();

    localStorage.setItem(
        "pdfchat-history",
        JSON.stringify(chatHistory)
    );

    updateConversationDropdown();
    renderChatHistory();

    conversationSelect.value = conversationId;

});


/* =====================================================
   9. AI FEATURE API FUNCTION
===================================================== */

async function runDocumentFeature(endpoint, selector, output, button, loadingText) {

    const documentId = selector.value;

    const selectedDocument = window.pdfDocuments.find(
        doc => doc.id === documentId
    );

    if (!selectedDocument) {

        output.textContent = "Please select a PDF document first.";

        return;
    }

    if (!selectedDocument.text) {

        output.textContent = "Please wait until PDF text extraction is complete.";

        return;
    }

    const originalButtonText = button.innerHTML;

    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    output.textContent = loadingText;

    try {

        const response = await fetch(endpoint, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                documentText: selectedDocument.text,

                documentName: selectedDocument.name

            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Feature request failed.");
        }

        output.textContent =
            data.result || data.summary || data.keypoints || data.quiz ||
            "No result was returned.";

    } catch (error) {

        output.textContent =
            "Unable to generate the result. Please check that the backend server and AI API are configured.";

        console.error(error);

    } finally {

        button.disabled = false;
        button.innerHTML = originalButtonText;

    }

}


/* =====================================================
   10. SUMMARY GENERATOR
===================================================== */

generateSummary.addEventListener("click", () => {

    runDocumentFeature(
        "/api/summarize",
        summarySelect,
        summaryOutput,
        generateSummary,
        "Generating your PDF summary..."
    );

});


/* =====================================================
   11. IMPORTANT POINTS
===================================================== */

generateKeypoints.addEventListener("click", () => {

    runDocumentFeature(
        "/api/keypoints",
        keypointsSelect,
        keypointsOutput,
        generateKeypoints,
        "Extracting important points..."
    );

});


/* =====================================================
   12. QUIZ GENERATOR
===================================================== */

generateQuiz.addEventListener("click", () => {

    runDocumentFeature(
        "/api/quiz",
        quizSelect,
        quizOutput,
        generateQuiz,
        "Generating quiz questions..."
    );

});


/* =====================================================
   13. INITIALIZE APPLICATION
===================================================== */

updateConversationDropdown();

renderChatHistory();

showPage("workspace");

console.log("PDFChat AI application loaded successfully.");


/* =====================================================
   14. DOWNLOAD AI SUMMARY AS PDF
===================================================== */

const downloadSummaryBtn = document.getElementById("downloadSummaryBtn");

downloadSummaryBtn.addEventListener("click", () => {

    const summaryText = summaryOutput.innerText.trim();

    // CHECK WHETHER SUMMARY IS GENERATED
    if (
        !summaryText ||
        summaryText === "Your PDF summary will appear here." ||
        summaryText === "Generating your PDF summary..."
    ) {
        alert("Please generate a PDF summary before downloading.");
        return;
    }

    // CHECK PDF LIBRARY
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF download library is not available. Please refresh the page.");
        return;
    }

    // CREATE PDF
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    // GET SELECTED DOCUMENT NAME
    const selectedId = summarySelect.value;

    const selectedDocument = window.pdfDocuments.find(
        doc => doc.id === selectedId
    );

    const documentName = selectedDocument
        ? selectedDocument.name
        : "Uploaded Document";

    // PDF TITLE
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);

    pdf.text("PDFChat AI", 20, 20);

    pdf.setFontSize(15);
    pdf.text("AI Generated Summary", 20, 32);

    // DOCUMENT NAME
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    pdf.text("Document: " + documentName, 20, 42);

    pdf.text(
        "Generated on: " + new Date().toLocaleDateString(),
        20,
        49
    );

    // DIVIDER
    pdf.setDrawColor(180, 180, 180);
    pdf.line(20, 55, 190, 55);

    // SUMMARY CONTENT
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const lines = pdf.splitTextToSize(summaryText, 170);

    let y = 65;

    lines.forEach(line => {

        if (y > 275) {
            pdf.addPage();
            y = 20;
        }

        pdf.text(line, 20, y);

        y += 7;

    });

    // FOOTER
    const pageCount = pdf.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {

        pdf.setPage(i);

        pdf.setFontSize(9);

        pdf.text(
            "Generated using PDFChat AI",
            20,
            290
        );

        pdf.text(
            "Page " + i + " of " + pageCount,
            170,
            290
        );

    }

    // DOWNLOAD FILE
    const safeName = documentName
        .replace(/\.pdf$/i, "")
        .replace(/[^a-z0-9-_]/gi, "_");

    pdf.save(safeName + "_AI_Summary.pdf");

    console.log("Summary PDF downloaded successfully.");

});

console.log("PDF summary download feature loaded.");


/* =====================================================
   15. DOWNLOAD IMPORTANT POINTS AND QUIZ AS PDF
===================================================== */

function downloadTextAsPDF(content, title, fileName) {

    if (!content || content.trim() === "") {
        alert("Please generate the content before downloading.");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF library is not available. Please refresh the page.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("PDFChat AI", 20, 20);

    pdf.setFontSize(15);
    pdf.text(title, 20, 32);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Generated on: " + new Date().toLocaleDateString(), 20, 42);

    pdf.line(20, 48, 190, 48);

    pdf.setFontSize(11);

    const lines = pdf.splitTextToSize(content, 170);

    let y = 58;

    lines.forEach(line => {

        if (y > 275) {
            pdf.addPage();
            y = 20;
        }

        pdf.text(line, 20, y);
        y += 7;

    });

    const pageCount = pdf.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {

        pdf.setPage(i);
        pdf.setFontSize(9);

        pdf.text("Generated using PDFChat AI", 20, 290);
        pdf.text("Page " + i + " of " + pageCount, 170, 290);

    }

    pdf.save(fileName);

}


// DOWNLOAD IMPORTANT POINTS
const downloadKeypointsBtn = document.getElementById("downloadKeypointsBtn");

if (downloadKeypointsBtn) {

    downloadKeypointsBtn.addEventListener("click", () => {

        downloadTextAsPDF(
            keypointsOutput.innerText,
            "Important Key Points",
            "PDFChat_AI_Important_Points.pdf"
        );

    });

}


// DOWNLOAD QUIZ
const downloadQuizBtn = document.getElementById("downloadQuizBtn");

if (downloadQuizBtn) {

    downloadQuizBtn.addEventListener("click", () => {

        downloadTextAsPDF(
            quizOutput.innerText,
            "AI Generated Quiz",
            "PDFChat_AI_Quiz.pdf"
        );

    });

}

/* =====================================================
   16. DOWNLOAD CHAT CONVERSATION AS PDF
===================================================== */

const downloadChatBtn = document.getElementById("downloadChatBtn");

if (downloadChatBtn) {

    downloadChatBtn.addEventListener("click", () => {

        if (currentConversation.length === 0) {
            alert("There is no conversation to download.");
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("PDF library is not available. Please refresh the page.");
            return;
        }

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(20);
        pdf.text("PDFChat AI", 20, 20);

        pdf.setFontSize(14);
        pdf.text("Chat Conversation", 20, 32);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text("Date: " + new Date().toLocaleDateString(), 20, 42);

        pdf.line(20, 48, 190, 48);

        let y = 60;

        currentConversation.forEach(message => {

            const role = message.role === "user"
                ? "You"
                : "PDFChat AI";

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);

            if (y > 270) {
                pdf.addPage();
                y = 20;
            }

            pdf.text(role + ":", 20, y);
            y += 7;

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);

            const lines = pdf.splitTextToSize(
                message.content,
                165
            );

            lines.forEach(line => {

                if (y > 275) {
                    pdf.addPage();
                    y = 20;
                }

                pdf.text(line, 20, y);
                y += 6;

            });

            y += 8;

        });

        const pageCount = pdf.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {

            pdf.setPage(i);
            pdf.setFontSize(9);

            pdf.text("Generated using PDFChat AI", 20, 290);
            pdf.text("Page " + i + " of " + pageCount, 170, 290);

        }

        pdf.save("PDFChat_AI_Conversation.pdf");

    });

}

