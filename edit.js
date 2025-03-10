import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, updateEmail, updatePassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
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
const getUserData = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            document.getElementById("firstName").value = userData.firstName || '';
            document.getElementById("lastName").value = userData.lastName || '';
            document.getElementById("username").value = userData.username || '';
            document.getElementById("email").value = userData.email || '';
        } else {
            console.log("Няма намерени данни за потребителя.");
        }
    } catch (error) {
        console.error("Грешка при зареждане на данни за потребителя: ", error);
    }
};
const updateUserData = async (data) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("Няма логнат потребител");
        }
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, data);
        console.log("Данните бяха успешно обновени в базата данни.");
        if (data.email && data.email !== user.email) {
            await updateEmail(user, data.email)
                .then(() => {
                    console.log("Имейлът беше обновен в Firebase.");
                    user.sendEmailVerification()
                        .then(() => {
                            console.log("Изпратен е верификационен имейл.");
                            document.getElementById("userName").textContent = data.email;
                        })
                        .catch((error) => {
                            console.error("Грешка при изпращане на верификационен имейл:", error);
                        });
                })
                .catch((error) => {
                    console.error("Грешка при актуализиране на имейл в Firebase:", error);
                });
        }
        if (data.password) {
            await updatePassword(user, data.password);
            console.log("Паролата беше обновена в Firebase.");
        }
        new bootstrap.Modal(document.getElementById("successModal")).show();
        const errorModal = document.getElementById("errorModal");
        if (errorModal.classList.contains("show")) {
            const modalInstance = bootstrap.Modal.getInstance(errorModal);
            modalInstance.hide();
        }

    } catch (error) {
        console.error("Грешка при обновяване на данните: ", error);
        new bootstrap.Modal(document.getElementById("errorModal")).show();
    }
};
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Логнат потребител:", user.email);
        getUserData(user.uid);
        document.getElementById("userName").textContent = user.email;
    } else {
        console.log("Потребителят не е влязъл в системата.");
        window.location.href = "login.html";
    }
});
document.getElementById("editProfileForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const updatedData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value 
    };
    updateUserData(updatedData);
});
