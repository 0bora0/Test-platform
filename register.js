import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqOBkhYePT5u2O_1xPiMFPo0TakvT2PA8",
  authDomain: "testcenter-2025feb.firebaseapp.com",
  projectId: "testcenter-2025feb",
  storageBucket: "testcenter-2025feb.firebasestorage.app",
  messagingSenderId: "855126302941",
  appId: "1:855126302941:web:15f3ab817a4a8cad3c3b34",
  measurementId: "G-LKR8SRFFWR"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const profilePictureInput = document.getElementById('profilePicture');
const profilePreview = document.getElementById('profilePreview');
let profilePicBase64 = "";

// Визуализация на качената снимка и конвертиране в Base64
profilePictureInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profilePreview.src = e.target.result;
            profilePicBase64 = e.target.result; // Запазване на Base64
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('registrationForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    await setDoc(doc(db, "users", userId), {
      firstName,
      lastName,
      username,
      email,
      role,
      profilePic: profilePicBase64 // Запазване на снимката като Base64
    });

    document.getElementById('registrationForm').reset();
    profilePreview.src = "https://via.placeholder.com/100"; // Нулиране на снимката

    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
  } catch (error) {
    console.error('Error during registration:', error);
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
  }
});
