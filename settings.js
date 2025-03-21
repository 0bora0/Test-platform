import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.firebasestorage.app",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
};
   // 🔥 Инициализация на Firebase Authentication
   const app = initializeApp(firebaseConfig);
   const auth = getAuth();
   const db = getFirestore(app);
   // 🔹 Взимаме текущото заглавие на страницата
   const pageTitle = document.title;

   // ✅ Проследяване на логнатия потребител
   onAuthStateChanged(auth, (user) => {
       if (user) {
           const userName = user.displayName || user.email; // Ако няма име, използваме email
           document.title = `${pageTitle} | ${userName}`; // Променяме title
       } else {
           document.title = `${pageTitle} | Гост`; // Ако няма логнат потребител
       }
   });
// 🔥 Инициализация на Firebase


// 📌 HTML елементи
const selectedDisciplineName = document.getElementById("course").selectedOptions[0].textContent;
const disciplineSelect = document.getElementById("course");
const questionBankSelect = document.getElementById("questionBank");
const userTableBody = document.getElementById("userTableBody");
const questionTableBody = document.getElementById("questionTableBody");
const saveButton = document.getElementById("saveTest");
const alertBox = document.getElementById("alertBox");

// 📌 Полета за настройки на теста
const courseSelect = document.getElementById("course");
const testTypeSelect = document.getElementById("testType");
const questionCountInput = document.getElementById("questionCount");
const testDurationInput = document.getElementById("testDuration");
const passingScoreInput = document.getElementById("passingScore");

// ✅ Динамични списъци за избрани студенти и въпроси
const selectedStudents = new Map();
const selectedQuestions = new Map();

// ✅ Функция за показване на Bootstrap alerts
function showAlert(type, message) {
    const alertDiv = document.createElement("div");

    // Добавяне само на валиден клас за типа на алерта (без интервали или специални символи)
    alertDiv.classList.add("alert", `alert-${type}`, "alert-dismissible", "fade", "show", "position-fixed", "top-0", "start-50", "translate-middle-x", "mt-3", "shadow");
    
    alertDiv.setAttribute("role", "alert");
    alertDiv.style.zIndex = "1050"; 

    // Съобщението се добавя в HTML съдържанието, а не като CSS клас
    alertDiv.innerHTML = `
        <strong>${type === "danger" ? "Грешка!" : "Успех!"}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.classList.remove("show");
        alertDiv.classList.add("fade");
        setTimeout(() => alertDiv.remove(), 500); // Изтриване след fade out
    }, 5000);
}

// ✅ Функция за изчистване на формуляра след успешен запис
function clearForm() {
    disciplineSelect.value = "";
    questionBankSelect.value = "";
    testTypeSelect.value = "";
    questionCountInput.value = "";
    testDurationInput.value = "";
    passingScoreInput.value = "";
    selectedStudents.clear();
    selectedQuestions.clear();
    userTableBody.innerHTML = ""; // Изчистваме таблицата със студенти
    questionTableBody.innerHTML = ""; // Изчистваме таблицата с въпроси
}

// ✅ Зареждане на дисциплините
async function loadDisciplines() {
    disciplineSelect.innerHTML = '<option value="">-- Избери дисциплина --</option>';

    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        for (const doc of querySnapshot.docs) {
            const course = doc.data();

            if (!course.disciplineName) {
                showAlert("warning",`Грешка при зареждане на дисциплините: Не е намерена дисциплина с ID: ${doc.id}`);
                continue;
            }

            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = course.disciplineName;
            disciplineSelect.appendChild(option);
        }

        console.log("✅ Дисциплините са добавени успешно!");
    } catch (error) {
        showAlert("❌ Грешка при зареждане на дисциплините!", "alert-danger");
    }
}


// ✅ Зареждане на банки с въпроси
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
        showAlert("❌ Грешка при зареждане на банките с въпроси!", "alert-danger");
    }
}

// ✅ Зареждане на студенти
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
        showAlert("❌ Грешка при зареждане на студентите!", "alert-danger");
    }
}

// 🔹 Добавяне на студент в таблицата
function addStudentToTable(student) {
    const selectedDisciplineName = document.getElementById("course").selectedOptions.value;

    const row = document.createElement("tr");
    row.innerHTML = `
<td><img src="${student.profilePic || 'https://placehold.co/50x50'}" class="rounded-circle" width="50"></td><td>${student.firstName}</td>
        <td>${student.middleName || '-'}</td>
        <td>${student.lastName}</td>
        <td>${student.username}</td>
        <td>${student.email}</td>
        <td>${student.disciplineName}</td>
        <td class="text-center">
            <input type="checkbox" class="form-check-input student-checkbox">
        </td>
    `;

    userTableBody.appendChild(row);

    const checkbox = row.querySelector(".student-checkbox");

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            selectedStudents.set(student.email, student);
        } else {
            selectedStudents.delete(student.email);
        }
    });

    userTableBody.appendChild(row);
}

// ✅ Зареждане на въпроси
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
        showAlert("❌ Грешка при зареждане на въпросите!", "alert-danger");
    }
}

// 🔹 Добавяне на въпрос в таблицата
function addQuestionToTable(question) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${question.question}</td>
        <td>${question.options[0]}</td>
        <td>${question.options[1]}</td>
        <td>${question.options[2]}</td>
        <td>${question.options[3]}</td>
        <td class="text-success fw-bold">
            <i class="bi bi-check-circle"></i> ${question.correctAnswer}
        </td>
        <td class="text-center">
            <input type="checkbox" class="form-check-input select-question">
        </td>
    `;

    const checkbox = row.querySelector(".select-question");

    checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
            selectedQuestions.set(question.question, question);
        } else {
            selectedQuestions.delete(question.question);
        }
    });

    questionTableBody.appendChild(row);
}

// ✅ Запазване на теста в базата данни
async function saveTest(event) {
    event.preventDefault();

    // Проверяваме дали всички полета са попълнени
    if (!disciplineSelect.value || !questionBankSelect.value || !testTypeSelect.value ||
        !questionCountInput.value || !testDurationInput.value || !passingScoreInput.value ||
        selectedStudents.size === 0 || selectedQuestions.size === 0) {
        showAlert("⚠️ Попълнете всички полета и изберете поне един студент и един въпрос!", "alert-warning");
        return;
    }
    const selectedDisciplineName = disciplineSelect.selectedOptions[0].textContent;
    const testData = {
        discipline: {
            id: disciplineSelect.value,
            name: selectedDisciplineName
        },
        questionBank: questionBankSelect.value,
        testType: testTypeSelect.value,
        questionCount: parseInt(questionCountInput.value),
        testDuration: parseInt(testDurationInput.value),
        passingScore: parseInt(passingScoreInput.value),
        students: Array.from(selectedStudents.values()),
        questions: Array.from(selectedQuestions.values()),
        createdAt: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "tests"), testData);
        showAlert("✅ Тестът е запазен успешно!", "alert-success");
        clearForm(); // ❗ Изчистваме формуляра след успешен запис
    } catch (error) {
        showAlert("❌ Грешка при записване в базата!", "alert-danger");
    }
}
disciplineSelect.addEventListener("change", loadQuestionBanks);
questionBankSelect.addEventListener("change", loadQuestions);
document.addEventListener("DOMContentLoaded", loadDisciplines);
disciplineSelect.addEventListener("change", loadStudents);
saveButton.addEventListener("click", saveTest);