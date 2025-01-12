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
import { getFirestore, connectFirestoreEmulator, collection, query, where, getDocs, getDoc, doc, or, and, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
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

        const filterResults = document.getElementById('filter-results');
        const urlParams = new URLSearchParams(window.location.search);
        const paramsDict = Object.fromEntries(urlParams.entries());
        const categoryDict = {"Algebra": paramsDict.algebra, "Geometry": paramsDict.geometry, "Number Theory": paramsDict.numbertheory};
        const categoryTrueCount = [paramsDict.algebra, paramsDict.geometry, paramsDict.numbertheory].filter(x => x === "true").length;
        const statusDict = {"Used": paramsDict.used, "Open": paramsDict.open, "Active": paramsDict.active};
        const statusTrueCount = [paramsDict.used, paramsDict.open, paramsDict.active].filter(x => x === "true").length;

        getDoc(doc(db, "users", user.uid)).then((doc) => {
            let access = 0;
            let q = query(collection(db, "problems"));

            if (doc.exists()) {
                access = doc.data().access;
            }

            // Show elements based on access
            if (access > 1) {
                document.getElementById("status-fieldset").classList.remove("hidden");
                document.getElementById("create-button").classList.remove("hidden");
            }

            // Create problems
            const createButton = document.getElementById('create-button');
            const problemWrapper = document.getElementById('problem-wrapper');
            const temporaryId = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9*Math.pow(10, 12)).toString(36);

            createButton.addEventListener('click', () => {
                problemWrapper.insertAdjacentHTML('afterbegin',
                    `<form class="new-problem" id="${temporaryId}" novalidate style="max-height: 0px; flex: 0;">
                        <div class="new-problem-header">
                            <select id="category-${temporaryId}" name="category" required>
                                <option value="" disabled selected>Category</option>
                                <option value="Algebra">Algebra</option>
                                <option value="Geometry">Geometry</option>
                                <option value="Number Theory">Number Theory</option>
                            </select>
                            <input type="number" id="difficulty-${temporaryId}" name="difficulty" min="0" max="10" required>
                            <input type="text" id="name-${temporaryId}" name="name" placeholder="Name*" required>
                        </div>
                        <label for="problem-${temporaryId}">Problem<span aria-required="true">*</span>:</label>
                        <textarea id="problem-${temporaryId}" name="problem" required></textarea>
                        <label for="diagram-${temporaryId}">Diagram link:</label>
                        <input type="url" id="diagram-${temporaryId}" name="diagram">
                        <label for="solution-${temporaryId}">Solution<span aria-required="true">*</span>:</label>
                        <textarea id="solution-${temporaryId}" name="solution" required></textarea>
                        <label for="answer-${temporaryId}">Answer<span aria-required="true">*</span>:</label>
                        <input type="text" id="answer-${temporaryId}" name="answer" required>
                        <p class="error-message" id="error-message-${temporaryId}"></p>
                        <div id="status-wrapper-${temporaryId}" class="hidden">
                            <label for="status-${temporaryId}">Status<span aria-required="true">*</span>:</label>
                            <input type="radio" id="status-used-${temporaryId}" name="status-${temporaryId}" value="Used">
                            <label for="status-used-${temporaryId}">Used</label>
                            <input type="radio" id="status-active-${temporaryId}" name="status-${temporaryId}" value="Active" checked>
                            <label for="status-active-${temporaryId}">Active</label>
                        </div>
                        <div class="new-problem-footer">
                            <button type="button" id="cancel-button-${temporaryId}" title="Cancel problem">Cancel</button>
                            <button type="button" class="submit-button-${temporaryId}" title="Submit problem">Submit</button>
                        </div>
                    </form>`
                );

                // Show status-wrapper if access is high enough
                if (access > 1) {
                    document.getElementById(`status-wrapper-${temporaryId}`).classList.remove("hidden");
                }

                // Cancel button
                const newProblem = document.getElementById(temporaryId);
                const cancelButton = document.getElementById(`cancel-button-${temporaryId}`);

                cancelButton.addEventListener('click', () => {
                    newProblem.style = "max-height: 0px; flex: 0;";
                    setTimeout(() => {
                        newProblem.remove();
                    }, 1000);
                });

                // Submit button
                const submitButton = document.getElementsByClassName(`submit-button-${temporaryId}`)[0];
                const category = document.getElementById(`category-${temporaryId}`);
                const difficulty = document.getElementById(`difficulty-${temporaryId}`);
                const name = document.getElementById(`name-${temporaryId}`);
                const problem = document.getElementById(`problem-${temporaryId}`);
                const diagram = document.getElementById(`diagram-${temporaryId}`);
                const solution = document.getElementById(`solution-${temporaryId}`);
                const answer = document.getElementById(`answer-${temporaryId}`);
                const errorMessage = document.getElementById(`error-message-${temporaryId}`);

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

                    let data = {
                        category: category.value,
                        difficulty: difficulty.value,
                        name: name.value,
                        problem: problem.value,
                        solution: solution.value,
                        status: "open",
                        answer: answer.value,
                        keywords: keywords,
                    }

                    addDoc(doc(db, "problems"), {
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
                    })
                });

                // Creation transition
                newProblem.scrollWidth;
                newProblem.style = "";
            });

            // Get data through URL
            if (access == 0) {
                q = query(q, where("status", "==", "Used"));
            }
        
            if (paramsDict.algebra && paramsDict.geometry && paramsDict.numbertheory && paramsDict.used && paramsDict.open && paramsDict.active && paramsDict.min && paramsDict.max && paramsDict.keywords) {
                slider.noUiSlider.set([paramsDict.min, paramsDict.max]);
                algebraCheckbox.checked = paramsDict.algebra === "true";
                geometryCheckbox.checked = paramsDict.geometry === "true";
                numberTheoryCheckbox.checked = paramsDict.numbertheory === "true";
                usedCheckbox.checked = paramsDict.used === "true";
                openCheckbox.checked = paramsDict.open === "true";
                activeCheckbox.checked = paramsDict.active === "true";
                searchbar.value = paramsDict.keywords;

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
            }
            
            getDocs(q).then((querySnapshot) => {
    
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
                    problemWrapper.insertAdjacentHTML('beforeend', 
                        `<div id="${doc.id}" class="problem" style="border-bottom-color: ${difficultyToColor(doc.data().difficulty)}">
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
                });
            });
        });
    }
});