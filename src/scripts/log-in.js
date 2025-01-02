import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updateProfile } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator, setDoc, doc, getDoc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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
auth.useDeviceLanguage();
connectAuthEmulator(auth, "http://127.0.0.1:9099");
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = '/';
    }
});

// Basic validation
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const logIn = document.getElementById("submit");
const errorMessageElement = document.getElementById("error-message");

const emailRegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

logIn.addEventListener("click", () => {
    errorMessageElement.textContent = '';

    if (!(emailInput.value.length != 0 && emailRegExp.test(emailInput.value))) {
        emailInput.focus();
        errorMessageElement.textContent = "Please enter a valid email address";
        return;
    }

    if (passwordInput.value.length === 0) {
        passwordInput.focus();
        errorMessageElement.textContent = "Please enter a password";
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            window.location.href = '/'
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode === "auth/user-not-found") {
                errorMessageElement.textContent = "Email not found. Please check your email for typos";
                return;
            }
            if (errorCode === "auth/wrong-password") {
                errorMessageElement.textContent = "Password is incorrect. Please try again";
                return;
            }
            errorMessageElement.textContent = errorMessage;
        });
})

// Sign in with Google
const googleSignInButton = document.getElementById("sign-in-google");
const provider = new GoogleAuthProvider();

googleSignInButton.addEventListener("click", () => {
    // Initialize Firestore
    const db = getFirestore();
    connectFirestoreEmulator(db, "127.0.0.1", 8081);
    signInWithPopup(auth, provider)
    .then((userCredential) => {
        const user = userCredential.user;
        if (user.displayName.split(" ").length > 1) {
            updateProfile(user, {
                displayName: user.displayName.split(" ")[0]
            })
        }
        return getDoc(doc(db, "users", user.uid))
        .then((docSnap) => {
            if (!docSnap.exists()) {
                return setDoc(doc(db, "users", user.uid), {
                    access: 0
                });
            }
        })
        .catch((e) => {
            throw(e);
        });
    })
    .then(() => {
        console.log("finished");
        window.location.href = '/';
    })
    .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode != "auth/cancelled-popup-request") {
            errorMessageElement.textContent = `Error: ${errorMessage}`;
        }
    });
})