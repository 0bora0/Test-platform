/* import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

const pageAccessRules = {
    "add_question.html": ["Преподавател", "Администратор", "Суперадминистратор"],
    "edit_question.html": ["Преподавател", "Администратор", "Суперадминистратор"],
    "edit-students.html": ["Студент"],
    "grades-students.html": ["Студент"],
    "edit.html": ["Преподавател", "Администратор", "Суперадминистратор"],
    "grades.html": ["Преподавател", "Администратор", "Суперадминистратор"],
    "index1-students.html": ["Студент"],
    "users.html": ["Преподавател", "Администратор", "Суперадминистратор"],
    "index1.html": ["Преподавател", "Администратор", "Суперадминистратор"],
    "preview.html": ["Преподавател", "Администратор", "Суперадминистратор"],
    "profile.html": ["Преподавател", "Администратор", "Суперадминистратор"],
    "student-profile.html": ["Студент"],
    "user-students.html": ["Студент"]
};

async function enforcePageAccess() {
    try {
        const user = await new Promise((resolve, reject) => {
            onAuthStateChanged(auth, resolve, reject);
        });

        if (!user) {
            console.log("Потребителят не е логнат.");
            window.location.href = "login.html";
            return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            console.error("Няма запис за потребителя в Firestore.");
            window.location.href = "unauthorized.html";
            return;
        }

        const userRole = userDoc.data().role;
        console.log(`Роля на потребителя: ${userRole}`);

        const rawPage = window.location.pathname.split("/").pop().toLowerCase();
        const currentPage = rawPage.endsWith(".html") ? rawPage : `${rawPage}.html`;

        console.log(`Текуща страница: ${currentPage}`);

        const allowedRoles = pageAccessRules[currentPage];
        if (!allowedRoles || !allowedRoles.includes(userRole)) {
            console.error(`Потребителят няма достъп до ${currentPage}.`);
            window.location.href = "unauthorized.html";
            return;
        }

        console.log(`Достъпът е разрешен за ${userRole}`);
    } catch (error) {
        console.error("Грешка при проверката на достъпа:", error);
        window.location.href = "unauthorized.html";
    }
}

export { enforcePageAccess };
 */