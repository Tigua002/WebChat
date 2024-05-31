// Prevent form submission by default
var form = document.getElementsByClassName("formHolder")[0];
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

// Redirect to account page if user is already logged in
if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    window.location.assign("account.html")
}

// Function for signing up
async function signup() {
    let brukernavn = document.getElementById("username").value
    let password = document.getElementById("password").value
    let confPass = document.getElementById("2ndPassword").value
    if (confPass !== password) {
        alert("Your passwords do not match")
        return
    } else if (isValidString(brukernavn)) {
        alert("You are using invalid characters in your username!")
        return
    } else if (isValidString(password)) {
        alert("You are using invalid characters in your password!")
        return
    }
    // Request user from the database
    const res = await fetch("/find/user/" + brukernavn, {
        method: "GET"
    })
    // Get users from the response
    const users = await res.json()
    // Check if username is already taken
    if (users.length > 0) {
        alert("This username is already taken")
        return
    }
    // Check for reserved keywords in username
    if (brukernavn.includes("DELETED USER")) {
        alert("Don't use reserved keywords")
        return
    }
    // Set user and password from user inputs
    const data = {
        user: brukernavn,
        passord: password
    }
    // Send data to the database to create a new user
    fetch("/create/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    // Redirect user to the login page
    window.location.assign("Login.html")
}

// Function to check for invalid characters in the string
function isValidString(inputString) {
    // Check for all different banned characters
    if (inputString.includes("*") || inputString.includes("'") || inputString.includes("`") || inputString.includes('"') || inputString.includes(`/`) || inputString.includes("(") || inputString.includes(")") || inputString.includes(" ")) {
        return true
    } else {
        return false
    }
}
