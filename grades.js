import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
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

document.getElementById("showHide").addEventListener("click", () => {
    const mainTableContainer = document.getElementById("mainTableContainer");
    const archivedTableContainer = document.getElementById("archivedTableContainer");
    const showHideButton = document.getElementById("showHide");

    if (mainTableContainer.classList.contains("d-none")) {
        mainTableContainer.classList.remove("d-none");
        archivedTableContainer.classList.add("d-none");
        showHideButton.textContent = "Покажи оценените студенти";
    } else {
        mainTableContainer.classList.add("d-none");
        archivedTableContainer.classList.remove("d-none");
        showHideButton.textContent = "Покажи чакащи оценка студенти";
    }
});
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
        window.location.href = 'login.html';
    }).catch(console.error);
});
displayUserInfo();

const resultsTableBody = document.getElementById("resultsTableBody");
const archivedTableBody = document.getElementById("archivedTableBody");

function calculateGrade(totalScore) {
    const gradeData = [
        { min: 0, max: 40, grade: 2, color: '#e7505a' },
        { min: 41, max: 55, grade: 3, color: '#f2784b' },
        { min: 56, max: 70, grade: 4, color: '#F7CA18' },
        { min: 71, max: 85, grade: 5, color: '#3598dc' },
        { min: 86, max: 100, grade: 6, color: '#26C281' }
    ];
    const { grade, color } = gradeData.find(g => totalScore >= g.min && totalScore <= g.max);
    return `<span style="border: 1px solid black; color: #FFF; background-color: ${color}; padding: 10px;">${grade}</span>`;
}

function normalizeEmail(email) {
    return email ? email.replace(/[@.]/g, "-") : "";
}

function attachInputListeners() {
    const inputs = document.querySelectorAll(".control-input");
    inputs.forEach(input => {
        input.addEventListener("input", function () {
            const row = this.closest("tr");
            const baseScore = parseInt(row.querySelector(".total-score").dataset.baseScore) || 0;
            const controlValue = parseInt(this.value) || 0;
            const totalScore = baseScore + controlValue;
            row.querySelector(".total-score").textContent = totalScore;
            row.querySelector(".grade").innerHTML = calculateGrade(totalScore);
        });
    });
}

async function loadResults() {
    resultsTableBody.innerHTML = "";
    archivedTableBody.innerHTML = "";

    const resultsSnapshot = await getDocs(collection(db, "results"));
    const gradesSnapshot = await getDocs(collection(db, "grades"));

    const gradedAttemptIds = new Set();
    const gradesData = {};
    gradesSnapshot.forEach(doc => {
        const gradeData = doc.data();
        const uniqueKey = `${gradeData.testId}_${gradeData.attemptId}`;
        gradedAttemptIds.add(uniqueKey);
        gradesData[uniqueKey] = gradeData; 
    });

    let resultsCount = 0;
    let archivedCount = 0;

    resultsSnapshot.forEach(doc => {
        const data = doc.data();
        const uniqueKey = `${data.testId}_${data.attemptId}`;
        const profileImage = data.profileImage || "https://placehold.co/250x300";
        const rowHTML = `
            <td><img src="${profileImage}" alt="Profile" style="width: 50px; height: 50px;"></td>
            <td>${data.firstName}</td>
            <td>${data.lastName}</td>
            <td>${data.email}</td>
            <td>${data.score}</td>
            <td><input type="number" class="control-input form-control" min="0" max="50" value="0" data-email="${data.email}"></td>
            <td><span class="total-score" data-base-score="${data.score}">${data.score}</span></td>
            <td><span class="grade">${calculateGrade(data.score)}</span></td>
        `;
        const row = document.createElement("tr");
        row.dataset.attemptId = data.attemptId;
        row.dataset.testId = data.testId;
        row.innerHTML = rowHTML;

        if (gradedAttemptIds.has(uniqueKey)) {
            const gradeData = gradesData[uniqueKey];
            const archivedRowHTML = `
                <td><img src="${profileImage}" alt="Profile" style="width: 50px; height: 50px;"></td>
                <td>${gradeData.firstName}</td>
                <td>${gradeData.lastName}</td>
                <td>${gradeData.email}</td>
                <td>${gradeData.totalScore}</td>
                <td>${gradeData.currentControlValue}</td>
                <td>${gradeData.totalScore}</td>
                <td>${calculateGrade(gradeData.totalScore)}</td>
            `;
            const archivedRow = document.createElement("tr");
            archivedRow.innerHTML = archivedRowHTML;
            archivedTableBody.appendChild(archivedRow);
            archivedCount++;
        } else {
            resultsTableBody.appendChild(row);
            resultsCount++;
        }
    });

    if (resultsCount === 0) {
        resultsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">Няма опити от тестове, които чакат оценяване.</td>
            </tr>
        `;
    }

    if (archivedCount === 0) {
        archivedTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">Няма архивирани опити от тестове.</td>
            </tr>
        `;
    }

    attachInputListeners();
}


async function saveGrades() {
    const rows = document.querySelectorAll("#resultsTableBody tr");

    for (const row of rows) {
        const attemptId = row.dataset.attemptId;
        const testId = row.dataset.testId;
        const email = row.querySelector(".control-input").dataset.email;
        const firstName = row.cells[1].textContent;
        const lastName = row.cells[2].textContent;
        const totalScore = parseInt(row.querySelector(".total-score").textContent);
        const grade = row.querySelector(".grade span").textContent;
        const currentControlValue = parseInt(row.querySelector(".control-input").value) || 0;

        try {
            await addDoc(collection(db, "grades"), {
                attemptId,
                testId,
                email,
                firstName,
                lastName,
                totalScore,
                grade,
                currentControlValue,
            });
        } catch (error) {
            console.error("Грешка при записването на оценка:", error);
        }
    }

    loadResults();
}
document.getElementById('export').addEventListener('click', function () {
    const table = document.getElementById('resultsTableBody');
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "grades.xlsx");
});
document.getElementById("save").addEventListener("click", saveGrades);
loadResults();