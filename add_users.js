import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.firebasestorage.app",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
let selectedStudents = new Map(); // Поправено от `Set` на `Map`

// Функция за показване на съобщения
function showAlert(message, type) {
    const alertBox = document.getElementById("alert-box");
    if (alertBox) {
        alertBox.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    }
}

// Зареждане на студентите от Firestore
async function loadStudents() {
    const studentSelect = document.getElementById("student-select");
    if (!studentSelect) {
        showAlert("Студентите не са заредени! Моля проверете интернет връзката си и опитайте отново!", "warning");
        return;
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "Студент"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            showAlert("Няма намерени студенти!", "warning");
            return;
        }

        snapshot.forEach(doc => {
            const user = doc.data();
            const option = document.createElement("option");
            option.value = doc.id;
            option.dataset.userInfo = JSON.stringify(user);
            option.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
            studentSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Грешка при зареждане на студентите: ", error);
        showAlert("Студентите не са заредени!", "danger");
    }
}

document.getElementById("add-student").addEventListener("click", () => {
    const studentSelect = document.getElementById("student-select");
    const disciplineName = document.getElementById("discipline-name").value.trim();
    const course = document.getElementById("course-select").value;
    const studentList = document.getElementById("student-list");

    if (!disciplineName || !course) {
        showAlert("Моля попълнете всички полета!", "warning");
        return;
    }

    const selectedOption = studentSelect.selectedOptions[0];
    if (!selectedOption) {
        showAlert("Моля изберете поне един участник (студент)!", "warning");
        return;
    }

    const userId = selectedOption.value;
    const user = JSON.parse(selectedOption.dataset.userInfo);

    // Поправена проверка за вече добавени студенти
    if (selectedStudents.has(userId)) {
        showAlert("Този участник вече е добавен!", "warning");
        return;
    }

    selectedStudents.set(userId, { ...user, disciplineName, course });

    const accordionId = `accordion-${userId}`;

    const studentAccordion = document.createElement("div");
    studentAccordion.classList.add("accordion", "mb-2");
    studentAccordion.innerHTML = `
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${accordionId}">
                    ${user.firstName} ${user.lastName}
                </button>
            </h2>
            <div id="collapse-${accordionId}" class="accordion-collapse collapse">
                <div class="accordion-body">
                    <div class="d-flex align-items-center">
                        <img src="${user.profilePic || "https://placehold.co/50x50"}" class="rounded-circle me-3" style="width: 50px; height: 50px;">
                        <div>
                            <p><strong>Име:</strong> ${user.firstName}</p>
                            <p><strong>Фамилия:</strong> ${user.lastName}</p>
                            <p><strong>Имейл:</strong> ${user.email}</p>
                            <p><strong>Роля:</strong> ${user.role}</p>
                            <p><strong>Дисциплина:</strong> ${disciplineName}</p>
                            <p><strong>Курс:</strong> ${course}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    studentList.appendChild(studentAccordion);
});

document.getElementById("create-discipline").addEventListener("click", async () => {
    const disciplineName = document.getElementById("discipline-name").value.trim();
    const course = document.getElementById("course-select").value;

    if (!disciplineName || !course) {
        showAlert("Моля попълнете дисциплината и курса!", "warning");
        return;
    }

    if (selectedStudents.size === 0) {
        showAlert("Няма избрани участници!", "warning");
        return;
    }

    try {
        const studentsArray = Array.from(selectedStudents.values());

        await addDoc(collection(db, "courses"), {
            disciplineName,
            course,
            students: studentsArray,
            timestamp: new Date()
        });

        showAlert("Курсът беше успешно създаден!", "success");
        location.reload();
    } catch (error) {
        console.error("Грешка при създаване на курса: ", error);
        showAlert("Възникна грешка, опитайте отново!", "danger");
    }
});

document.addEventListener("DOMContentLoaded", loadStudents);
