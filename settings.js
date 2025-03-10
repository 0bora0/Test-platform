import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc,query,where } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

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

// Форма за настройки на теста
const userSelect = document.getElementById("userSelect");
const addUserButton = document.getElementById("addUser");
const allowedUsersList = document.getElementById("allowedUsersList");
const questionSelect = document.getElementById("questionSelect");
const addQuestionButton = document.getElementById("addQuestion");
const selectedQuestionsList = document.getElementById("selectedQuestionsList");

document.addEventListener("DOMContentLoaded", () => {
    const disciplineSelect = document.getElementById("course"); 
    const userSelect = document.getElementById("userSelect");

    if (!disciplineSelect || !userSelect) {
        console.error("❌ Грешка: Елементите не са намерени в DOM!");
        return;
    }

    disciplineSelect.addEventListener("change", loadUsers);
});

async function loadUsers() {
    const disciplineSelect = document.getElementById("course");
    const userSelect = document.getElementById("userSelect");

    if (!disciplineSelect || !userSelect) {
        console.error("❌ Грешка: Елементите не са намерени!");
        return;
    }

    const selectedDiscipline = disciplineSelect.value.trim();

    if (!selectedDiscipline) {
        userSelect.innerHTML = '<option value="">Моля, изберете дисциплина...</option>';
        return;
    }

    try {
        userSelect.innerHTML = '<option value="">Зареждам потребителите...</option>';

        // 🔹 Търсим курса в `courses`, който съдържа дисциплината
        const coursesCollection = collection(db, "courses");
        const courseQuery = query(coursesCollection, where("disciplineName", "==", selectedDiscipline));
        const courseSnapshot = await getDocs(courseQuery);

        if (courseSnapshot.empty) {
            userSelect.innerHTML = '<option disabled>Няма записани потребители за тази дисциплина</option>';
            return;
        }

        let userEmails = new Set(); // Събира имейлите на студентите
        courseSnapshot.forEach((doc) => {
            const courseData = doc.data();
            if (courseData.students && Array.isArray(courseData.students)) {
                courseData.students.forEach(student => userEmails.add(student.email));
            }
        });

        if (userEmails.size === 0) {
            userSelect.innerHTML = '<option disabled>Няма записани потребители за тази дисциплина</option>';
            return;
        }

        // 🔹 Взимаме потребителите от `users`, които имат съответните имейли
        const usersCollection = collection(db, "users");
        const usersQuery = query(usersCollection, where("email", "in", Array.from(userEmails)));

        const usersSnapshot = await getDocs(usersQuery);
        userSelect.innerHTML = '<option value="">Избери потребител...</option>';
        let foundUsers = 0;

        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            foundUsers++;

            const option = document.createElement("option");
            option.value = JSON.stringify({ id: doc.id, ...userData });
            option.textContent = `${userData.firstName || "Неизвестно"} ${userData.lastName || ""} (${userData.email})`;
            userSelect.appendChild(option);
        });

        if (foundUsers === 0) {
            userSelect.innerHTML += '<option disabled>Няма потребители за тази дисциплина</option>';
        }

        console.log(`✅ Заредени са ${foundUsers} потребители за дисциплината: ${selectedDiscipline}`);
    } catch (error) {
        console.error("❌ Грешка при зареждане на потребителите:", error);
        userSelect.innerHTML = '<option disabled>Грешка при зареждане на потребителите</option>';
    }
}

// ✅ Когато се избере дисциплина, зареждаме потребителите
document.getElementById("course").addEventListener("change", loadUsers);

document.getElementById("addUser").addEventListener("click", () => {
    const userSelect = document.getElementById("userSelect");
    const selectedOption = userSelect.options[userSelect.selectedIndex]; // ✅ Взима избрания потребител правилно

    if (!selectedOption || !selectedOption.value) {
        console.error("❌ Грешка: Няма избран потребител!");
        alert("❌ Моля, изберете потребител преди да добавите!");
        return;
    }

    addUserToList(selectedOption);
});
function addUserToList(selectedOption) {
    if (!selectedOption || !selectedOption.value) {
        console.error("❌ Грешка: `selectedOption.value` е undefined или празно.");
        return;
    }

    try {
        console.log("📥 Стойност на избрания потребител:", selectedOption.value);

        const userData = JSON.parse(selectedOption.value); // 🚀 Декодира JSON

        console.log("✅ Декодиран JSON:", userData);

        if (!userData.email) {
            console.error("❌ Грешка: Липсва `email` в данните!");
            return;
        }

        if ([...allowedUsersList.children].some(li => li.dataset.email === userData.email)) {
            alert("⚠️ Този потребител вече е добавен!");
            return;
        }

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.dataset.email = userData.email;
        li.textContent = `${userData.firstName || "Неизвестно"} ${userData.lastName || ""} (${userData.email})`;

        const removeButton = document.createElement("button");
        removeButton.className = "btn btn-danger btn-sm";
        removeButton.innerHTML = `<i class="bi bi-trash"></i>`;
        removeButton.onclick = function () { li.remove(); };

        li.appendChild(removeButton);
        allowedUsersList.appendChild(li);

        console.log("✅ Потребителят е добавен:", userData);
    } catch (error) {
        console.error("❌ Грешка при парсване на JSON:", error);
        alert("❌ Грешка при избора на потребител! Проверете конзолата за повече информация.");
    }
}

async function loadQuestionBanks() {
    const disciplineSelect = document.getElementById("course"); // 📌 Селекция на дисциплина
    const questionBankSelect = document.getElementById("questionBank"); // 📌 Списък с банки с въпроси

    if (!disciplineSelect || !questionBankSelect) {
        console.error("❌ Грешка: Липсва селект елемент!");
        return;
    }

    const selectedDiscipline = disciplineSelect.value.trim();

    if (!selectedDiscipline) {
        questionBankSelect.innerHTML = '<option value="">--Избери банка с въпроси--</option>';
        return;
    }

    try {
        questionBankSelect.innerHTML = '<option value="">Зареждам банки с въпроси...</option>';

        // 📌 Търсим в `courses`, за да намерим банките с въпроси за избраната дисциплина
        const coursesCollection = collection(db, "courses");
        const courseQuery = query(coursesCollection, where("disciplineName", "==", selectedDiscipline));
        const courseSnapshot = await getDocs(courseQuery);
        if (courseSnapshot.empty) {
            questionBankSelect.innerHTML = '<option disabled>❌ Няма банки с въпроси за тази дисциплина</option>';
            return;
        }

        let foundBanks = 0;
        questionBankSelect.innerHTML = '<option value="">--Избери банка с въпроси--</option>';

        courseSnapshot.forEach((doc) => {
            const courseData = doc.data();
            if (courseData.questionBanks && Array.isArray(courseData.questionBanks)) {
                courseData.questionBanks.forEach((bank, index) => {
                    foundBanks++;
                    const option = document.createElement("option");
                    option.value = bank.name; // Можеш да запазиш ID, ако имаш нужда
                    option.textContent = bank.name;
                    questionBankSelect.appendChild(option);
                });
            }
        });

        if (foundBanks === 0) {
            questionBankSelect.innerHTML += '<option disabled>❌ Няма банки с въпроси за тази дисциплина</option>';
        }
    } catch (error) {
        console.error("❌ Грешка при зареждане на банките с въпроси:", error);
        questionBankSelect.innerHTML = '<option disabled>❌ Грешка при зареждане</option>';
    }
}

// ✅ Автоматично зареждане при промяна на дисциплината
document.getElementById("course").addEventListener("change", loadQuestionBanks);


// ✅ Автоматично зареждане при промяна на дисциплината
document.getElementById("course").addEventListener("change", loadQuestionBanks);

async function loadQuestions() {
    // 📌 Взимаме дисциплината и банката с въпроси от селектите
    const disciplineSelect = document.getElementById("course");
    const questionBankSelect = document.getElementById("questionBank");
    const questionSelect = document.getElementById("questionSelect");

    // 🛑 Проверяваме дали всички елементи съществуват
    if (!disciplineSelect || !questionBankSelect || !questionSelect) {
        console.error("❌ Грешка: Липсва селект елемент! Увери се, че `course`, `questionBank` и `questionSelect` съществуват в DOM.");
        return;
    }

    const selectedDiscipline = disciplineSelect.value.trim();
    const selectedBank = questionBankSelect.value.trim();

    // 🛑 Ако не са избрани дисциплина и банка → спираме
    if (!selectedDiscipline || !selectedBank) {
        questionSelect.innerHTML = '<option value="">--Избери въпрос--</option>';
        return;
    }

    try {
        questionSelect.innerHTML = '<option value="">Зареждам въпросите...</option>';

        // 📌 Търсим курса в `courses`, за да вземем въпросите от избраната банка
        const coursesCollection = collection(db, "courses");
        const courseQuery = query(coursesCollection, where("disciplineName", "==", selectedDiscipline));
        const courseSnapshot = await getDocs(courseQuery);

        if (courseSnapshot.empty) {
            questionSelect.innerHTML = '<option disabled>❌ Няма въпроси за тази дисциплина</option>';
            return;
        }

        let foundQuestions = 0;
        questionSelect.innerHTML = '<option value="">--Избери въпрос--</option>';

        // 🔎 Обхождаме курсовете и намираме въпросите от избраната банка
        courseSnapshot.forEach((doc) => {
            const courseData = doc.data();
            if (courseData.questionBanks && Array.isArray(courseData.questionBanks)) {
                const selectedQuestionBank = courseData.questionBanks.find(bank => bank.name === selectedBank);

                if (selectedQuestionBank && selectedQuestionBank.questions && Array.isArray(selectedQuestionBank.questions)) {
                    selectedQuestionBank.questions.forEach((question, index) => {
                        console.log(`🟢 Въпрос #${index + 1}:`, question);
                        foundQuestions++;
                        const option = document.createElement("option");
                        option.value = JSON.stringify(question);
                        option.textContent = question.question;
                        questionSelect.appendChild(option);
                    });
                }
            }
        });

        if (foundQuestions === 0) {
            questionSelect.innerHTML += '<option disabled>❌ Няма въпроси в тази банка</option>';
        }

    } catch (error) {
        console.error("❌ Грешка при зареждане на въпросите:", error);
        questionSelect.innerHTML = '<option disabled>❌ Грешка при зареждане</option>';
    }
}

// ✅ Зареждаме въпросите при промяна на банката с въпроси
document.addEventListener("DOMContentLoaded", () => {
    const questionBankSelect = document.getElementById("questionBank");
    if (questionBankSelect) {
        questionBankSelect.addEventListener("change", loadQuestions);
    } else {
        console.error("❌ Грешка: `questionBank` не е намерен в DOM!");
    }
});


// Функция за добавяне на въпрос към акордеона (ръчно и лотариен принцип)
function addQuestionToList(selectedOption) {
    if (!selectedOption) {
        console.warn("⚠️ Липсва въпрос за добавяне.");
        return;
    }

    const questionData = JSON.parse(selectedOption);

    // Проверка дали контейнерът за въпроси съществува
    const selectedQuestionsList = document.getElementById("selectedQuestionsList");
    if (!selectedQuestionsList) {
        console.error("❌ Грешка: Липсва контейнерът 'selectedQuestionsList' в DOM.");
        return;
    }

    // Проверка дали въпросът вече е добавен
    if ([...selectedQuestionsList.children].some(div => div.dataset.id === questionData.id)) {
        alert("⚠️ Този въпрос вече е добавен!");
        return;
    }

    // Проверка дали въпросът има налични опции
    if (!Array.isArray(questionData.options) || questionData.options.length === 0) {
        console.error(`❌ Грешка: Въпросът "${questionData.question}" няма валидни опции.`);
        alert(`⚠️ Въпросът "${questionData.question}" няма налични отговори.`);
        return;
    }

    // Създаване на акордеон за въпроса
    const questionId = `question-${questionData.id}`;
    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";
    accordionItem.dataset.id = questionData.id; // Запазваме ID, за да избегнем дублиране
    accordionItem.innerHTML = `
       <h2 class="accordion-header" id="heading-${questionId}">
            <button class="accordion-button collapsed fw-bold text-dark bg-white border-bottom" 
                type="button" data-bs-toggle="collapse" 
                data-bs-target="#collapse-${questionId}" 
                aria-expanded="false" aria-controls="collapse-${questionId}">
                ${questionData.question}
            </button>
        </h2>
        <div id="collapse-${questionId}" class="accordion-collapse collapse" 
            aria-labelledby="heading-${questionId}" data-bs-parent="#selectedQuestionsList">
            <div class="accordion-body bg-white">
                <ul class="list-group list-group-flush">
                    ${questionData.options.map(option => 
                        `<li class="list-group-item">${option}</li>`).join("")}
                </ul>
     <p class="mt-2 fw-bold"><i class="bi bi-check-circle text-success"></i><span class="fw-bold text-success"> Верен отговор:</span> ${questionData.correctAnswer}</p>
                <button class="btn btn-outline-danger btn-sm remove-question mt-2"><i class="bi bi-trash"></i> Премахни</button>
            </div>
        </div>
    `;

    // Добавяне на бутон за премахване на въпроса
    accordionItem.querySelector(".remove-question").addEventListener("click", function () {
        accordionItem.remove();
    });

    selectedQuestionsList.appendChild(accordionItem);
}

// Функция за избор на въпроси на случаен принцип (лотариен принцип)
async function saveTestSettings() {
    const questionCount = document.getElementById("questionCount").value;
    const testDuration = document.getElementById("testDuration").value;
    const passingScore = document.getElementById("passingScore").value;

    const users = Array.from(document.getElementById("allowedUsersList").children).map(li => li.dataset.email);
    const selectedQuestionsList = document.getElementById("selectedQuestionsList");

    if (!selectedQuestionsList) {
        console.error("❌ Контейнерът за избрани въпроси липсва!");
        alert("❌ Грешка: Контейнерът за въпроси не е намерен.");
        return;
    }

    const selectedQuestions = Array.from(selectedQuestionsList.children).map(li => {
        const questionText = li.querySelector(".accordion-button")?.textContent.trim() || "Неизвестен въпрос";
        const options = Array.from(li.querySelectorAll(".accordion-body .list-group-item")).map(opt => opt.textContent);
        const correctAnswerElem = li.querySelector(".accordion-body p strong");
        const correctAnswer = correctAnswerElem ? correctAnswerElem.nextSibling.nodeValue.trim() : "Неизвестен отговор";

        return {
            id: li.dataset.id,
            question: questionText,
            options: options,
            correctAnswer: correctAnswer
        };
    });

    if (!questionCount || !testDuration || !passingScore || users.length === 0 || selectedQuestions.length === 0) {
        alert("⚠️ Моля, попълнете всички полета и изберете въпроси и потребители!");
        return;
    }

    try {
        const testCollection = collection(db, "tests");

        await addDoc(testCollection, {
            questionCount: parseInt(questionCount),
            testDuration: parseInt(testDuration),
            passingScore: parseInt(passingScore),
            usersAllowed: users,
            selectedQuestions: selectedQuestions,
            createdAt: new Date().toISOString()
        });

        alert("✅ Тестът е запазен успешно в базата данни!");

        document.getElementById("test-settings-form").reset();
        document.getElementById("allowedUsersList").innerHTML = "";
        document.getElementById("selectedQuestionsList").innerHTML = "";
    } catch (error) {
        console.error("❌ Грешка при запазване на теста:", error);
        alert("❌ Грешка при запазване на теста. Опитайте отново!");
    }
}


document.addEventListener("DOMContentLoaded", function () {
    loadUsers();
    loadQuestions();
    addUserButton.addEventListener("click", function () {
        const selectedOption = userSelect.value;
        if (selectedOption) { addUserToList(selectedOption); }
    });
    addQuestionButton.addEventListener("click", function () {
        const selectedOption = questionSelect.options[questionSelect.selectedIndex];
        if (selectedOption.value) {
            addQuestionToList(selectedOption.value);
        }
    });
    document.getElementById("test-settings-form").addEventListener("submit", function (event) {
        event.preventDefault();
        saveTestSettings();
    });
});
let questions = []; // Дефиниране на масива глобално
document.getElementById("randomQuestions").addEventListener("click", async () => {
    const numQuestions = parseInt(document.getElementById("questionCount").value);
    if (isNaN(numQuestions) || numQuestions <= 0) {
        alert("Моля, въведете валиден брой въпроси!");
        return;
    }

    try {
        const questionsCollection = collection(db, "questions");
        const querySnapshot = await getDocs(questionsCollection);
        let allQuestions = [];

        querySnapshot.forEach((doc) => {
            allQuestions.push({ id: doc.id, ...doc.data() });
        });

        if (allQuestions.length === 0) {
            alert("❌ Няма налични въпроси в базата данни!");
            return;
        }

        // Разбъркване на въпросите и избор на numQuestions въпроса
        let selectedQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, numQuestions);

        if (selectedQuestions.length < numQuestions) {
            alert(`⚠️ Няма достатъчно въпроси! Избрани са само ${selectedQuestions.length}.`);
        }

        selectedQuestions.forEach(q => addQuestionToAccordion(q)); // Добавяме ги към съществуващия акордеон

    } catch (error) {
        console.error("🔴 Грешка при зареждане на въпросите:", error);
        alert("❌ Грешка при извличане на въпросите от базата данни!");
    }
});


// Функция за актуализиране на интерфейса с избраните въпроси като акордеон
function addQuestionToAccordion(questionData) {
    const selectedQuestionsList = document.getElementById("selectedQuestionsList");
    if (!selectedQuestionsList) {
        console.error("❌ Грешка: Липсва контейнерът 'selectedQuestionsList' в DOM.");
        return;
    }

    // Проверка дали въпросът вече е добавен
    if ([...selectedQuestionsList.children].some(div => div.dataset.id === questionData.id)) {
        console.warn(`⚠️ Въпросът "${questionData.question}" вече е добавен!`);
        return;
    }

    // Проверка за налични опции
    if (!Array.isArray(questionData.options) || questionData.options.length === 0) {
        console.error(`❌ Грешка: Въпросът "${questionData.question}" няма валидни опции.`);
        alert(`⚠️ Въпросът "${questionData.question}" няма налични отговори.`);
        return;
    }

    // Създаване на уникален ID за въпроса
    const questionId = `question-${questionData.id}`;

    // Създаване на акордеон елемент със стилове
    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item border rounded mb-2";
    accordionItem.dataset.id = questionData.id;
    accordionItem.innerHTML = `
        <h2 class="accordion-header" id="heading-${questionId}">
            <button class="accordion-button collapsed fw-bold text-dark bg-white border-bottom" 
                type="button" data-bs-toggle="collapse" 
                data-bs-target="#collapse-${questionId}" 
                aria-expanded="false" aria-controls="collapse-${questionId}">
                ${questionData.question}
            </button>
        </h2>
        <div id="collapse-${questionId}" class="accordion-collapse collapse" 
            aria-labelledby="heading-${questionId}" data-bs-parent="#selectedQuestionsList">
            <div class="accordion-body bg-white">
                <ul class="list-group list-group-flush">
                    ${questionData.options.map(option => 
                        `<li class="list-group-item">${option}</li>`).join("")}
                </ul>
                <p class="mt-2 fw-bold"><i class="bi bi-check-circle text-success"></i><span class="fw-bold text-success"> Верен отговор:</span> ${questionData.correctAnswer}</p>
                <button class="btn btn-outline-danger btn-sm remove-question mt-2"><i class="bi bi-trash"></i> Премахни</button>
            </div>
        </div>
    `;

    // Добавяне на бутон за премахване
    accordionItem.querySelector(".remove-question").addEventListener("click", function () {
        accordionItem.remove();
    });

    selectedQuestionsList.appendChild(accordionItem);
}

async function loadDisciplines() {
    const disciplineSelect = document.getElementById("course"); // Падащо меню с дисциплините

    if (!disciplineSelect) {
        console.error("❌ Грешка: Не е намерен елемент с ID 'course' в DOM!");
        return;
    }

    disciplineSelect.innerHTML = '<option value="">Зареждам дисциплините...</option>';

    try {
        const coursesCollection = collection(db, "courses");
        const querySnapshot = await getDocs(coursesCollection);

        disciplineSelect.innerHTML = '<option value="">--Избери дисциплина--</option>';
        let foundDisciplines = 0;

        querySnapshot.forEach((doc) => {
            const courseData = doc.data();

            // ✅ Важно! Сега записваме **disciplineName**, а не document ID
            const option = document.createElement("option");
            option.value = courseData.disciplineName; // 🔹 Запазваме името на дисциплината
            option.textContent = `${courseData.disciplineName} (Курс ${courseData.course})`;
            disciplineSelect.appendChild(option);

            foundDisciplines++;
        });

        console.log(`✅ Заредени са ${foundDisciplines} дисциплини.`);
    } catch (error) {
        console.error("❌ Грешка при зареждане на дисциплините:", error);
        disciplineSelect.innerHTML = '<option disabled>Грешка при зареждане</option>';
    }
}

// ✅ Зареждаме дисциплините при стартиране
document.addEventListener("DOMContentLoaded", loadDisciplines);
