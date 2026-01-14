import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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

const auth = getAuth();
auth.useDeviceLanguage();

const buttonWrapper = document.getElementById("button-wrapper");
const accountButton = document.getElementById("account-button");
const buttonDropdown = document.getElementById("button-dropdown");
const signOutButton = document.getElementById("sign-out");
const databaseLink = document.getElementById("database-link");
const guideLink = document.getElementById("guide-link");

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        const displayName = user.displayName;

        if (displayName) {
            accountButton.textContent = `Hi, ${displayName}`;
        }
        else {
            accountButton.textContent = "Hi, user";
        }

        accountButton.classList.remove("hidden");
        databaseLink.classList.remove("hidden");
        guideLink.classList.remove("hidden");
    } else {
        // User is signed out
        buttonWrapper.classList.remove("hidden");
    }
});

// Dropdown
accountButton.onclick = showDropDown;

function showDropDown(e){
    accountButton.onclick = function(){};
    e.stopPropagation();
    buttonDropdown.classList.remove("hidden");

    document.onclick = function(e) {
        var ele = document.elementFromPoint(e.clientX, e.clientY);
        if (ele == accountButton){
            hideDropDown();
            return;
        }
        do {
            if (ele == buttonDropdown)
                return;
        } while (ele = ele.parentNode);
        hideDropDown();
     };
}

function hideDropDown() {
    document.onclick = function(){};
    buttonDropdown.classList.add("hidden");
    accountButton.onclick = showDropDown;
}

signOutButton.addEventListener("click", () => {
    signOut(auth);
    window.location.reload();
})

// User alert div
const urlParams = new URLSearchParams(window.location.search);
const alert = urlParams.get('alert');

if (alert) {
    const alertDiv = document.getElementById("alert");
    alertDiv.firstElementChild.textContent = alert;
    alertDiv.classList.remove("alert-hidden");

    alertDiv.lastElementChild.addEventListener("click", () => {
        alertDiv.classList.add("alert-hidden");

        urlParams.delete('alert');
        window.history.pushState({}, "", "?" + urlParams.toString());
    });
}
