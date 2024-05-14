// Set background color for the fourth navigation link
document.getElementsByClassName("navLink")[3].style.backgroundColor = "#b86363"

// Add event listener for FAQ questions
document.addEventListener("DOMContentLoaded", function () {
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(question => {
        question.addEventListener("click", function () {
            const answer = this.nextElementSibling;
            console.log(answer);
            // Toggle display of the answer
            answer.style.display = answer.style.display === "block" ? "none" : "block";
        });
    });
});
