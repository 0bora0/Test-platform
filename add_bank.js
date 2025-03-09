import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Конфигурация на Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCqOBkhYePT5u2O_1xPiMFPo0TakvT2PA8",
    authDomain: "testcenter-2025feb.firebaseapp.com",
    projectId: "testcenter-2025feb",
    storageBucket: "testcenter-2025feb.firebasestorage.app",
    messagingSenderId: "855126302941",
    appId: "1:855126302941:web:15f3ab817a4a8cad3c3b34",
    measurementId: "G-LKR8SRFFWR"
  };

// Инициализиране на Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

        console.log("📌 Заредени дисциплини:", disciplineSelect.innerHTML);
    } catch (error) {
        console.error("❌ Грешка при зареждане на дисциплините:", error);
    }
});

// Обработчик за изпращане на формата
document.getElementById("addQuestionBankForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedDisciplineId = document.getElementById("discipline-select").value;
    const questionBankName = document.getElementById("questionBankName").value.trim();

    // Проверка дали всички полета са попълнени
    if (!selectedDisciplineId || !questionBankName) {
        alert("⚠️ Моля, попълнете всички полета.");
        return;
    }

    try {
        // Взимаме текущите данни за избраната дисциплина
        const courseRef = doc(db, "courses", selectedDisciplineId);
        const courseSnapshot = await getDoc(courseRef);

        if (!courseSnapshot.exists()) {
            alert("❌ Грешка: Дисциплината не съществува.");
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

        console.log(`✅ Банка с въпроси "${questionBankName}" е добавена към ${courseData.disciplineName}`);
        alert("✅ Банката с въпроси беше успешно създадена!");

        // Презареждане на страницата
        location.reload();
    } catch (error) {
        console.error("❌ Грешка при запазване на въпросната банка:", error);
        alert("⚠️ Възникна грешка при запазването. Опитайте отново.");
    }
});
