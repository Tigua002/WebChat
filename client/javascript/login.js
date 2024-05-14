// Redirect to account page if user is already logged in
if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    window.location.assign("account.html")
}

// Prevent form submission on enter key press
var form = document.getElementsByClassName("formHolder")[0];
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

// Function to handle login process
async function login() {
    let brukernavn = document.getElementById("username").value
    let password = document.getElementById("password").value

    // Check for invalid characters in username and password
    if (isValidString(brukernavn)) {
        alert("You are using invalid characters in your username!")
        return
    } else if (isValidString(password)) {
        alert("You are using invalid characters in your password!")
        return
    } else if (brukernavn.includes("DELETED USER") || brukernavn.includes("STATUS")) {
        alert("Don't use reserved keywords")
        return
    }

    // Request user information from the database
    const responce = await fetch("user/" + brukernavn + "/" + password, {
        method: "GET"
    })

    // Parse the response as JSON
    const user = await responce.json()

    // Check if user exists
    if (user.length == 1) {
        // Store user information in session storage
        sessionStorage.setItem("username", user[0].username)
        sessionStorage.setItem("userID", user[0].clientID)
        sessionStorage.setItem("PFP", user[0].PFPlink)
    } else if (user.length == 0) {
        alert("Hmm, something is wrong")
        return
    } else {
        alert("We have encountered a server-side error. Sorry for the inconvenience")
        return
    }
    // Redirect to account page after successful login
    window.location.assign("account.html")
}

// Function to check for invalid characters
function isValidString(inputString) {
    // Check for all different banned characters
    if (inputString.includes("*") || inputString.includes("'") || inputString.includes("`") || inputString.includes('"') || inputString.includes(`/`) || inputString.includes("(") || inputString.includes(")") || inputString.includes(" ")) {
        return true
    } else {
        return false
    }
}
