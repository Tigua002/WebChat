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


document.getElementsByClassName("kontaktInfoHolder")[0].addEventListener("submit", sendMail)

async function sendMail() {
    let name = document.getElementById("navn").value
    let Email = document.getElementById("Email").value
    let phone = document.getElementById("telefon").value
    let text = document.getElementById("EmailText").value
    let message = `
    ${text}

    ${name}
    ${Email}
    ${phone}
    `

    const data = {
        message: message,
        sender: name,
        email: Email,
    }
    // sends the data to the database
    fetch("/send/mail", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
}