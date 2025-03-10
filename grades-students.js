import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { withLoader } from "./loader.js";
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
document.addEventListener('DOMContentLoaded', function () {
    logoutButton?.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log('Потребителят излезе');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Грешка при излизане:', error);
        });
    });
});
displayUserInfo();
const resultsTableBody = document.getElementById("resultsTableBody");
function calculateGrade(totalScore) {
    let grade;
    let backgroundColor;

    if (totalScore < 41) {
        grade = 2;
        backgroundColor = '#e7505a'; // Червен фон
    } else if (totalScore < 56) {
        grade = 3;
        backgroundColor = '#f2784b'; // Оранжев фон
    } else if (totalScore < 71) {
        grade = 4;
        backgroundColor = '#F7CA18'; // Жълт фон
    } else if (totalScore < 86) {
        grade = 5;
        backgroundColor = '#3598dc'; // Син фон
    } else {
        grade = 6;
        backgroundColor = '#26C281'; // Зелен фон
    }

    const gradeStyle = `
        border: 1px solid black !important; 
        color: #FFF; 
        background-color: ${backgroundColor}; 
        padding: 10px; 
        display: inline-block; 
        text-align: center;
    `;
    return `<span style="${gradeStyle}">${grade}</span>`;
}
async function fetchData() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                resultsTableBody.innerHTML = ""; 
                const gradesRef = collection(db, "grades");
                const q = query(gradesRef, where("email", "==", user.email));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    resultsTableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center">Няма налични данни за показване.</td>
                        </tr>
                    `;
                    return;
                }

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const firstName = data.firstName || "Името липсва";
                    const lastName = data.lastName || "Фамилията липсва";
                    const email = data.email || "Имейл липсва";
                    const currentControlValue = data.currentControlValue || "Не е въведен ТК";
                    const totalScore = data.totalScore || "Не е въведен общ резултат";
                    const grade = data.grade || "Не е въведена оценка";
                    const styledGrade = isNaN(totalScore) ? grade : calculateGrade(totalScore);
                    const row = `
                        <tr>
                            <td>${firstName}</td>
                            <td>${lastName}</td>
                            <td>${email}</td>
                            <td>${totalScore - currentControlValue || "Не е изчислен резултат"}</td>
                            <td>${currentControlValue}</td>
                            <td>${totalScore}</td>
                            <td>${styledGrade}</td>
                        </tr>
                    `;
                    resultsTableBody.insertAdjacentHTML("beforeend", row);
                });

            } catch (error) {
                console.error("Грешка при извличането на данни: ", error);
                resultsTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger">Грешка при зареждането на данните.</td>
                    </tr>
                `;
            }
        } else {
            console.log("Няма логнат потребител.");
            resultsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">Моля, влезте в профила си, за да видите резултатите.</td>
                </tr>
            `;
        }
    });
}
withLoader(fetchData);
document.addEventListener("DOMContentLoaded", function () {
});
