// Импорт на Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, doc, getDoc, collection,getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Конфигурация за Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
    authDomain: "testcenter-2025.firebaseapp.com",
    projectId: "testcenter-2025",
    storageBucket: "testcenter-2025.appspot.com",
    messagingSenderId: "446759343746",
    appId: "1:446759343746:web:9025b482329802cc34069b",
    measurementId: "G-0K3X6WSL09"
};

// Инициализиране на Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Функция за зареждане на теста от Firestore
async function loadTest(testId) {
    try {
      console.log("Тест ID: ", testId); // Логване на тест ID-то
  
      const testDoc = await getDoc(doc(db, "tests", testId));
      console.log(testDoc.exists(), testDoc.data()); // Логване на резултатите
  
      if (testDoc.exists()) {
        const testData = testDoc.data();
        const questions = testData.questions;
        const questionCount = questions.length;
  
        // Обновяване на заглавието и въпросите
        document.querySelector('.header h4').textContent = testData.name;
        updatePagination(questionCount);
  
        loadQuestion(0, questions);
      } else {
        console.error("Тестът не беше намерен!");
      }
    } catch (error) {
      console.error("Грешка при зареждане на теста: ", error);
    }
  }
  const testsCollection = collection(db, "tests");
  const testSnapshot = await getDocs(testsCollection);
  testSnapshot.forEach(doc => {
    console.log(doc.id, " => ", doc.data());
  });
    
  
  

// Функция за зареждане на въпросите
function loadQuestion(index, questions) {
  const questionData = questions[index];
  
  document.querySelector('.question').textContent = questionData.question;
  
  const answersContainer = document.querySelector('.answers');
  answersContainer.innerHTML = '';
  
  questionData.options.forEach((option, i) => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="answer" value="${i}"> ${option}`;
    answersContainer.appendChild(label);
  });
  
  updateNavigation(index, questions.length);
}

// Функция за обновяване на навигацията
function updateNavigation(currentIndex, totalQuestions) {
  const prevButton = document.querySelector('.btn-secondary');
  const nextButton = document.querySelector('.btn-primary');

  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === totalQuestions - 1;
  
  prevButton.onclick = () => loadQuestion(currentIndex - 1, questions);
  nextButton.onclick = () => loadQuestion(currentIndex + 1, questions);
}

// Функция за обновяване на пагинацията
function updatePagination(questionCount) {
  const paginationContainer = document.querySelector('.pagination');
  paginationContainer.innerHTML = '';
  
  for (let i = 1; i <= questionCount; i++) {
    const pageItem = document.createElement('li');
    pageItem.classList.add('page-item');
    
    const pageLink = document.createElement('button');
    pageLink.classList.add('page-link');
    pageLink.textContent = i;
    pageLink.onclick = () => loadQuestion(i - 1, questions);
    
    pageItem.appendChild(pageLink);
    paginationContainer.appendChild(pageItem);
  }
}

// Стартиране на теста при зареждане на страницата
document.addEventListener('DOMContentLoaded', function() {
  const testId = "AwASKzd6jcEBlURio21f"; // Примерен testId
  loadTest(testId);
});
