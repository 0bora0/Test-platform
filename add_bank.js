import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Конфигурация на Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.firebasestorage.app",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
  };
// Инициализиране на Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
function showAlert(type, message) {
    const alertDiv = document.createElement("div");
    alertDiv.classList.add("alert", `alert-${type}`, "alert-dismissible", "fade", "show", "position-fixed", "top-0", "start-50", "translate-middle-x", "mt-3", "shadow");
    alertDiv.setAttribute("role", "alert");
    alertDiv.style.zIndex = "1050"; 
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
document.addEventListener("DOMContentLoaded", async () => {
    const disciplineSelect = document.getElementById("discipline-select");

    try {
        // Зареждаме дисциплините от "courses"
        const coursesRef = collection(db, "courses");
        const querySnapshot = await getDocs(coursesRef);

        querySnapshot.forEach((doc) => {
            const courseData = doc.data();
            const option = document.createElement("option");
            option.value = doc.id; // ID на курса
            option.textContent = courseData.disciplineName; // Име на дисциплината
            disciplineSelect.appendChild(option);
        });
    } catch (error) {
        showAlert("danger", "Грешка при зареждането на дисциплините.");
    }
});

// Обработчик за изпращане на формата
document.getElementById("addQuestionBankForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedDisciplineId = document.getElementById("discipline-select").value;
    const questionBankName = document.getElementById("questionBankName").value.trim();

    // Проверка дали всички полета са попълнени
    if (!selectedDisciplineId || !questionBankName) {
        showAlert("warning", "Попълнете всички полета.");
        return;
    }

    try {
        // Взимаме текущите данни за избраната дисциплина
        const courseRef = doc(db, "courses", selectedDisciplineId);
        const courseSnapshot = await getDoc(courseRef);

        if (!courseSnapshot.exists()) {
            showAlert("danger", "Дисциплината не е намерена.");
            return;
        }

        // Взимаме текущите въпросни банки (ако съществуват)
        let courseData = courseSnapshot.data();
        let questionBanks = courseData.questionBanks || [];

        // Добавяме новата банка с въпроси
        const newQuestionBank = {
            name: questionBankName,
            questions: [] // Празна масивна структура, може да се добавят въпроси по-късно
        };

        // Добавяне на новата банка към съществуващите въпросни банки
        questionBanks.push(newQuestionBank);

        // Обновяваме записа в "courses"
        await updateDoc(courseRef, {
            questionBanks: questionBanks,
        });

        showAlert("success",`Банка с въпроси "${questionBankName}" е добавена към ${courseData.disciplineName}`);

        // Презареждане на страницата
        location.reload();
    } catch (error) {
        showAlert("danger","❌ Грешка при запазване на въпросната банка:", error);
        showAlert("warning","⚠️ Възникна грешка при запазването. Опитайте отново.");
    }
});
