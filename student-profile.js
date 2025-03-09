import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

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

onAuthStateChanged(auth, (user) => {
    displayUserInfo(user);

    if (user) {
        fetchDashboardData();
    }
});

async function fetchDashboardData() {
    try {
        const user = auth.currentUser;
        if (!user) {

            window.location.href = 'login.html';
            return;
        }


        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const userCount = usersSnapshot.size;

        const studentsQuery = query(usersCollection, where("role", "==", "Студент"));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentCount = studentsSnapshot.size;

        const teachersQuery = query(usersCollection, where("role", "==", "Преподавател"));
        const teachersSnapshot = await getDocs(teachersQuery);
        const teacherCount = teachersSnapshot.size;

        const questionsCollection = collection(db, "questions");
        const questionsSnapshot = await getDocs(questionsCollection);
        const questionCount = questionsSnapshot.size;

        document.getElementById("userCount").textContent = userCount;
        document.getElementById("studentCount").textContent = studentCount;
        document.getElementById("averageScore").textContent = teacherCount;
        document.getElementById("testCount").textContent = questionCount;

    } catch (error) {
        console.error("Грешка при извличане на данни:", error);
    }
}
