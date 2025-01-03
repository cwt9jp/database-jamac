/*
Data has ten fields:
- category
- difficulty
- name
- problem
- solution
- status
- answer
- author
- created
- updated
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getAuth, connectAuthEmulator, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator, collection, query, where, getDocs} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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
auth.useDeviceLanguage();

connectAuthEmulator(auth, "http://127.0.0.1:9099");

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "/";
    }
});


// Slider
var slider = document.getElementById('difficulty-slider');

noUiSlider.create(slider, {
    start: [0, 10],
    connect: true,
    tooltips: [{ to: function(value) { return value } }, { to: function(value) { return value } }],
    range: {
        'min': 0,
        'max': 10
    },
    step: 1,
    behaviour: "tap-drag"
});

// Get data
const problemWrapper = document.getElementById('problem-wrapper');
const filterResults = document.getElementById('filter-results');

function difficultyToColor(difficulty) {
    return `rgb(${(88*(10-difficulty) + 211*(difficulty))/10}, ${(88*(10-difficulty) + 79*(difficulty))/10}, ${(183*(10-difficulty) + 79*(difficulty))/10})`;
}

const db = getFirestore();
connectFirestoreEmulator(db, "127.0.0.1", 8081);

const q = query(collection(db, "problems"), where("status", "==", "used"));

const querySnapshot = await getDocs(q);

if (querySnapshot.size == 0) {
    filterResults.textContent = "No results";
}
else if (querySnapshot.size == 1) {
    filterResults.textContent = querySnapshot.size + " result";
}
else {
    filterResults.textContent = querySnapshot.size + " results";
}

querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  problemWrapper.innerHTML += 
    `<div id="${doc.id}" class="problem" style="border-bottom: 5px solid ${difficultyToColor(doc.data().difficulty)}">
        <h2>${doc.data().category} &centerdot; ${doc.data().difficulty} &centerdot; ${doc.data().name}</h2>
        <p>${doc.data().problem}</p>
    </div>`;
});
MathJax.typeset();