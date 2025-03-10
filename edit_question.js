import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.firebasestorage.app",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const questionsTableBody = document.getElementById("questionsTableBody");
const disciplineSelect = document.getElementById("disciplineSelect");
const bankSelect = document.getElementById("bankSelect");
const saveBtn = document.getElementById("save");

document.addEventListener("DOMContentLoaded", async () => {
    await loadDisciplines();
});

const loadDisciplines = async () => {
    const querySnapshot = await getDocs(collection(db, "courses"));
    disciplineSelect.innerHTML = '<option value="">-- Изберете дисциплина --</option>';
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = data.disciplineName;
        disciplineSelect.appendChild(option);
    });
};

const loadQuestionBanks = async (disciplineId) => {
    bankSelect.innerHTML = '<option value="">-- Изберете банка --</option>';
    const disciplineDoc = await getDoc(doc(db, "courses", disciplineId));
    if (disciplineDoc.exists()) {
        const disciplineData = disciplineDoc.data();
        if (disciplineData.questionBanks) {
            disciplineData.questionBanks.forEach((bank, index) => {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = bank.name;
                bankSelect.appendChild(option);
            });
        }
    }
};

const loadQuestions = async (disciplineId, bankIndex) => {
    questionsTableBody.innerHTML = "";
    const disciplineDoc = await getDoc(doc(db, "courses", disciplineId));
    if (disciplineDoc.exists()) {
        const disciplineData = disciplineDoc.data();
        const selectedBank = disciplineData.questionBanks[bankIndex];

        if (selectedBank && selectedBank.questions) {
            selectedBank.questions.forEach((questionData, qIndex) => {
                createQuestionRow(disciplineId, bankIndex, qIndex, questionData);
            });
        }
    }
};

const createQuestionRow = (disciplineId, bankIndex, qIndex, questionData) => {
    const questionRow = document.createElement("tr");

    questionRow.innerHTML = `
        <td class="question-text">${questionData.question}</td>
        ${questionData.options.map((option, index) => `
            <td class="option">${option}</td>`).join("")}
        <td>
            <select class="form-select correct-answer-select" disabled>
                ${questionData.options.map(option => `
                    <option value="${option}" ${option === questionData.correctAnswer ? "selected" : ""}>${option}</option>`).join("")}
            </select>
        </td>
        <td>
            <button class="btn btn-warning btn-sm edit-question">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-question">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

    questionRow.setAttribute("data-id", `${disciplineId}-${bankIndex}-${qIndex}`);
    questionsTableBody.appendChild(questionRow);
    questionRow.querySelector(".edit-question").addEventListener("click", () => {
        toggleEditMode(questionRow);
    });
    questionRow.querySelector(".delete-question").addEventListener("click", () => {
        questionRow.remove();
    });
};
const toggleEditMode = (row) => {
    const isEditable = row.querySelector(".question-text").contentEditable === "true";
    row.querySelector(".question-text").contentEditable = !isEditable;
    row.querySelectorAll(".option").forEach(optionCell => {
        optionCell.contentEditable = !isEditable;
    });
    const selectElement = row.querySelector(".correct-answer-select");
    selectElement.disabled = isEditable;
    row.querySelector(".edit-question").innerHTML = isEditable
        ? `<i class="bi bi-pencil"></i>`
        : `<i class="bi bi-check-lg"></i>`;
};
saveBtn.addEventListener("click", async () => {
    const selectedDiscipline = disciplineSelect.value;
    const selectedBankIndex = parseInt(bankSelect.value);
    if (!selectedDiscipline || isNaN(selectedBankIndex)) {
        console.error("Не е избрана дисциплина или банка с въпроси.");
        return;
    }
    const rows = questionsTableBody.querySelectorAll("tr");
    const updatedQuestions = [];
    rows.forEach(row => {
        const questionText = row.querySelector(".question-text").textContent.trim();
        const options = Array.from(row.querySelectorAll(".option")).map(optionCell => optionCell.textContent.trim());
        const correctAnswer = row.querySelector(".correct-answer-select").value;
        updatedQuestions.push({ question: questionText, options, correctAnswer });
    });

    try {
        const disciplineDocRef = doc(db, "courses", selectedDiscipline);
        const disciplineDoc = await getDoc(disciplineDocRef);
        if (!disciplineDoc.exists()) return;

        let disciplineData = disciplineDoc.data();
        disciplineData.questionBanks[selectedBankIndex].questions = updatedQuestions;

        await updateDoc(disciplineDocRef, { questionBanks: disciplineData.questionBanks });
        alert("Промените са запазени успешно!");
    } catch (error) {
        console.error("Грешка при запазване на въпросите:", error);
    }
});

disciplineSelect.addEventListener("change", async () => {
    const selectedDiscipline = disciplineSelect.value;
    if (selectedDiscipline) {
        await loadQuestionBanks(selectedDiscipline);
        questionsTableBody.innerHTML = "";
    }
});
bankSelect.addEventListener("change", async () => {
    const selectedBankIndex = bankSelect.value;
    const selectedDiscipline = disciplineSelect.value;
    if (selectedDiscipline && selectedBankIndex !== "") {
        await loadQuestions(selectedDiscipline, parseInt(selectedBankIndex));
    } else {
        questionsTableBody.innerHTML = "";
    }
});
