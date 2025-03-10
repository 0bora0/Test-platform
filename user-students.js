import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

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

        const usersQuery = query(collection(db, "users"), where("role", "==", "Студент"));
        const querySnapshot = await getDocs(usersQuery);
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userRow = document.createElement("tr");

            userRow.innerHTML = `
                <td>${userData.firstName}</td>
                <td>${userData.lastName}</td>
                <td>${userData.username}</td>
                <td>${userData.email}</td>
                <td><span class="badge bg-${getRoleClass(userData.role)}">${userData.role}</span></td>
            `;

            userTableBody.appendChild(userRow);
        });
    } catch (error) {
        console.error("Грешка при извличането на потребители: ", error);
    }
};

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
