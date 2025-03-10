
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
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

const resultsTableBody = document.getElementById("resultsTableBody");

function calculateGrade(totalScore) {
    let grade;
    let backgroundColor;

    if (totalScore < 41) {
        grade = 2;
        backgroundColor = '#e7505a';
    } else if (totalScore < 56) {
        grade = 3;
        backgroundColor = '#f2784b';
    } else if (totalScore < 71) {
        grade = 4;
        backgroundColor = '#F7CA18';
    } else if (totalScore < 86) {
        grade = 5;
        backgroundColor = '#3598dc';
    } else {
        grade = 6;
        backgroundColor = '#26C281';
    }

    const gradeStyle = `border: 1px solid black !important; 
                                color: #FFF; 
                                background-color: ${backgroundColor}; 
                                padding: 10px; 
                                display: inline-block; 
                                text-align: center;`;
    return `<span style="${gradeStyle}">${grade}</span>`;
}
async function getGrades() {
    try {
        const querySnapshot = await getDocs(collection(db, "grades"));
        querySnapshot.forEach((doc) => {
            const studentData = doc.data();
            const studentImage = studentData.imageURL || "http://placehold.co/300x300"; // Ако няма снимка, използваме placeholder
            const totalScore = studentData.totalScore;
            const grade = studentData.grade;

            const row = document.createElement('tr');

            row.innerHTML = `
                        <td><img src="${studentImage}" alt="Profile Picture" width="30" height="30" /></td>
                        <td>${studentData.firstName}</td>
                        <td>${studentData.lastName}</td>
                        <td>${totalScore}</td>
                        <td>${calculateGrade(totalScore)}</td>
                    `;

            resultsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Грешка при извличането на оценките: ", error);
    }
}

getGrades();

document.getElementById('export').addEventListener('click', function () {
    const table = document.getElementById('resultsTableBody');
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "final_results.xlsx");
});
document.getElementById("save").addEventListener('click', saveGrades);
