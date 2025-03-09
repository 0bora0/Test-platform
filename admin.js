import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async function () {
    const usersTableBody = document.getElementById("usersTableBody");

    if (!usersTableBody) {
        console.error("❌ usersTableBody не е намерен!");
        return;
    }

    // 🔥 Firebase конфигурация
    const firebaseConfig = {
        apiKey: "AIzaSyCR-nsO0Eibf9Fmba6zp0IeyNTiZ1YTNHQ",
        authDomain: "testcenter-2025.firebaseapp.com",
        projectId: "testcenter-2025",
        storageBucket: "testcenter-2025.appspot.com",
        messagingSenderId: "446759343746",
        appId: "1:446759343746:web:9025b482329802cc34069b",
        measurementId: "G-0K3X6WSL09"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // ✅ Наблюдение на активните тестове
    const activeTestsRef = collection(db, "activeTests");
    onSnapshot(activeTestsRef, (snapshot) => {
        usersTableBody.innerHTML = ""; // Изчистваме таблицата

        snapshot.docs.forEach(docSnapshot => {
            const data = docSnapshot.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><img src="${data.profilePicture || 'https://placehold.co/40x40'}" class="rounded-circle" width="40"></td>
                <td>${data.firstName || 'Неизвестно'}</td>
                <td>${data.lastName || 'Неизвестно'}</td>
                <td>${data.discipline || 'Неизвестно'}</td>
                <td>${data.totalQuestions || 0}</td>
                <td id="timer-${docSnapshot.id}">${formatTime(data.remainingTime)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="toggleTest('${docSnapshot.id}', ${data.isPaused})">
                        <i class="bi ${data.isPaused ? 'bi-play-circle' : 'bi-stop-circle'}"></i>
                    </button>
                    <input type="number" id="add-time-${docSnapshot.id}" class="form-control form-control-sm d-inline w-25" placeholder="Минути">
                    <button class="btn btn-success btn-sm" onclick="addTime('${docSnapshot.id}')">
                        <i class="bi bi-plus-circle"></i>
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="reviewTest('${docSnapshot.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    });

    // ⏳ Форматиране на време (секунди -> минути:секунди)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // 🛑 Стартиране / Спиране на теста
    window.toggleTest = async function (userId, isPaused) {
        const userDocRef = doc(db, "activeTests", userId);
        await updateDoc(userDocRef, { isPaused: !isPaused });
        alert(isPaused ? "✅ Тестът е стартиран!" : "⛔ Тестът е спрян!");
    };

    // ⏳ Добавяне на време
    window.addTime = async function (userId) {
        const inputElement = document.getElementById(`add-time-${userId}`);
        const minutes = parseInt(inputElement.value, 10);

        if (isNaN(minutes) || minutes <= 0) {
            alert("⚠️ Въведете валидно време в минути!");
            return;
        }

        const userDocRef = doc(db, "activeTests", userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const newTime = userData.remainingTime + minutes * 60;

            await updateDoc(userDocRef, { remainingTime: newTime });
            alert(`✅ Добавени ${minutes} минути.`);
        }
    };

    // 📑 Преглед на теста
    window.reviewTest = async function (userId) {
        const testRef = doc(db, "results", userId);
        const testSnap = await getDoc(testRef);

        if (testSnap.exists()) {
            const data = testSnap.data();
            let resultText = `📊 Резултат: ${data.score}/${data.totalQuestions}\n\n`;

            data.answers.forEach((answer, index) => {
                resultText += `🔹 Въпрос ${index + 1}: ${answer.question}\n`;
                resultText += `✅ Верен отговор: ${answer.correctAnswer}\n`;
                resultText += `❓ Избран отговор: ${answer.selectedAnswer || "Не е отговорено"}\n\n`;
            });

            alert(resultText);
        } else {
            alert("⚠️ Няма намерен тест за този потребител.");
        }
    };
});
