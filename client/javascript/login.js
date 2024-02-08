var form = document.getElementsByClassName("formHolder")[0];
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    window.location.assign("account.html")
}

async function login() {
    let brukernavn = document.getElementById("username").value
    let password = document.getElementById("password").value
    if (isValidString(brukernavn)) {
        alert("You are using invalid characters in your username!")
        return
    } else if (isValidString(password)) {
        alert("You are using invalid characters in your password!")
        return
    } else if (brukernavn.includes("DELETED USER")) {
        alert("don't use reserved keywords")
        return
    }
    // requests the database for all info about the users    
    const responce = await fetch("user/" + brukernavn + "/" + password,
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database
    const user = await responce.json()
    if (user.length == 1) {
        sessionStorage.setItem("username", user[0].username)
        sessionStorage.setItem("userID", user[0].userID)
    } else if (user.length == 0) {
        alert("Hhmm, Something is wrong")
        return
    } else {
        alert("We have ran into a server side error, sorry for the inconvenience")
        return
    }
    window.location.assign("account.html")
}

function isValidString(inputString) {
    // Check for all different banned characters
    if (inputString.includes("*") || inputString.includes("'") || inputString.includes("`") || inputString.includes('"') || inputString.includes(`/`) || inputString.includes("(") || inputString.includes(")") || inputString.includes(" ")) {
        return true
    } else {
        return false
    }
}
