import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
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
const auth = getAuth();
const db = getFirestore(app);

let testData = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let timer;
let startTime;

const startScreen = document.getElementById("start-screen");
const testScreen = document.getElementById("test-screen");
const endScreen = document.getElementById("end-screen");
const questionElement = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const finalScoreElement = document.getElementById("final-score");
const paginationContainer = document.getElementById("pagination");
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
// Стартиране на теста
async function loadTest() {
    const testId = localStorage.getItem("testId");
    if (!testId) {
        alert("Няма избран тест!");
        return;
    }

    try {
        const testDoc = await getDoc(doc(db, "tests", testId));
        if (!testDoc.exists()) {
            alert("Грешка при зареждане на теста!");
            return;
        }
        testData = testDoc.data();
        showTestDetails();
    } catch (error) {
        console.error("Грешка при зареждане на теста:", error);
    }
}

document.getElementById("start").addEventListener("click", function () {
    startScreen.style.display = "none";
    testScreen.style.display = "block";
    startTimer(testData.testDuration);
    showQuestion();
});

function startTimer(minutes) {
    const endTime = Date.now() + minutes * 60000;
    startTime = Date.now();

    timer = setInterval(() => {
        const remainingTime = Math.max(0, endTime - Date.now());
        document.getElementById("timer").textContent = `Оставащо време: ${Math.ceil(remainingTime / 60000)} мин.`;
        if (remainingTime <= 0) {
            clearInterval(timer);
            submitTest();
        }
    }, 1000);
}

function showQuestion() {
    const question = testData.selectedQuestions[currentQuestionIndex];
    questionElement.textContent = question.text;
    optionsContainer.innerHTML = "";

    question.options.forEach((option, index) => {
        const isChecked = userAnswers[currentQuestionIndex] === index ? "checked" : "";
        optionsContainer.innerHTML += `
            <div>
                <input type="radio" name="answer" value="${index}" id="option${index}" ${isChecked}>
                <label for="option${index}">${option}</label>
            </div>
        `;
    });
    updatePagination();
}

document.getElementById("next").addEventListener("click", function () {
    saveAnswer();
    if (currentQuestionIndex < testData.selectedQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
});

document.getElementById("prev").addEventListener("click", function () {
    saveAnswer();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
});

document.getElementById("end-test").addEventListener("click", function () {
    submitTest();
});

function saveAnswer() {
    const selectedOption = document.querySelector("input[name='answer']:checked");
    if (selectedOption) {
        userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    }
}

async function submitTest() {
    clearInterval(timer);
    const testId = localStorage.getItem("testId");
    let correctAnswers = 0;

    testData.selectedQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            correctAnswers++;
        }
    });

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const finalScore = (correctAnswers / testData.selectedQuestions.length) * testData.maxScore;

    await setDoc(doc(db, "results", testId + "_" + auth.currentUser.uid), {
        userId: auth.currentUser.uid,
        testId: testId,
        correctAnswers,
        totalQuestions: testData.selectedQuestions.length,
        score: finalScore.toFixed(2),
        timeTaken,
        date: new Date().toISOString()
    });

    testScreen.style.display = "none";
    endScreen.style.display = "block";
    finalScoreElement.textContent = `Верни отговори: ${correctAnswers} от ${testData.selectedQuestions.length} | Оценка: ${finalScore.toFixed(2)} / ${testData.maxScore}`;
}

document.addEventListener("DOMContentLoaded", loadTest);

function updatePagination() {
    paginationContainer.innerHTML = "";
    testData.selectedQuestions.forEach((_, index) => {
        const pageButton = document.createElement("button");
        pageButton.className = `btn btn-sm ${index === currentQuestionIndex ? "btn-primary" : "btn-outline-secondary"}`;
        pageButton.textContent = index + 1;
        pageButton.addEventListener("click", function () {
            saveAnswer();
            currentQuestionIndex = index;
            showQuestion();
        });
        paginationContainer.appendChild(pageButton);
    });
}