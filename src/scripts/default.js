import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth, connectAuthEmulator, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDStaGeZHAUMDsO-zkUSkibpboZLwwMMs8",
    authDomain: "database-jamac.firebaseapp.com",
    projectId: "database-jamac",
    storageBucket: "database-jamac.firebasestorage.app",
    messagingSenderId: "843623851966",
    appId: "1:843623851966:web:2b744a670449690a653bef",
    measurementId: "G-31ZH10YNF1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

connectAuthEmulator(auth, "http://127.0.0.1:9099");

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log(uid);
    } else {
        // User is signed out
        console.log("signed out");
    }
});