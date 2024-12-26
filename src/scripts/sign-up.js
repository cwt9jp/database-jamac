import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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

// If already signed in: redirect user
const auth = getAuth();
connectAuthEmulator(auth, "http://127.0.0.1:9099");
onAuthStateChanged(auth, (user) => {
    if (user) {
        // window.location.href = '/';
    }
});

// Email validation
const emailInput = document.getElementById("email");
const nameInput = document.getElementById("display-name");
const initialPassword = document.getElementById("password-initial");
const finalPassword = document.getElementById("password-final");
const signUp = document.getElementById("submit");
const errorMessageElement = document.getElementById("error-message");

const emailRegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;


signUp.addEventListener("click", () => {
    errorMessageElement.textContent = "";

    if (!(emailInput.value.length != 0 && emailRegExp.test(emailInput.value))) {
        emailInput.focus();
        errorMessageElement.textContent = "Please enter a valid email address";
        return;
    }

    if (!(nameInput.value.length > 0 && nameInput.value.length <= 4096)) {
        nameInput.focus();
        errorMessageElement.textContent = "Please enter a display name";
        return;
    }

    if (!(initialPassword.value.length >= 6 && initialPassword.value.length <= 4096)) {
        initialPassword.focus();
        errorMessageElement.textContent = 'Password must be at least 6 characters';
        return;
    }

    if (!(finalPassword.value === initialPassword.value)) {
        finalPassword.focus();
        errorMessageElement.textContent = "Passwords do not match";
        return;
    }

    // Send email to Firebase
    const email = emailInput.value;
    const password = initialPassword.value;
    const displayName = nameInput.value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, {
            displayName: displayName
        })
        window.location.href = '/'
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === "auth/email-already-in-use") {
            errorMessageElement.textContent = "Email is already associated with an account";
        }
        else {
            errorMessageElement.textContent = `Error: ${errorMessage}`;
        }
    });

});