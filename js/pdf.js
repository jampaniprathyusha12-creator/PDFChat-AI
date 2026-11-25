
/* =====================================================
   PDFCHAT AI - PDF UPLOAD AND TEXT EXTRACTION
===================================================== */

const pdfInput = document.getElementById("pdfInput");
const browseBtn = document.getElementById("browseBtn");
const emptyUploadBtn = document.getElementById("emptyUploadBtn");
const attachBtn = document.getElementById("attachBtn");

const dropZone = document.getElementById("dropZone");
const pdfViewer = document.getElementById("pdfViewer");
const pdfEmptyState = document.getElementById("pdfEmptyState");

const documentSelect = document.getElementById("documentSelect");
const pdfFileName = document.getElementById("pdfFileName");
const pdfPageInfo = document.getElementById("pdfPageInfo");

const uploadedDocuments = document.getElementById("uploadedDocuments");
const chatDocumentName = document.getElementById("chatDocumentName");

const renameBtn = document.getElementById("renameBtn");


// STORE UPLOADED DOCUMENTS
window.pdfDocuments = [];
window.currentPdfText = "";
window.currentPdf = null;

let documentCounter = 0;
let pdfJsPromise = null;


// LOAD PDF.JS LIBRARY
async function loadPdfJs() {

    if (!pdfJsPromise) {

        pdfJsPromise = import(
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs"
        ).then((pdfjsLib) => {

            pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

            return pdfjsLib;

        });

    }

    return pdfJsPromise;
}


// OPEN FILE PICKER
browseBtn.addEventListener("click", () => {
    pdfInput.click();
});

emptyUploadBtn.addEventListener("click", () => {
    pdfInput.click();
});

attachBtn.addEventListener("click", () => {
    pdfInput.click();
});


// FILE SELECTION
pdfInput.addEventListener("change", (event) => {

    const files = Array.from(event.target.files);

    files.forEach((file) => {
        uploadPdf(file);
    });

    pdfInput.value = "";

});


// UPLOAD PDF FUNCTION
async function uploadPdf(file) {

    if (!file) return;

    // CHECK PDF TYPE
    if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    ) {
        alert("Please select a valid PDF file.");
        return;
    }

    // CHECK FILE SIZE
    if (file.size > 25 * 1024 * 1024) {
        alert("Please upload a PDF smaller than 25 MB.");
        return;
    }

    // AVOID DUPLICATE UPLOADS
    const duplicate = window.pdfDocuments.find(
        (doc) =>
            doc.originalName === file.name &&
            doc.file.size === file.size
    );

    if (duplicate) {
        selectDocument(duplicate.id);
        alert("This PDF is already uploaded.");
        return;
    }

    documentCounter++;

    const documentId = "pdf-" + Date.now() + "-" + documentCounter;

    const documentObject = {
        id: documentId,
        name: file.name,
        originalName: file.name,
        file: file,
        url: URL.createObjectURL(file),
        text: "",
        pages: 0,
        uploadedAt: new Date().toLocaleString(),
        extracting: true
    };

    window.pdfDocuments.push(documentObject);

    // UPDATE INTERFACE
    updateDocumentDropdowns();
    renderUploadedDocuments();

    // DISPLAY PDF
    selectDocument(documentId);

    pdfPageInfo.textContent = "Extracting PDF text...";

    // EXTRACT PDF TEXT
    try {

        const extracted = await extractPdfText(file);

        documentObject.text = extracted.text;
        documentObject.pages = extracted.pages;
        documentObject.extracting = false;

        if (window.currentPdf?.id === documentId) {
            window.currentPdfText = extracted.text;
        }

        pdfPageInfo.textContent =
            extracted.pages + " pages";

        renderUploadedDocuments();

        console.log("PDF text extracted successfully.");
        console.log(extracted.text);

    } catch (error) {

        console.error("PDF extraction error:", error);

        documentObject.extracting = false;

        pdfPageInfo.textContent = "PDF opened - text extraction failed";

        alert(
            "The PDF was uploaded, but its text could not be extracted. " +
            "Please check whether the PDF is readable and not password protected."
        );

        renderUploadedDocuments();

    }

}


// EXTRACT TEXT FROM PDF USING PDF.JS
async function extractPdfText(file) {

    const pdfjsLib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer
    }).promise;

    let fullText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

        const page = await pdf.getPage(pageNumber);

        const textContent = await page.getTextContent();

        const pageText = textContent.items
            .map((item) => item.str)
            .join(" ");

        fullText +=
            "\n\n--- Page " + pageNumber + " ---\n\n" +
            pageText;

    }

    return {
        text: fullText.trim(),
        pages: pdf.numPages
    };

}


// SELECT A DOCUMENT
function selectDocument(documentId) {

    const selectedDocument = window.pdfDocuments.find(
        (doc) => doc.id === documentId
    );

    if (!selectedDocument) return;

    window.currentPdf = selectedDocument;
    window.currentPdfText = selectedDocument.text;

    // DISPLAY PDF
    pdfViewer.src = selectedDocument.url;
    pdfViewer.hidden = false;

    pdfEmptyState.hidden = true;

    // UPDATE SELECT BOX
    documentSelect.value = selectedDocument.id;

    // UPDATE FILE INFORMATION
    pdfFileName.innerHTML = `
        <i class="fa-regular fa-file-pdf"></i>
        ${escapePdfHtml(selectedDocument.name)}
    `;

    pdfPageInfo.textContent = selectedDocument.extracting
        ? "Extracting text..."
        : selectedDocument.pages + " pages";

    // UPDATE CHAT DOCUMENT LABEL
    chatDocumentName.innerHTML = `
        <i class="fa-solid fa-file-pdf"></i>
        <span>${escapePdfHtml(selectedDocument.name)}</span>
    `;

    // UPDATE FEATURE PAGE SELECTORS
    const featureSelectors = [
        "summarySelect",
        "keypointsSelect",
        "quizSelect"
    ];

    featureSelectors.forEach((selectorId) => {

        const selector = document.getElementById(selectorId);

        if (selector) {
            selector.value = selectedDocument.id;
        }

    });

    console.log("Selected PDF:", selectedDocument.name);

}


// DOCUMENT DROPDOWN
documentSelect.addEventListener("change", (event) => {

    const documentId = event.target.value;

    if (documentId) {
        selectDocument(documentId);
    }

});


// UPDATE ALL DOCUMENT DROPDOWNS
function updateDocumentDropdowns() {

    const selectors = [
        "documentSelect",
        "summarySelect",
        "keypointsSelect",
        "quizSelect"
    ];

    selectors.forEach((selectorId) => {

        const selector = document.getElementById(selectorId);

        if (!selector) return;

        const previousValue = selector.value;

        selector.innerHTML = selectorId === "documentSelect"
            ? '<option value="">Select a PDF document</option>'
            : '<option value="">Select PDF document</option>';

        window.pdfDocuments.forEach((doc) => {

            const option = document.createElement("option");

            option.value = doc.id;
            option.textContent = doc.name;

            selector.appendChild(option);

        });

        if (
            window.pdfDocuments.some(
                (doc) => doc.id === previousValue
            )
        ) {
            selector.value = previousValue;
        }

    });

}


// DISPLAY UPLOADED DOCUMENTS
function renderUploadedDocuments() {

    if (!uploadedDocuments) return;

    uploadedDocuments.innerHTML = "";

    if (window.pdfDocuments.length === 0) {

        uploadedDocuments.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <p>No documents uploaded yet.</p>
            </div>
        `;

        return;
    }

    window.pdfDocuments.forEach((doc) => {

        const card = document.createElement("div");

        card.className = "document-card";

        const title = document.createElement("h3");
        title.textContent = doc.name;

        const icon = document.createElement("i");
        icon.className = "fa-solid fa-file-pdf";

        const details = document.createElement("p");

        details.textContent = doc.extracting
            ? "Extracting text..."
            : doc.pages + " pages";

        const selectButton = document.createElement("button");

        selectButton.className = "secondary-btn";
        selectButton.textContent = "Open PDF";

        selectButton.addEventListener("click", () => {
            selectDocument(doc.id);

            document.querySelectorAll(".feature-page").forEach((page) => {
                page.hidden = true;
            });

            document.getElementById("workspace").hidden = false;
        });

        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(details);
        card.appendChild(selectButton);

        uploadedDocuments.appendChild(card);

    });

}


// RENAME PDF
renameBtn.addEventListener("click", () => {

    if (!window.currentPdf) {
        alert("Please upload or select a PDF first.");
        return;
    }

    const newName = prompt(
        "Enter a new document name:",
        window.currentPdf.name.replace(/\.pdf$/i, "")
    );

    if (!newName || !newName.trim()) return;

    window.currentPdf.name = newName.trim();

    if (!window.currentPdf.name.toLowerCase().endsWith(".pdf")) {
        window.currentPdf.name += ".pdf";
    }

    selectDocument(window.currentPdf.id);

    updateDocumentDropdowns();

    renderUploadedDocuments();

});


// DRAG AND DROP PDF UPLOAD
dropZone.addEventListener("dragover", (event) => {

    event.preventDefault();

    dropZone.classList.add("drag-over");

});

dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("drag-over");

});

dropZone.addEventListener("drop", (event) => {

    event.preventDefault();

    dropZone.classList.remove("drag-over");

    const files = Array.from(event.dataTransfer.files);

    files.forEach((file) => {
        uploadPdf(file);
    });

});


// PREVENT HTML INJECTION IN DOCUMENT NAMES
function escapePdfHtml(value) {

    return String(value).replace(/[&<>"']/g, (character) => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}


// INITIALIZE
updateDocumentDropdowns();
renderUploadedDocuments();

console.log("PDFChat AI PDF module loaded.");
