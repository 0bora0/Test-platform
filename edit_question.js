import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
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

const questionsTableBody = document.getElementById("questionsTableBody");
const getQuestions = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "questions"));

        querySnapshot.forEach((doc) => {
            const questionData = doc.data();
            const questionId = doc.id;

            const questionRow = document.createElement("tr");
            questionRow.innerHTML = `
                    <td contenteditable="true" class="question-text">${questionData.question}</td>
                    ${questionData.options
                    .map(
                        (option, index) =>
                            `<td contenteditable="true" class="option" data-index="${index}">${option}</td>`
                    )
                    .join("")}
                    <td>
                        <select class="form-select correct-answer-select">
                            ${questionData.options
                    .map(
                        (option) =>
                            `<option value="${option}" ${option === questionData.correctAnswer
                                ? "selected"
                                : ""
                            }>${option}</option>`
                    )
                    .join("")}
                        </select>
                    </td>
                `;
            questionRow.setAttribute("data-id", questionId);
            questionsTableBody.appendChild(questionRow);

            const optionCells = questionRow.querySelectorAll(".option");
            optionCells.forEach((optionCell, index) => {
                optionCell.addEventListener("input", () => {
                    updateOptionsDropdown(questionRow);
                });
            });
        });
    } catch (error) {
        console.error("Грешка при извличането на въпросите: ", error);
    }
};
const updateOptionsDropdown = (questionRow) => {
    const options = Array.from(questionRow.querySelectorAll(".option")).map((optionCell) =>
        optionCell.textContent.trim()
    );
    const selectElement = questionRow.querySelector(".correct-answer-select");
    selectElement.innerHTML = options
        .map(
            (option) =>
                `<option value="${option}">${option}</option>`
        )
        .join("");
};
document.getElementById("save").addEventListener("click", async () => {
    let success = true;
    const rows = questionsTableBody.querySelectorAll("tr");
    for (let row of rows) {
        const questionId = row.getAttribute("data-id");
        const questionText = row.querySelector(".question-text").textContent.trim();
        const options = Array.from(row.querySelectorAll(".option")).map((optionCell) =>
            optionCell.textContent.trim()
        );
        const correctAnswer = row.querySelector(".correct-answer-select").value;

        try {
            await updateDoc(doc(db, "questions", questionId), {
                question: questionText,
                options: options,
                correctAnswer: correctAnswer,
            });
        } catch (error) {
            console.error("Грешка при актуализирането на въпроса: ", error);
            success = false;
        }
    }
    function showAlert(alertId) {
        const alertElement = document.getElementById(alertId);
        alertElement.style.display = "block";
        alertElement.classList.add("show");
        setTimeout(() => {
            alertElement.classList.remove("show");
            alertElement.style.display = "none";
        }, 3000);
    }
    if (success) {
        showAlert("successAlert");
    } else {
        showAlert("errorAlert");
    }
});
getQuestions();
