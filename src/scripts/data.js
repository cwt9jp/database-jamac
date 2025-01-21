/*
Data has thirteen fields:
- category
- difficulty
- name
- problem
- diagram
- solution
- status
- answer
- displayname
- author
- created
- updated
- keywords
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getAuth, connectAuthEmulator, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator, collection, query, where, getDocs, getDoc, doc, or, and, addDoc, serverTimestamp, limit, orderBy, startAfter } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
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

const db = getFirestore();
connectFirestoreEmulator(db, "127.0.0.1", 8081);

connectAuthEmulator(auth, "http://127.0.0.1:9099");

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

// Send data through URL
const algebraCheckbox = document.getElementById('algebra-checkbox');
const geometryCheckbox = document.getElementById('geometry-checkbox');
const numberTheoryCheckbox = document.getElementById('number-theory-checkbox');
const usedCheckbox = document.getElementById('used-checkbox');
const openCheckbox = document.getElementById('open-checkbox');
const activeCheckbox = document.getElementById('active-checkbox');
const sortSelect = document.getElementById('sort-select');
const sortRadioAsc = document.getElementById('sort-radio-ascending');
const sortRadioDesc = document.getElementById('sort-radio-descending');
const searchbar = document.getElementById('searchbar');
const filterSubmit = document.getElementById('filter-submit');


filterSubmit.addEventListener('click', () => {
    const params = new URLSearchParams();
    params.append('min', slider.noUiSlider.get()[0]);
    params.append('max', slider.noUiSlider.get()[1]);
    params.append('algebra', algebraCheckbox.checked);
    params.append('geometry', geometryCheckbox.checked);
    params.append('numbertheory', numberTheoryCheckbox.checked);
    params.append('used', usedCheckbox.checked);
    params.append('open', openCheckbox.checked);
    params.append('active', activeCheckbox.checked);
    params.append('sort', sortSelect.value);
    params.append('sortdirection', document.querySelector(`input[name="sort-radio"]:checked`).value);
    params.append('keywords', searchbar.value);
    window.location.href = "?" + params.toString();
});

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "/";
    }
    else {
        function difficultyToColor(difficulty) {
            return `rgb(${(88*(10-difficulty) + 211*(difficulty))/10}, ${(88*(10-difficulty) + 79*(difficulty))/10}, ${(183*(10-difficulty) + 79*(difficulty))/10})`;
        }

        function getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
        }

        function getKeysByValue(object, value) {
            return Object.keys(object).filter(key => object[key] === value);
        }

        function storageAvailable(type) {
            let storage;
            try {
              storage = window[type];
              const x = "__storage_test__";
              storage.setItem(x, x);
              storage.removeItem(x);
              return true;
            } catch (e) {
              return (
                e instanceof DOMException &&
                e.name === "QuotaExceededError" &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage &&
                storage.length !== 0
              );
            }
        }

        function addEventListeners(temporaryID, access) {
            // Show status-wrapper if access is high enough
            if (access > 1) {
                document.getElementById(`status-wrapper-${temporaryID}`).classList.remove("hidden");
            }

            // Cancel button
            const newProblem = document.getElementById(temporaryID);
            const cancelButton = document.getElementById(`cancel-button-${temporaryID}`);

            cancelButton.addEventListener('click', () => {
                newProblem.style = "max-height: 0; flex: 0;";
                localStorage.removeItem(`problem-${temporaryID}`);
                setTimeout(() => {
                    newProblem.remove();
                }, 1000);
            });

            // Submit button
            const submitButton = document.getElementsByClassName(`submit-button-${temporaryID}`)[0];
            const category = document.getElementById(`category-${temporaryID}`);
            const difficulty = document.getElementById(`difficulty-${temporaryID}`);
            const name = document.getElementById(`name-${temporaryID}`);
            const problem = document.getElementById(`problem-${temporaryID}`);
            const diagram = document.getElementById(`diagram-${temporaryID}`);
            const solution = document.getElementById(`solution-${temporaryID}`);
            const answer = document.getElementById(`answer-${temporaryID}`);
            const errorMessage = document.getElementById(`error-message-${temporaryID}`);
            let confirm = false;

            function saveData()  {
                localStorage.setItem(`problem-${temporaryID}`, JSON.stringify({
                    category: category.value,
                    difficulty: difficulty.value,
                    name: name.value,
                    problem: problem.value,
                    diagram: diagram.value,
                    solution: solution.value,
                    answer: answer.value,
                    status: document.querySelector(`input[name="status-${temporaryID}"]:checked`).value
                }))
            }
            
            // Add localStorage object
            if (storageAvailable("localStorage") && localStorage.key(`problem-${temporaryID}`) == null) {
                saveData();
            }
            else if (!storageAvailable("localStorage")) {
                errorMessage.textContent = "Your browser storage is full, so please note that this problem will NOT save when leaving the page";
            }

            submitButton.addEventListener('click', () => {
                if (!category.checkValidity()) {
                    errorMessage.textContent = "Please select a category";
                    return;
                }
                if (!difficulty.checkValidity()) {
                    errorMessage.textContent = "Please enter a difficulty between 0 and 10";
                    return;
                }
                if (!name.checkValidity()) {
                    errorMessage.textContent = "Please enter a name";
                    return;
                }
                if (!problem.checkValidity()) {
                    errorMessage.textContent = "Please enter a problem";
                    return;
                }
                if (!diagram.checkValidity()) {
                    errorMessage.textContent = "Please enter a valid diagram link";
                    return;
                }
                if (!solution.checkValidity()) {
                    errorMessage.textContent = "Please enter a solution";
                    return;
                }
                if (!answer.checkValidity()) {
                    errorMessage.textContent = "Please enter an answer";
                    return;
                }
                if (!confirm) {
                    errorMessage.textContent = "Please press submit again to confirm."
                    confirm = true;
                    return;
                }

                var keywords = [];

                function checkSpecialChars(i) {
                    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(i[i.length - 1])) {
                        i = i.slice(0, -1);
                    }
                    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(i[0])) {
                        i = i.slice(1);
                    }
                    return i;
                }

                function checkForKeywords(possibleKeywords, keywords) {
                    possibleKeywords.forEach((i) => {
                        i = checkSpecialChars(i);
                        if (!keywords.includes(i)) {
                            keywords.push(i);
                        }
                    });
                    return keywords;
                }

                    keywords = checkForKeywords(name.value.toLowerCase().split(" "), keywords);
                    keywords = checkForKeywords(problem.value.toLowerCase().split(" "), keywords);
                    keywords = checkForKeywords(solution.value.toLowerCase().split(" "), keywords);
                    keywords = checkForKeywords(answer.value.toLowerCase().split(" "), keywords);
                    keywords.push(user.displayName);

                    let data = {
                        category: category.value,
                        difficulty: parseInt(difficulty.value),
                        name: name.value,
                        problem: problem.value,
                        solution: solution.value,
                        status: document.querySelector(`input[name="status-${temporaryID}"]:checked`).value,
                        answer: answer.value,
                        displayname: user.displayName,
                        author: user.uid,
                        created: serverTimestamp(),
                        updated: serverTimestamp(),
                        keywords: keywords
                    }

                    if (diagram.value) data.diagram = diagram.value;

                    addDoc(collection(db, "problems"), data)
                    .then(() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set("alert", "Problem successfully created.");
                        localStorage.removeItem(`problem-${temporaryID}`);
                        window.location.href = '?' + params.toString();
    
                    }).catch((e) => {
                        errorMessage.textContent = `Error: ${e.message}`;
                    })

                });

                // Autosave feature
                problem.addEventListener("change", () => {
                    saveData();
                })
                solution.addEventListener("change", () => {
                    saveData();
                })
                name.addEventListener("change", () => {
                    saveData();
                })

                // Creation transition
                newProblem.scrollWidth;
                newProblem.style = "";
            }

        const filterResults = document.getElementById('filter-results');
        const urlParams = new URLSearchParams(window.location.search);
        const paramsDict = Object.fromEntries(urlParams.entries());
        const categoryDict = {"Algebra": paramsDict.algebra, "Geometry": paramsDict.geometry, "Number Theory": paramsDict.numbertheory};
        const categoryTrueCount = [paramsDict.algebra, paramsDict.geometry, paramsDict.numbertheory].filter(x => x === "true").length;
        const statusDict = {"Used": paramsDict.used, "Open": paramsDict.open, "Active": paramsDict.active};
        const statusTrueCount = [paramsDict.used, paramsDict.open, paramsDict.active].filter(x => x === "true").length;

        const createButton = document.getElementById('create-button');
        const problemWrapper = document.getElementById('problem-wrapper');

        function addProblem(temporaryID) {
            problemWrapper.insertAdjacentHTML('afterbegin',
                `<form class="new-problem" id="${temporaryID}" novalidate style="max-height: 0px; flex: 0;">
                    <div class="new-problem-header">
                        <select id="category-${temporaryID}" name="category" required>
                            <option value="" disabled selected>Category*</option>
                            <option value="Algebra">Algebra</option>
                            <option value="Geometry">Geometry</option>
                            <option value="Number Theory">Number Theory</option>
                        </select>
                        <input type="number" id="difficulty-${temporaryID}" name="difficulty" min="0" max="10" required>
                        <input type="text" id="name-${temporaryID}" name="name" placeholder="Name*" required>
                    </div>
                    <label for="problem-${temporaryID}">Problem<span class="required">*</span>:</label>
                    <textarea id="problem-${temporaryID}" name="problem" required></textarea>
                    <label for="diagram-${temporaryID}">Diagram link:</label>
                    <input type="url" id="diagram-${temporaryID}" name="diagram">
                    <label for="solution-${temporaryID}">Solution<span class="required">*</span>:</label>
                    <textarea id="solution-${temporaryID}" name="solution" required></textarea>
                    <label for="answer-${temporaryID}">Answer<span class="required">*</span>:</label>
                    <input type="text" id="answer-${temporaryID}" name="answer" required>
                    <p class="error-message" id="error-message-${temporaryID}"></p>
                    <fieldset id="status-wrapper-${temporaryID}" class="hidden status-wrapper">
                        <legend>Status<span class="required">*</span>:</legend>
                        <input type="radio" id="status-used-${temporaryID}" name="status-${temporaryID}" value="Used">
                        <label for="status-used-${temporaryID}">Used</label>
                        <input type="radio" id="status-active-${temporaryID}" name="status-${temporaryID}" value="Open" checked>
                        <label for="status-active-${temporaryID}">Open</label>
                    </fieldset>
                    <div class="new-problem-footer">
                        <button type="button" id="cancel-button-${temporaryID}" title="Cancel problem">Cancel</button>
                        <button type="button" class="submit-button-${temporaryID}" title="Submit problem">Submit</button>
                    </div>
                </form>`);
        }

        function showProblems(doc) {
            // doc.data() is never undefined for query doc snapshots
            problemWrapper.insertAdjacentHTML('beforeend', 
                `<div id="${doc.id}" class="problem" style="border-bottom-color: ${difficultyToColor(doc.data().difficulty)}" tabindex="0">
                    <button type="button" class="contract-button" title="Contract problem">
                        <img src="/src/images/exit.svg" />
                    </button>
                    <h2>${doc.data().category} &centerdot; ${doc.data().difficulty} &centerdot; ${doc.data().status} &centerdot; ${doc.data().name}</h2>
                    <p>${doc.data().problem}</p>
                    ${doc.data().diagram != null ? `<img src="${doc.data().diagram}" alt="Diagram" />` : ""}
                    <div>
                        <p>Solution: ${doc.data().solution}</p>
                        <small>
                            Answer: ${doc.data().answer} &centerdot;
                            Problem by ${doc.data().displayname} &centerdot;
                            Created ${doc.data().created.toDate()}
                            ${doc.data().updated != null ? `&centerdot; Updated ${doc.data().updated.toDate()}` : ""}</small>
                    </div>
                </div>`
            );
            let problem = document.getElementById(doc.id);
            problem.addEventListener('click', () => {
                problem.classList.add("expanded");
            });
            let contractButton = problem.getElementsByClassName('contract-button')[0];
            contractButton.addEventListener('click', (ev) => {
                problem.classList.remove("expanded");
                ev.stopPropagation();
            });
            MathJax.typeset();
        }

        getDoc(doc(db, "users", user.uid)).then((d) => {
            let access = 0;

            if (d.exists()) {
                access = d.data().access;
            }

            // Show elements based on access
            if (access > 1) {
                document.getElementById("status-fieldset").classList.remove("hidden");
                document.getElementById("create-button").classList.remove("hidden");

                // Show saved problems
                const keys = Object.keys(localStorage);
                let problemKeys = [];

                keys.forEach((key) => {
                    if (key.startsWith("problem-")) problemKeys.push(key);
                });

                problemKeys.forEach((key) => {
                    const temporaryID = key.slice(8);
                    const problemObject = JSON.parse(localStorage.getItem(key));

                    addProblem(temporaryID);

                    document.getElementById(`difficulty-${temporaryID}`).value = problemObject.difficulty;
                    document.getElementById(`category-${temporaryID}`).value = problemObject.category;
                    document.getElementById(`name-${temporaryID}`).value = problemObject.name;
                    document.getElementById(`problem-${temporaryID}`).value = problemObject.problem;
                    document.getElementById(`diagram-${temporaryID}`).value = problemObject.diagram;
                    document.getElementById(`solution-${temporaryID}`).value = problemObject.solution;
                    document.getElementById(`answer-${temporaryID}`).value = problemObject.answer;
                    document.querySelector(`input[name="status-${temporaryID}"][value="${problemObject.status}"]`).checked = true;

                    addEventListeners(temporaryID, access);
                });
            }

            // Create problems
            createButton.addEventListener('click', () => {
                const temporaryID = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9*Math.pow(10, 12)).toString(36);
                addProblem(temporaryID);
                addEventListeners(temporaryID, access);
            });

            // Get data through URL
            let q = query(collection(db, "problems"));

            if (access == 0) {
                q = query(q, where("status", "==", "Used"));
            }
        
            // Apply filters
            slider.noUiSlider.set([paramsDict.min, paramsDict.max]);
            algebraCheckbox.checked = paramsDict.algebra === "true";
            geometryCheckbox.checked = paramsDict.geometry === "true";
            numberTheoryCheckbox.checked = paramsDict.numbertheory === "true";
            usedCheckbox.checked = paramsDict.used === "true";
            openCheckbox.checked = paramsDict.open === "true";
            activeCheckbox.checked = paramsDict.active === "true";
            sortSelect.value = paramsDict.sort;
            sortRadioAsc.checked = paramsDict.sortdirection === "asc";
            sortRadioDesc.checked = paramsDict.sortdirection === "desc";

            if (paramsDict.keywords != "") {
                q = query(q, where("keywords", "array-contains-any", paramsDict.keywords.toLowerCase().split(" ")));
            }

            if (!(parseInt(paramsDict.min) == 0 && parseInt(paramsDict.max) == 10)) {
                q = query(q, where("difficulty", ">=", parseInt(paramsDict.min)), where("difficulty", "<=", parseInt(paramsDict.max)));
            }

            if (categoryTrueCount == 1) {
                q = query(q, where("category", "==", getKeyByValue(categoryDict, "true")));
            }
            else if (categoryTrueCount == 2) {
                q = query(q, where("category", "!=", getKeyByValue(categoryDict, "false")));
            }

            if (access != 0) {
                if (statusTrueCount == 1) {
                    if (access == 1 && getKeyByValue(statusDict, "true") != "used") {
                        q = query(q, where("author", "==", user.uid));
                    }
                    q = query(q, where("status", "==", getKeyByValue(statusDict, "true")));
                }
                else if (statusTrueCount == 2) {
                    if (access == 1) {
                        if (getKeyByValue(statusDict, "false") == "used") {
                            q = query(q, where("author", "==", user.uid));
                        }
                        else {
                            q = query(q, or(where("status", "==", "used"), and(where("status", "==", getKeysByValue(statusDict, "true")[1]), where("author", "==", user.uid))));
                        }
                    }
                    else {
                        q = query(q, where("status", "!=", getKeyByValue(statusDict, "false")));
                    }
                }
                else if (access == 1) {
                    q = query(q, or(where("author", "==", user.uid), where("status", "==", "used")));
                }
            }
            q = query(q, orderBy(paramsDict.sort, paramsDict.sortdirection), limit(20));
            
            getDocs(q).then((querySnapshot) => {
    
                if (querySnapshot.size == 0) {
                    filterResults.textContent = "No results";
                }
                else if (querySnapshot.size == 1) {
                    filterResults.textContent = querySnapshot.size + " result";
                }
                else if (querySnapshot.size == 20) {
                    filterResults.textContent = "20+ results";
                    var resultAmount = 20;
                }
                else {
                    filterResults.textContent = querySnapshot.size + " results";
                }
    
                querySnapshot.forEach((doc) => {showProblems(doc)});
                
                if (resultAmount) {
                    window.addEventListener("scroll", () => {
                        if (((document.documentElement.scrollHeight - window.innerHeight) === window.scrollY) && resultAmount) {
                            const lastProblem = querySnapshot.docs[querySnapshot.size - 1];
                            var newQuery = query(q, startAfter(lastProblem));
                            getDocs(newQuery).then((nextQuerySnapshot) => {
                                if (nextQuerySnapshot.size == 0) {
                                    resultAmount = null;
                                }
                                else if (querySnapshot.size == 20) {
                                    filterResults.textContent = `${resultAmount + 20}+ results`;
                                    resultAmount += 20;
                                }
                                else {
                                    filterResults.textContent = `${resultAmount + querySnapshot.size} results`;
                                    resultAmount = null;
                                }

                                querySnapshot.forEach((nextDoc) => {showProblems(nextDoc)});
                            });
                        }
                    });
                }
            });
        });
    }
});