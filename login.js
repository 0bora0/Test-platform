import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCqOBkhYePT5u2O_1xPiMFPo0TakvT2PA8",
    authDomain: "testcenter-2025feb.firebaseapp.com",
    projectId: "testcenter-2025feb",
    storageBucket: "testcenter-2025feb.firebasestorage.app",
    messagingSenderId: "855126302941",
    appId: "1:855126302941:web:15f3ab817a4a8cad3c3b34",
    measurementId: "G-LKR8SRFFWR"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
    const userNameElement = document.getElementById('userName');
    const userImageElement = document.getElementById('userImage');
    if (user) {
        userNameElement.textContent = user.email;
        userImageElement.src = user.photoURL || 'https://via.placeholder.com/40';

        checkUserRole(user.uid);
    } else {
        userNameElement.textContent = "Логване";
        userImageElement.src = 'https://via.placeholder.com/40';
    }
});

async function checkUserRole(userId) {
    const userDocRef = doc(db, "users", userId);
    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const userRole = userData.role;

        if (userRole === "Студент") {
            window.location.href = "student-profile.html";
        } else {
            window.location.href = "profile.html"; 
        }
    } else {
        console.log("Потребителят няма запазена информация за ролята.");
    }
}

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Логнат потребител:", userCredential.user.email);

        const successModal = new bootstrap.Modal(document.getElementById("successModal"));
        successModal.show(); 
       
        const continueButton = document.getElementById("continueButton");
        continueButton.addEventListener("click", () => {
           
            checkUserRole(userCredential.user.uid);
        });

    } catch (error) {
        console.error("Грешка при вход: ", error.message);
        const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
        errorModal.show(); 
    }
});

const logoutButton = document.getElementById("logoutButton");
logoutButton?.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            console.log('Потребителят излезе');
            window.location.href = 'login.html'; 
        })
        .catch((error) => {
            console.error("Грешка при излизане:", error.message);
        });
});
