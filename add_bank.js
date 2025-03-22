import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
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
        const coursesRef = collection(db, "courses");
        const querySnapshot = await getDocs(coursesRef);

        querySnapshot.forEach((doc) => {
            const courseData = doc.data();
            const option = document.createElement("option");
            option.value = doc.id; // ID на курса
            option.textContent = courseData.disciplineName;
            disciplineSelect.appendChild(option);
        });
    } catch (error) {
        showAlert("danger", "Грешка при зареждането на дисциплините.");
    }
});
document.getElementById("addQuestionBankForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedDisciplineId = document.getElementById("discipline-select").value;
    const questionBankName = document.getElementById("questionBankName").value.trim();
    if (!selectedDisciplineId || !questionBankName) {
        showAlert("warning", "Попълнете всички полета.");
        return;
    }

    try {
        const courseRef = doc(db, "courses", selectedDisciplineId);
        const courseSnapshot = await getDoc(courseRef);

        if (!courseSnapshot.exists()) {
            showAlert("danger", "Дисциплината не е намерена.");
            return;
        }
        let courseData = courseSnapshot.data();
        let questionBanks = courseData.questionBanks || [];
        const newQuestionBank = {
            name: questionBankName,
            questions: [] 
        };
        questionBanks.push(newQuestionBank);
        await updateDoc(courseRef, {
            questionBanks: questionBanks,
        });

        showAlert("success",`Банка с въпроси "${questionBankName}" е добавена към ${courseData.disciplineName}`);
        location.reload();
    } catch (error) {
        showAlert("danger","❌ Грешка при запазване на въпросната банка:", error);
        showAlert("warning","⚠️ Възникна грешка при запазването. Опитайте отново.");
    }
});
