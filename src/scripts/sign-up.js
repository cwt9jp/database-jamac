import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDStaGeZHAUMDsO-zkUSkibpboZLwwMMs8",
  authDomain: "database-jamac.firebaseapp.com",
  projectId: "database-jamac",
  storageBucket: "database-jamac.firebasestorage.app",
  messagingSenderId: "843623851966",
  appId: "1:843623851966:web:2b744a670449690a653bef",
  measurementId: "G-31ZH10YNF1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Email validation
const emailInput = document.getElementById("email");
const initialPassword = document.getElementById("password-initial");
const finalPassword = document.getElementById("password-final");
const signUp = document.getElementById("submit");
const error = document.getElementById("error-message");

const emailRegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;


signUp.addEventListener("click", () => {
    if (emailInput.value.length != 0 && emailRegExp.test(emailInput.value)) {
        error.textContent = "";
    }
    else {
        emailInput.focus();
        error.textContent = "Please enter a valid email address";
        return;
    }

    if (initialPassword.value.length >= 6 && initialPassword.value.length <= 4096) {
        error.textContent = '';
    }
    else {
        initialPassword.focus();
        error.textContent = 'Password must be at least 6 characters';
        return;
    }

    if (finalPassword.value === initialPassword.value) {
        error.textContent = '';
    }
    else {
        finalPassword.focus();
        error.textContent = "Passwords do not match";
        return;
    }

    // Send email to Firebase
    const auth = getAuth();
    const email = emailInput.value;
    const password = initialPassword.value;

    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        window.location.href = '/'
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        error.textContent = `${errorMessage} (code ${error.code})`;
    });

});