const labels = Array.from(document.querySelectorAll("label"));

labels.forEach(function(lbl) {
    const input = document.getElementById(lbl.htmlFor);

    if (input) {
        input.addEventListener("focus", function() {
            lbl.classList.add("focused");
        });
        input.addEventListener("blur", function() {
            lbl.classList.remove("focused");
            if (input.value) {
                lbl.classList.add("entered");
            }
            else {
                lbl.classList.remove("entered");
            }
        });
    }
});