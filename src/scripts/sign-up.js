import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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

// Initialize Firestore
const db = getFirestore();
var loggingIn = false;

// If already signed in: redirect user
const auth = getAuth();
auth.useDeviceLanguage();

onAuthStateChanged(auth, (user) => {
    if (user && !loggingIn) {
        window.location.href = '/';
    }
});

// Sign in with email
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

    loggingIn = true;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;

        updateProfile(user, {
            displayName: displayName
        });

        setDoc(doc(db, "users", user.uid), {
            access: 0,
            verified: user.emailVerified
        }).then(() => {
            if (!user.emailVerified) {
                const params = new URLSearchParams();
                params.append("alert", "Your account has been successfully created. In order to be able to promote, please verify your email in account settings, available by clicking your name in the top right.")
                window.location.href = '/?' + params.toString();
            }
            else {
                window.location.href = "/";
            }
        }).catch((e) => {
            throw(e);
        });
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        loggingIn = false;
        if (errorCode === "auth/email-already-in-use") {
            errorMessageElement.textContent = "Email is already associated with an account";
        }
        else {
            errorMessageElement.textContent = `Error: ${errorMessage}`;
        }
    });

});

// Sign in with Google
const googleSignInButton = document.getElementById("sign-in-google");
const provider = new GoogleAuthProvider();

googleSignInButton.addEventListener("click", () => {
    loggingIn = true;

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
                    access: 0,
                    verified: user.emailVerified
                });
            }
        })
        .catch((e) => {
            throw(e);
        });
    })
    .then(() => {
        window.location.href = '/';
    })
    .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode != "auth/cancelled-popup-request") {
            errorMessageElement.textContent = `Error: ${errorMessage}`;
        }
        loggingIn = false;
    });
})
