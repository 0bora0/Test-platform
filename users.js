import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
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

 const userNameElement = document.getElementById('userName');
        const userImageElement = document.getElementById('userImage');
        const logoutButton = document.getElementById('logout');
function displayUserInfo() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid)); 
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const firstName = userData.firstName || "Име";
                    const lastName = userData.lastName || "Фамилия";
                    const profilePic = userData.profilePic || "https://via.placeholder.com/40";

                    const fullName = firstName && lastName 
                        ? firstName + ' ' + lastName 
                        : user.email;

                    userNameElement.textContent = fullName;
                    userImageElement.src = profilePic; // Използване на Base64 снимка
                } else {
                    userNameElement.textContent = user.email;
                    userImageElement.src = "https://via.placeholder.com/40";
                }

                logoutButton.style.display = 'block';
            } catch (error) {
                console.error("Грешка при извличане на данни за потребителя:", error);
            }
        } else {
            userNameElement.textContent = "Не сте влезли";
            userImageElement.src = "https://via.placeholder.com/40";
            logoutButton.style.display = 'none';
        }
    });
}
        logoutButton?.addEventListener('click', () => {
            signOut(auth).then(() => {
                console.log('Потребителят излезе');
                window.location.href = 'login.html'; 
            }).catch((error) => {
                console.error('Грешка при излизане:', error);
            });
        });

        displayUserInfo();
const userTableBody = document.getElementById("userTableBody");

const getUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userId = doc.id; 
            const userRow = document.createElement("tr");

            const profilePic = userData.profilePic || "https://placehold.co/100x100"; // Ако няма снимка, използвай placeholder

            userRow.innerHTML = `
                <td><img src="${profilePic}" alt="Профилна снимка" class="rounded-circle" width="100" height="100"></td>
                <td>${userData.firstName}</td>
                <td>${userData.lastName}</td>
                <td>${userData.username}</td>
                <td>${userData.email}</td>
                <td>${userData.role}</td>
                <td>
                    <select class="form-select role-select" data-user-id="${userId}">
                        <option value="Администратор" ${userData.role === "Администратор" ? "selected" : ""}>Администратор</option>
                        <option value="Студент" ${userData.role === "Студент" ? "selected" : ""}>Студент</option>
                        <option value="Преподавател" ${userData.role === "Преподавател" ? "selected" : ""}>Преподавател</option>
                        <option value="Суперадминистратор" ${userData.role === "Суперадминистратор" ? "selected" : ""}>Суперадминистратор</option>
                    </select>
                </td>
            `;

            userTableBody.appendChild(userRow);
        });
    } catch (error) {
        console.error("Грешка при извличането на потребители: ", error);
    }
};


document.getElementById("save").addEventListener("click", () => {
    const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
    confirmModal.show();
});

document.getElementById("confirmSave").addEventListener("click", async () => {
    try {
        const roleSelects = document.querySelectorAll(".role-select");

        for (const select of roleSelects) {
            const userId = select.getAttribute("data-user-id");
            const newRole = select.value;

            await updateDoc(doc(db, "users", userId), { role: newRole });
        }

        const confirmModal = bootstrap.Modal.getInstance(document.getElementById("confirmModal"));
        confirmModal.hide();

        const successAlert = document.getElementById("successAlert");
        successAlert.style.display = "block";
    } catch (error) {
        console.error("Грешка при запазването на промените: ", error);
    }
});

const getRoleClass = (role) => {
    switch (role.toLowerCase()) {
        case "Администратор":
            return "danger";
        case "Студент":
            return "info";
        case "Преподавател":
            return "warning";
        case "Суперадминистратор":
            return "success";
        default:
            return "secondary";
    }
};

getUsers();
getRoleClass();

    document.getElementById('export').addEventListener('click', function () {
    const table = document.getElementById('userTableBody'); 
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "all_users.xlsx");
});
document.getElementById("save").addEventListener('click', saveGrades);
