// Firebase инициализация
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.appspot.com",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Функция за извличане на тестове
async function fetchTests(discipline) {
    try {
        const testsRef = collection(db, "tests");
        const q = query(testsRef, where("disciplineName", "==", discipline));
        const querySnapshot = await getDocs(q);

        let tableBody = document.getElementById("usersTableBody");
        tableBody.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const test = doc.data();
            const testId = doc.id;  // Вземаме ID на теста от документа

            if (test.students && Array.isArray(test.students)) {
                test.students.forEach(student => {
                    let row = document.createElement("tr");
                    row.innerHTML = `
                        <td><img src='default-avatar.png' class='rounded-circle' width='40'></td>
                        <td>${student.firstName || "Няма име"}</td>
                        <td>${student.lastName || "Няма фамилия"}</td>
                        <td>${test.disciplineName || "Неизвестна дисциплина"}</td>
                        <td>${test.questionCount || 0}</td>
                        <td>${test.testDuration || 0} мин.</td>
                        <td>
                            <button class='btn btn-danger btn-sm' onclick='removeUser("${student.email}")'>🗑️</button>
                            <button class='btn btn-warning btn-sm' onclick='toggleVisibility("${student.email}")'>👁️</button>
                            <button class='btn btn-primary btn-sm' onclick='previewTest("${testId}")'>🔍</button>
                            <button class='btn btn-info btn-sm' onclick='addTime("${student.email}")'>⏳</button>
                            <button class='btn btn-success btn-sm' onclick='downloadTest("${testId}")'>📥</button>
                        </td>
                        <td>${test.completed ? '✅' : '❌'}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                console.warn(`Тестът ${testId} няма студенти.`);
            }
        });

    } catch (error) {
        console.error("Грешка при зареждане на тестовете:", error);
    }
}

// Функции за бутоните
async function removeUser(email) {
    alert("Премахване на " + email);
}

async function toggleVisibility(email) {
    alert("Смяна на видимостта за " + email);
}

async function previewTest(testId) {
    alert("Преглед на тест " + testId);
}

async function addTime(email) {
    alert("Добавяне на време за " + email);
}

async function downloadTest(testId) {
    alert("Изтегляне на тест " + testId);
}

// Слушане на промяна в селекта
document.addEventListener("DOMContentLoaded", () => {
    const disciplineSelect = document.getElementById("disciplineSelect");

    if (disciplineSelect) {
        disciplineSelect.addEventListener("change", () => {
            fetchTests(disciplineSelect.value);
        });
    } else {
        console.error("disciplineSelect не е намерен в DOM.");
    }
});
