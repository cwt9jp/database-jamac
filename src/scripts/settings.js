import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, setDoc, doc, getDoc} from "firebase/firestore";

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
const auth = getAuth();
auth.useDeviceLanguage();

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "/";
    }
    else {
        
    }
});