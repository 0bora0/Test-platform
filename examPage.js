import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

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

let questions = [];
let answersHistory = []; // Масив за съхранение на отговорите
let currentQuestionIndex = 0;
let testDuration = 0;
let timerInterval;
let timeRemaining;
let correctAnswers = 0;
let totalQuestions = 0; // Инициализираме totalQuestions, след като въпросите се заредят
let startTime = Date.now();
const endTestButton = document.querySelector('.end-test');
const testSection = document.getElementById('test-section');
const postTestSection = document.getElementById('post-test-section');
const timeLeftElement = document.getElementById('timeLeft');
const correctAnswersElement = document.getElementById('correct-answers');
const testScoreElement = document.getElementById('test-score');
const totalTimeElement = document.getElementById('total-time');

// Функция за извличане на въпросите и информация за теста
async function loadQuestions() {
  console.log("📥 Опит за зареждане на въпросите...");

  try {
      const querySnapshot = await getDocs(collection(db, "tests"));

      querySnapshot.forEach((doc) => {
          console.log("✅ Получени данни от Firestore:", doc.data());
          if (doc.data().questions && Array.isArray(doc.data().questions)) {
              questions = doc.data().questions;
          }
          if (doc.data().testDuration) {
              testDuration = doc.data().testDuration * 60; // Времето за теста в секунди
          }
          
          // Проверяваме дали 'discipline' е обект или текст и го показваме
          if (doc.data().discipline) {
              const discipline = doc.data().discipline;
              if (typeof discipline === 'object' && discipline.name) {
                  document.getElementById("test-discipline").innerText = discipline.name;
              } else {
                  document.getElementById("test-discipline").innerText = discipline;
              }
          }
          
          // Показваме брой въпроси, ако има въпроси
          if (doc.data().questions && doc.data().questions.length) {
              document.getElementById("test-questions-count").innerText = doc.data().questions.length;
          }

          // Показваме времето за теста
          if (testDuration) {
              document.getElementById("test-duration").innerText = testDuration / 60; // Показваме времето в минути
          }
      });

      // Показваме секцията за теста само ако имаме въпроси
      if (questions.length > 0) {
          document.getElementById("pre-test-section").style.display = "block";
      } else {
          console.error("❌ Няма въпроси в теста.");
      }
  } catch (error) {
      console.error("❌ Грешка при зареждането на въпросите:", error);
  }
}



// Функция за започване на теста
document.getElementById("start-test-button").addEventListener("click", () => {
    document.getElementById("pre-test-section").style.display = "none"; // Скриваме секцията преди теста
    document.getElementById("test-section").style.display = "block"; // Показваме теста
    startTimer(); // Стартираме таймера
    renderQuestion(); // Показваме първия въпрос
    renderPagination(); // Генерираме бутоните за пагинация
});

// Функция за стартиране на таймера
function startTimer() {
    timeRemaining = testDuration;

    const timerDisplay = document.querySelector(".timer");

    if (!timerDisplay) {
        console.error("⚠️ Няма елемент за показване на таймера!");
        return;
    }

    timerInterval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert("Времето за теста е изтекло!");
            showResults(); // Показваме резултатите след изтичане на времето
        } else {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerDisplay.textContent = `Оставащо време: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
            timeRemaining--;
        }
    }, 1000);
}

// Функция за показване на резултатите
function showResults() {
    document.getElementById("test-section").style.display = "none"; // Скриваме секцията с теста
    document.getElementById("post-test-section").style.display = "block"; // Показваме резултатите

    // Показваме резултатите
    document.getElementById("total-time").innerText = (testDuration - timeRemaining) / 60; // Показваме време в минути
    document.getElementById("correct-answers").innerText = correctAnswers;
    document.getElementById("test-score").innerText = correctAnswers;
    document.getElementById("total-questions").innerText = questions.length;
}

// Функция за показване на текущия въпрос
function renderQuestion() {
  const questionContainer = document.querySelector(".question");
  const answersContainer = document.querySelector(".answers");
  
  if (!questions[currentQuestionIndex]) {
      console.error("⚠️ Няма въпрос с такъв индекс!");
      return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  questionContainer.innerHTML = currentQuestion.question;

  // Изчистваме контейнера ПРЕДИ да добавим новите отговори
  answersContainer.innerHTML = "";

  currentQuestion.options.forEach((option, index) => {
      const label = document.createElement("label");
      // Проверяваме дали отговорът е запазен за този въпрос
      const isChecked = answersHistory[currentQuestionIndex] === index;
      label.innerHTML = `<input type="radio" name="answer" value="${index}" ${isChecked ? "checked" : ""}> ${option}`;
      answersContainer.appendChild(label);
  });
}



// Навигация между въпросите
function saveAnswer() {
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');
  if (selectedAnswer) {
      answersHistory[currentQuestionIndex] = parseInt(selectedAnswer.value); // Запазваме отговора
  }
}

// Обработване на избор на отговор
document.querySelector(".answers").addEventListener("change", saveAnswer);

// Навигация между въпросите
// Навигация между въпросите
document.addEventListener("DOMContentLoaded", () => {
  // Намерете бутоните след като DOM е зареден
  const nextButton = document.querySelector(".btn-primary");
  const prevButton = document.querySelector(".btn-secondary");

  // Проверяваме дали бутоните са намерени
  if (nextButton && prevButton) {
      // Слушател за бутон "Следващ въпрос"
      nextButton.addEventListener("click", () => {
          saveAnswer(); // Записваме отговора преди да преминем към следващия въпрос

          if (currentQuestionIndex < questions.length - 1) {
              currentQuestionIndex++;
              renderQuestion(); // Обновяваме въпроса
              updatePagination(); // Обновяваме пагинацията
          } else {
              console.log("⚠️ Това е последният въпрос.");
              showResults(); // Ако сме на последния въпрос, показваме резултатите
          }
      });

      // Слушател за бутон "Предишен въпрос"
      prevButton.addEventListener("click", () => {
          saveAnswer(); // Записваме отговора преди да преминем към предишния въпрос

          console.log("Текущ въпрос:", currentQuestionIndex);
          console.log("Общ брой въпроси:", questions.length);

          // Проверяваме дали има предишен въпрос
          if (currentQuestionIndex > 0) {
              currentQuestionIndex--; // Преминаваме към предишния въпрос
              renderQuestion(); // Обновяваме въпроса
              updatePagination(); // Обновяваме пагинацията
          } else {

          }
      });
  
  
}
});



// Генериране на бутоните за пагинация
function renderPagination() {
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = "";

    questions.forEach((_, index) => {
        const pageButton = document.createElement("button");
        pageButton.classList.add("page-link");
        pageButton.textContent = index + 1;
        pageButton.addEventListener("click", () => {
            currentQuestionIndex = index;
            renderQuestion();
            updatePagination();
        });
        paginationContainer.appendChild(pageButton);
    });

    updatePagination();
}

// Обновяване на пагинацията
function updatePagination() {
    const paginationButtons = document.querySelectorAll(".pagination .page-link");

    paginationButtons.forEach((button, index) => {
        if (index === currentQuestionIndex) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

// Зареждаме въпросите при стартиране
loadQuestions();

// Обработване на натискане на бутона за приключване на теста
endTestButton.addEventListener('click', function() {
  // Изчисляваме времето за изпълнение
  const totalTime = Math.floor((Date.now() - startTime) / 1000 / 60); // В минути
  document.getElementById('total-time').textContent = totalTime; // Показваме изминалото време

  // Вземаме всички отговори от формата
  const answers = document.querySelectorAll('input[type="radio"]:checked');
  let correctAnswers = 0; // Нулираме броя на верните отговори

  // Преглеждаме отговорите на потребителя и ги сравняваме с правилните отговори от базата данни
  answers.forEach(answer => {
      // Вземаме стойността на name атрибута, която трябва да съвпада с уникалния идентификатор на въпроса
      const questionValue = answer.name; // Това трябва да е уникален идентификатор за всеки въпрос, например 'question1', 'question2' и т.н.

      // Намираме въпроса по този идентификатор от масива `questions`
      const question = questions.find(q => q.value === questionValue);

      // Логваме въпросите и отговорите, за да проверим дали съвпадат
      console.log('Въпрос:', question);  
      console.log('Отговор:', answer.value);  

      // Проверяваме дали въпросът съществува и дали отговорът на потребителя съвпада с правилния отговор
      if (question && answer.value === question.correctAnswer) {
          correctAnswers++; // Увеличаваме броя на верните отговори
      }
  });

  // Изчисляваме общия брой въпроси
  const totalQuestions = questions.length;

  // Обновяваме резултатите в HTML
  document.getElementById('correct-answers').textContent = correctAnswers; // Колко верни отговора има потребителя
  document.getElementById('test-score').textContent = `${correctAnswers} от ${totalQuestions}`; // Показваме резултата в общия контекст
  document.getElementById('total-time').textContent = totalTime; // Показваме времето
  document.getElementById('total-questions').textContent = totalQuestions; // Показваме общия брой въпроси

  // Преминаваме към секцията с резултати
  document.getElementById('test-section').style.display = 'none';
  document.getElementById('post-test-section').style.display = 'block';
});




