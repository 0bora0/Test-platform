import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.firebasestorage.app",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
};

// Инициализация на Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        const currentUserEmail = user.email;
        console.log("🔹 Логнат потребител:", currentUserEmail);
        
        // Зареждане на тестовете само за този потребител
        loadUserTests(currentUserEmail);
    } else {
        console.log("❌ Няма логнат потребител");
        window.location.href = "login.html"; // Пренасочване към страницата за вход
    }
});
// Извличане на текущия потребител (примерен userId, трябва да го вземеш от системата за логин)
const currentUserEmail = "";  // Трябва да замениш с реалния email от системата за автентикация

// HTML елементи
const testTableBody = document.getElementById("testTableBody");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

// Функция за зареждане на тестовете на текущия потребител
async function loadUserTests(currentUserEmail) {
    testTableBody.innerHTML = "";
    
    try {
        const testsSnapshot = await getDocs(collection(db, "tests"));

        testsSnapshot.forEach(async (testDoc) => {
            const testData = testDoc.data();

            // Проверка дали текущият потребител е включен в теста
            if (testData.students.some(student => student.email === currentUserEmail)) {
                
                // Взимане на информация за преподавателя
                const creatorDoc = await getDoc(doc(db, "users", testData.createdBy));
                const creatorData = creatorDoc.exists() ? creatorDoc.data() : { fullName: "Неизвестен", profilePic: "" };

                // Добавяне на ред в таблицата
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${new Date(testData.createdAt).toLocaleString()}</td>
                    <td>${testData.discipline}</td>
                    <td>${creatorData.fullName}</td>
                    <td class="text-center">
                        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#testModal"
                            onclick="openTestModal('${testDoc.id}')">
                            Преглед
                        </button>
                    </td>
                `;
                testTableBody.appendChild(row);
            }
        });
    } catch (error) {
        console.error("Грешка при зареждане на тестовете:", error);
    }
}


// Функция за отваряне на модалния прозорец с информация за теста
async function openTestModal(testId) {
    try {
        const testDoc = await getDoc(doc(db, "tests", testId));
        if (!testDoc.exists()) return;

        const testData = testDoc.data();

        // Взимане на информация за преподавателя
        const creatorDoc = await getDoc(doc(db, "users", testData.createdBy));
        const creatorData = creatorDoc.exists() ? creatorDoc.data() : { fullName: "Неизвестен", profilePic: "" };

        // Попълване на модала
        modalTitle.textContent = `Детайли за теста: ${testData.discipline}`;
        modalBody.innerHTML = `
            <p><strong>Брой въпроси:</strong> ${testData.questionCount}</p>
            <p><strong>Време за теста:</strong> ${testData.testDuration} минути</p>
            <p><strong>Тип на теста:</strong> ${testData.testType}</p>
            <p><strong>Точки за преминаване:</strong> ${testData.passingScore}</p>
            <p><strong>Общ брой точки:</strong> ${testData.totalScore || "Неизвестно"}</p>
            <p><strong>Създаден от:</strong> ${creatorData.fullName}</p>
            <img src="${creatorData.profilePic || 'https://via.placeholder.com/100'}" alt="Снимка на преподавателя" class="rounded-circle" width="100">
            <div class="text-center mt-3">
                <button class="btn btn-primary">Започни теста</button>
            </div>
        `;
    } catch (error) {
        console.error("Грешка при зареждане на детайлите за теста:", error);
    }
}

// Зареждане на тестовете при стартиране
document.addEventListener("DOMContentLoaded", loadUserTests);

// Правим функцията достъпна глобално
window.openTestModal = openTestModal;
