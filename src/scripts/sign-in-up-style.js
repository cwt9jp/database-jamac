const labels = Array.from(document.querySelectorAll("label"));

labels.forEach(function(lbl) {
    const input = document.getElementById(lbl.htmlFor);

    if (input) {
        input.addEventListener("blur", function() {
            if (input.value) {
                lbl.classList.add("entered");
            }
            else {
                lbl.classList.remove("entered");
            }
        });
    }
});