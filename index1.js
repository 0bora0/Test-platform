import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

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

let questions = [];
let currentQuestionIndex = 0;
let userEmail, userName, userProfilePic;
let selectedAnswers = {};
let timer;
const timerKey = "testTimer";
const testTakenKey = "testTaken"; // ✅ Ключ за проверка дали тестът е направен
let timeRemaining;

document.addEventListener("DOMContentLoaded", async () => {
    const startTestButton = document.getElementById("startTestButton");
    const testScreen = document.getElementById("test-screen");
    const startScreen = document.getElementById("start-screen");
    const questionContainer = document.getElementById("question-container");
    const optionsContainer = document.getElementById("options-container");
    const timerDisplay = document.getElementById("timerDisplay");
    const prevQuestionButton = document.getElementById("prevQuestionButton");
    const nextQuestionButton = document.getElementById("nextQuestionButton");
    const endTestButton = document.getElementById("endTestButton");
    const paginationContainer = document.getElementById("pagination");

    if (localStorage.getItem(testTakenKey) === "true") {
        startTestButton.disabled = true;
        startTestButton.textContent = "Тестът вече е направен";
        return;
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userEmail = user.email;
            userName = user.displayName || "Анонимен потребител";
            userProfilePic = user.photoURL || "https://placehold.co/80x80";

            const testsCollection = collection(db, "tests");
            const querySnapshot = await getDocs(testsCollection);

            let userTest = null;
            querySnapshot.forEach((doc) => {
                const testData = doc.data();
                if (testData.usersAllowed.includes(user.email)) {
                    userTest = testData;
                }
            });

            if (userTest) {
                questions = userTest.selectedQuestions || [];
                document.getElementById("displayQuestionCount").textContent = questions.length;
                document.getElementById("displayTestDuration").textContent = userTest.testDuration;

                const savedTime = localStorage.getItem(timerKey);
                timeRemaining = savedTime ? parseInt(savedTime) : userTest.testDuration * 60;

                startTestButton.addEventListener("click", startTest);
                
                prevQuestionButton.addEventListener("click", prevQuestion);
                nextQuestionButton.addEventListener("click", nextQuestion);
                endTestButton.addEventListener("click", endTest);
            } else {
                alert("Няма налични тестове за вас.");
            }
        } else {
            window.location.href = "login.html";
        }
    });

    function startTest() {
        if (localStorage.getItem(testTakenKey) === "true") {
            alert("Вече сте направили този тест.");
            return;
        }

        localStorage.setItem(testTakenKey, "true"); // ✅ Маркираме, че тестът е започнат
        startScreen.style.display = "none";
        testScreen.style.display = "block";
        createPagination();
        displayQuestion();
        startTimer();
    }

    function startTimer() {
        if (timer) return;

        updateTimerDisplay();

        timer = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                localStorage.setItem(timerKey, timeRemaining);
                updateTimerDisplay();
            } else {
                clearInterval(timer);
                endTest();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const min = Math.floor(timeRemaining / 60);
        const sec = timeRemaining % 60;
        timerDisplay.textContent = `${min}:${sec < 10 ? "0" : ""}${sec}`;
    }

    function displayQuestion() {
        if (currentQuestionIndex >= questions.length) {
            endTestButton.style.display = "block";
            return;
        }

        let questionData = questions[currentQuestionIndex];
        questionContainer.innerHTML = `<h4 class='text-start'>${questionData.question}</h4>`;
        optionsContainer.innerHTML = questionData.options.map((option, index) => `
            <div class='form-check'>
                <input class='form-check-input' type='radio' name='answer' id='option${index}' value='${option}' ${selectedAnswers[currentQuestionIndex] === option ? 'checked' : ''}>
                <label class='form-check-label' for='option${index}'>${option}</label>
            </div>
        `).join("");

        updatePagination();
        updateNavigationButtons();
    }

    async function endTest() {
        clearInterval(timer);
        localStorage.removeItem(timerKey);

        let correctAnswers = Object.keys(selectedAnswers).filter(index => selectedAnswers[index] === questions[index].correctAnswer).length;

        await addDoc(collection(db, "results"), {
            name: userName,
            email: userEmail,
            profilePic: userProfilePic,
            score: correctAnswers,
            totalQuestions: questions.length,
            selectedAnswers,
            timestamp: new Date()
        });

        alert("Тестът приключи! Резултатите са записани.");
        window.location.href = "#result-screen";
    }

    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    }

    function nextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
        }
    }

    function updatePagination() {
        paginationContainer.innerHTML = "";
        questions.forEach((_, index) => {
            const pageButton = document.createElement("button");
            pageButton.classList.add("btn", "btn-outline-primary", "mx-1", "mb-2");
            pageButton.textContent = index + 1;
            pageButton.addEventListener("click", () => {
                currentQuestionIndex = index;
                displayQuestion();
            });
            paginationContainer.appendChild(pageButton);
        });
    }

    function updateNavigationButtons() {
        prevQuestionButton.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
        nextQuestionButton.style.display = currentQuestionIndex < questions.length - 1 ? "inline-block" : "none";
        endTestButton.style.display = currentQuestionIndex === questions.length - 1 ? "inline-block" : "none"; 
    }
});
