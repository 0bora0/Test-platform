import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.firebasestorage.app",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
};

// 🔥 Инициализация на Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📌 HTML елементи
const disciplineSelect = document.getElementById("course");
const questionBankSelect = document.getElementById("questionBank");
const userTableBody = document.getElementById("userTableBody");
const questionTableBody = document.getElementById("questionTableBody");
const saveButton = document.getElementById("saveTest"); // 🔹 Бутон за запазване

// 📌 Полета за допълнителни настройки на теста
const testTypeSelect = document.getElementById("testType");
const questionCountInput = document.getElementById("questionCount");
const testDurationInput = document.getElementById("testDuration");
const passingScoreInput = document.getElementById("passingScore");

// ✅ Динамични списъци за избрани студенти и въпроси
const selectedStudents = new Set();
const selectedQuestions = new Set();

// ✅ Зареждане на дисциплините в падащото меню
async function loadDisciplines() {
    disciplineSelect.innerHTML = '<option value="">-- Избери дисциплина --</option>';

    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        querySnapshot.forEach((doc) => {
            const course = doc.data();
            const option = document.createElement("option");
            option.value = doc.id; // ❗ Запазваме ID-то, а не disciplineName
            option.textContent = course.disciplineName;
            disciplineSelect.appendChild(option);
        });
    } catch (error) {
        console.error("❌ Грешка при зареждане на дисциплините:", error);
    }
}

// ✅ Зареждане на банки с въпроси след избор на дисциплина
async function loadQuestionBanks() {
    questionBankSelect.innerHTML = '<option value="">-- Избери банка с въпроси --</option>';
    const selectedDisciplineId = disciplineSelect.value.trim();

    if (!selectedDisciplineId) return;

    try {
        const disciplineDoc = await getDoc(doc(db, "courses", selectedDisciplineId));

        if (disciplineDoc.exists()) {
            const disciplineData = disciplineDoc.data();
            if (disciplineData.questionBanks) {
                disciplineData.questionBanks.forEach((bank) => {
                    let option = document.createElement("option");
                    option.value = bank.name;
                    option.textContent = bank.name;
                    questionBankSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("❌ Грешка при зареждане на банките с въпроси:", error);
    }
}

// ✅ Зареждане на Студенти
async function loadStudents() {
    userTableBody.innerHTML = ""; 
    const selectedDisciplineId = disciplineSelect.value.trim();

    if (!selectedDisciplineId) return;

    try {
        const disciplineDoc = await getDoc(doc(db, "courses", selectedDisciplineId));

        if (disciplineDoc.exists()) {
            const disciplineData = disciplineDoc.data();
            if (disciplineData.students) {
                disciplineData.students.forEach((student) => {
                    addStudentToTable(student);
                });
            }
        }
    } catch (error) {
        console.error("❌ Грешка при зареждане на студентите:", error);
    }
}

// 🔹 Добавяне на Студент в Таблицата
function addStudentToTable(student) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td><img src="${student.profilePic || 'https://placehold.co/50x50'}" class="rounded-circle" width="50"></td>
        <td>${student.firstName}</td>
        <td>${student.middleName || "-"}</td>
        <td>${student.lastName}</td>
        <td>${student.username}</td>
        <td>${student.email}</td>
        <td>${student.disciplineName}</td>
        <td class="text-center">
            <input type="checkbox" class="form-check-input student-checkbox">
        </td>
    `;

    const checkbox = row.querySelector(".student-checkbox");
    
    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            selectedStudents.add(student);
        } else {
            selectedStudents.delete(student);
        }
    });

    userTableBody.appendChild(row);
}

// ✅ Зареждане на Въпроси
async function loadQuestions() {
    questionTableBody.innerHTML = "";
    const selectedDisciplineId = disciplineSelect.value.trim();
    const selectedBankName = questionBankSelect.value.trim();

    if (!selectedDisciplineId || !selectedBankName) return;

    try {
        const disciplineDoc = await getDoc(doc(db, "courses", selectedDisciplineId));

        if (disciplineDoc.exists()) {
            const disciplineData = disciplineDoc.data();

            if (disciplineData.questionBanks) {
                const selectedBank = disciplineData.questionBanks.find(bank => bank.name === selectedBankName);

                if (selectedBank && selectedBank.questions) {
                    selectedBank.questions.forEach((question) => {
                        addQuestionToTable(question);
                    });
                }
            }
        }
    } catch (error) {
        console.error("❌ Грешка при зареждане на въпросите:", error);
    }
}

// 🔹 Добавяне на Въпрос в Таблицата
function addQuestionToTable(question) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${question.question}</td>
        <td>${question.options[0]}</td>
        <td>${question.options[1]}</td>
        <td>${question.options[2]}</td>
        <td>${question.options[3]}</td>
        <td class="text-success">
            <i class="bi bi-check-circle"></i> ${question.correctAnswer}
        </td>
        <td class="text-center">
            <input type="checkbox" class="form-check-input select-question">
        </td>
    `;

    const checkbox = row.querySelector(".select-question");

    checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
            selectedQuestions.add(question);
        } else {
            selectedQuestions.delete(question);
        }
    });

    questionTableBody.appendChild(row);
}



// ✅ Запазване на Теста в Базата Данни
async function saveTest() {
    const testData = {
        discipline: disciplineSelect.value,
        questionBank: questionBankSelect.value,
        testType: testTypeSelect.value,
        questionCount: parseInt(questionCountInput.value),
        testDuration: parseInt(testDurationInput.value),
        passingScore: parseInt(passingScoreInput.value),
        students: Array.from(selectedStudents),
        questions: Array.from(selectedQuestions),
        createdAt: new Date().toISOString()
    };

    try {
        await setDoc(doc(db, "tests", new Date().getTime().toString()), testData);
        alert("✅ Тестът е запазен успешно!");
    } catch (error) {
        console.error("❌ Грешка при запазване на теста:", error);
    }
}

// ✅ Слушатели за Събития
disciplineSelect.addEventListener("change", loadQuestionBanks);
questionBankSelect.addEventListener("change", loadQuestions);
document.addEventListener("DOMContentLoaded", loadDisciplines);
disciplineSelect.addEventListener("change", loadStudents);
saveButton.addEventListener("click", saveTest);
