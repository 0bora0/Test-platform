import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

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
const auth = getAuth();
const userTableBody = document.getElementById("userTableBody");

// Зареждане на потребителите
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
async function getUsers() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        userTableBody.innerHTML = ""; // Изчистване преди презареждане

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userId = doc.id;
            const userRow = document.createElement("tr");
            userRow.dataset.id = userId;

            const profilePic = userData.profilePic || "https://placehold.co/100x100";

            userRow.innerHTML = `
                <td><img src="${profilePic}" alt="Профилна снимка" class="rounded-circle" width="50" height="50"></td>
                <td contenteditable="false">${userData.firstName || "—"}</td>
                <td contenteditable="false">${userData.lastName || "—"}</td>
                <td contenteditable="false">${userData.username || "—"}</td>
                <td contenteditable="false">${userData.email || "—"}</td>
                <td contenteditable="false">${userData.role || "—"}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-info btn-sm save-btn" style="display:none;"><i class="bi bi-check"></i></button>
                    <button class="btn btn-danger btn-sm delete-btn"><i class="bi bi-trash"></i></button>
                    <button class="btn btn-primary btn-sm look-btn"><i class="bi bi-eye"></i></button>
                </td>
            `;

            userTableBody.appendChild(userRow);

            // Event Listeners за бутони
            userRow.querySelector(".edit-btn").addEventListener("click", function () {
                toggleEdit(userRow);
            });

            userRow.querySelector(".save-btn").addEventListener("click", async function () {
                await updateUser(userId, userRow);
            });

            userRow.querySelector(".delete-btn").addEventListener("click", async function () {
                if (confirm("Сигурни ли сте, че искате да изтриете този потребител?")) {
                    await deleteDoc(doc(db, "users", userId));
                    userRow.remove();
                    showAlert("warning", `Потребителят с ID ${userId} беше изтрит.`);
                }
            });
        });

    } catch (error) {
        showAlert("danger", error.message);
    }
}

// Функция за редакция на ред
function toggleEdit(row) {
    const isEditable = row.cells[1].getAttribute("contenteditable") === "true";

    for (let i = 1; i <= 5; i++) {
        row.cells[i].setAttribute("contenteditable", !isEditable);
    }

    row.querySelector(".edit-btn").style.display = isEditable ? "inline-block" : "none";
    row.querySelector(".save-btn").style.display = isEditable ? "none" : "inline-block";
}

// Функция за обновяване в Firestore
async function updateUser(userId, row) {
    try {
        const updatedUser = {
            firstName: row.cells[1].textContent.trim(),
            lastName: row.cells[2].textContent.trim(),
            username: row.cells[3].textContent.trim(),
            email: row.cells[4].textContent.trim(),
            role: row.cells[5].textContent.trim()
        };

        await updateDoc(doc(db, "users", userId), updatedUser);
        showAlert("success", "Данните на потребителя бяха успешно обновени.");
        toggleEdit(row);
    } catch (error) {
       showAlert("danger", "Грешка при обновяването на потребителя.");
    }
}
getUsers();
