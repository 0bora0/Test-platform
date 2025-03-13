import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc,query,where } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.firebasestorage.app",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
};

// 🔥 Инициализиране на Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📌 Взимаме HTML елементите
const disciplineSelect = document.getElementById("course");
const questionBankSelect = document.getElementById("questionBank");
const userTableBody = document.getElementById("userTableBody");
const questionTableBody = document.getElementById("questionTableBody");
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
            option.value = doc.id; // Взимаме ID-то на документа
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
    const selectedDiscipline = disciplineSelect.value.trim();

    if (!selectedDiscipline) return;

    try {
        const coursesSnapshot = await getDocs(query(collection(db, "courses"), where("disciplineName", "==", selectedDiscipline)));
        
        coursesSnapshot.forEach((doc) => {
            const course = doc.data();
            if (course.questionBanks && Array.isArray(course.questionBanks)) {
                course.questionBanks.forEach((bank) => {
                    let option = document.createElement("option");
                    option.value = bank.name;
                    option.textContent = bank.name;
                    questionBankSelect.appendChild(option);
                });
            }
        });

    } catch (error) {
        console.error("❌ Грешка при зареждане на банките с въпроси:", error);
    }
}


async function loadStudents() {
    userTableBody.innerHTML = ""; // Изчистваме таблицата
    const selectedDiscipline = disciplineSelect.value.trim();

    if (!selectedDiscipline) return;

    try {
        const disciplineDoc = await getDoc(doc(db, "courses", selectedDiscipline));

        if (disciplineDoc.exists()) {
            const disciplineData = disciplineDoc.data();
            if (disciplineData.students && Array.isArray(disciplineData.students)) {
                disciplineData.students.forEach((student) => {
                    addStudentToTable(student);
                });
            }
        }
    } catch (error) {
        console.error("❌ Грешка при зареждане на студентите:", error);
    }
}

// 🔹 Функция за добавяне на студент в таблицата (без презареждане)
function addStudentToTable(student) {
    const row = document.createElement("tr");
    row.dataset.email = student.email; // Запазваме email-а като уникален идентификатор

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

    // ✅ Проверяваме дали студентът вече е избран
    if (selectedStudents.has(student.email)) {
        checkbox.checked = true;
    }

    // ✅ Добавяне или премахване на студент при кликване на чекбокса
    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            selectedStudents.add(student.email);
        } else {
            selectedStudents.delete(student.email);
        }
    });

    userTableBody.appendChild(row);
}

async function loadQuestions() {
    questionTableBody.innerHTML = ""; // Изчистваме таблицата
    const selectedBankName = questionBankSelect.value.trim(); // Избраната банка с въпроси
    const selectedDiscipline = disciplineSelect.value.trim(); // Избраната дисциплина

    if (!selectedBankName || !selectedDiscipline) return;

    try {
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        let foundQuestions = false; // Флаг дали има въпроси

        coursesSnapshot.forEach((doc) => {
            const course = doc.data();

            // Проверяваме дали курсът съдържа избраната дисциплина
            if (course.disciplineName === selectedDiscipline && course.questionBanks) {
                // Търсим избраната банка с въпроси
                const selectedBank = course.questionBanks.find(bank => bank.name === selectedBankName);
                
                if (selectedBank && selectedBank.questions && selectedBank.questions.length > 0) {
                    foundQuestions = true;
                    selectedBank.questions.forEach((question, index) => {
                        addQuestionToTable(question, index);
                    });
                }
            }
        });

        // Ако няма въпроси, показваме съобщение
        if (!foundQuestions) {
            questionTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">❌ Няма въпроси в тази банка</td></tr>`;
        }

    } catch (error) {
        console.error("❌ Грешка при зареждане на въпросите:", error);
        questionTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">❌ Грешка при зареждане на въпросите</td></tr>`;
    }
}


// 🔹 Функция за добавяне на въпрос в таблицата (Bootstrap стил)
function addQuestionToTable(question, index) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${question.question}</td>
        <td>${question.options[0]}</td>
        <td>${question.options[1]}</td>
        <td>${question.options[2]}</td>
        <td>${question.options[3]}</td>
        <td>
            <select class="form-select correct-answer-select">
                ${question.options.map(option => `<option value="${option}" ${option === question.correctAnswer ? 'selected' : ''}>${option}</option>`).join("")}
            </select>
        </td>
        <td class="text-center">
            <input type="checkbox" class="form-check-input select-question" data-index="${index}">
        </td>
    `;

    row.querySelector(".select-question").addEventListener("change", (e) => {
        if (e.target.checked) {
            selectedQuestions.add(index);
        } else {
            selectedQuestions.delete(index);
        }
    });

    questionTableBody.appendChild(row);
}


// ✅ Слушатели за събития
disciplineSelect.addEventListener("change", loadQuestionBanks);
questionBankSelect.addEventListener("change", loadQuestions);
document.addEventListener("DOMContentLoaded", loadDisciplines);
disciplineSelect.addEventListener("change", loadStudents);
