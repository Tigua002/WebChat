var form = document.getElementsByClassName("formHolder")[0];
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);
if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    window.location.assign("account.html")
}
// function for signing up
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
    // getting all the users from the database
    const res = await fetch("/find/user/" + brukernavn,
        {
            method: "GET"
        })
    // assinging the variable users to the database responce
    const users = await res.json()
    // gets the user inputs
    // for loop going throug all the users

    if (users.length > 0) {
        alert("This username is already taken")
        return
    }
    if (brukernavn.includes("DELETED USER")) {
        alert("don't use reserved keywords")
        return
    }
    // sets user and password the user inputs
    const data = {
        user: brukernavn,
        passord: password
    }
    // sends the data to the database
    fetch("/create/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    // sending the user to the login page
    window.location.assign("login.html")
}

function isValidString(inputString) {
    // Check for all different banned characters
    if (inputString.includes("*") || inputString.includes("'") || inputString.includes("`") || inputString.includes('"') || inputString.includes(`/`) || inputString.includes("(") || inputString.includes(")") || inputString.includes(" ")) {
        return true
    } else {
        return false
    }
}
