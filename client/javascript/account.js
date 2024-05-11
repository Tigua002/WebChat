document.getElementsByClassName("navLink")[1].style.backgroundColor = "#b86363"

async function LoadUser() {
    let found = false
    // getting all the users from the database
    const res = await fetch("/users",
        {
            method: "GET"
        })
    // assinging the variable users to the database responce
    const users = await res.json()
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == sessionStorage.getItem("username") && users[i].clientID == sessionStorage.getItem("userID")) {
            document.getElementById("username").innerHTML = sessionStorage.getItem("username")
            document.getElementById("userBio").value = users[i].BIO
            document.getElementsByClassName("friendProfilePic")[0].src = "userInput/profilePictures/" + users[i].PFPlink
            if (users[i].status == "discoverable") {
                document.getElementById("checked").checked = true
            }
            found = true
        }

    }
    if (!found) {
        alert("Seems like something went wrong...")
        sessionStorage.clear()
        window.location.assign("Login.html")

    }
}


function LogOut() {
    sessionStorage.clear()
    window.location.assign("Login.html")
}


async function changeUser() {
    let newUser = prompt("What do you wish to change the username to?")
    if (isValidString(newUser)) {
        alert("You are using invalid characters in your username!")
        return
    }
    if (newUser.includes("DELETED USER") || newUser.includes("STATUS")) {
        alert("don't use reserved keywords")
        return
    }

    alert("passed")
    // getting all the users from the database
    const res = await fetch("/users",
        {
            method: "GET"
        })
    // assinging the variable users to the database responce
    const users = await res.json()
    // gets the user inputs
    // for loop going throug all the users
    for (let i = 0; i < users.length; i++) {
        // checking if the user picked a username which is already in use
        if (users[i].username.toLowerCase() == newUser.toLowerCase()) {
            // sending an error message
            alert("The username has alredy been taken")
            return
        }
    }
    // sets user and password the user inputs
    const data = {
        userID: sessionStorage.getItem("userID"),
        newUser: newUser,
        username: sessionStorage.getItem("username")

    }
    // sends the data to the database
    fetch("/change/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    alert("Success")
    sessionStorage.setItem("username", newUser)
    document.getElementById("username").innerHTML = newUser
}

async function changePass() {
    let newPass = prompt("What do you wish to change the password to?")
    if (isValidString(newPass)) {
        alert("You are using invalid characters in your new password!")
        return
    }
    let password = prompt("What is your current password?")

    if (isValidString(password)) {
        alert("Wrong password")
        return
    }
    if (!checkPassword(password)) {
        alert("Wrong password")
        return
    }
    // sets user and password the user inputs
    const data = {
        user: sessionStorage.getItem("username"),
        pass: password,
        newPassword: newPass
    }
    // sends the data to the database
    fetch("/change/password", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    alert("Success")

}



function deleteAccount() {
    let confirmation = confirm("Are you sure you want to delete your account, \nThis action is irreversible")
    if (!confirmation) {
        return
    }
    let password = prompt("What is your password?")

    if (isValidString(password)) {
        alert("Wrong password")
        return
    }
    if (!checkPassword(password)) {
        alert("Wrong password")
        return
    }
    // sets user and password the user inputs
    const data = {
        userID: sessionStorage.getItem("userID"),
        username: sessionStorage.getItem("username")
    }
    // sends the data to the database
    fetch("/delete/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    alert("Success")
    sessionStorage.clear()
    window.location.assign("Login.html")
}



async function saveBio() {
    let status = "failed";
    if (document.getElementById("checked").checked == true) {
        status = "discoverable"
    } else if (document.getElementById("checked").checked == false){
        status = "hidden"
    }
    console.log();
    // sets user and password the user inputs
    const data = {
        user: sessionStorage.getItem("username"),
        bio: document.getElementById("userBio").value,
        status: status
    }
    // sends the data to the database
    fetch("/save/bio", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    alert("success")
}




async function checkPassword(password) {
    let brukernavn = sessionStorage.getItem("username")
    // requests the database for all info about the users    
    const responce = await fetch("user/" + brukernavn + "/" + password,
        {
            method: "GET"
        })    
    // sets user as the value we recieve from the database    
    const user = await responce.json()
    if (user.length == 1) {
        return true
    } else if (user.length == 0) {
        return false
    } else {
        alert("We have ran into a server side error, contact admin before proceeding")
        return false
    }    
}    

document.getElementById('fileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.getElementById('fileInput').files[0];
    
    // Append the file and its name to the FormData object
    formData.append('file', fileInput);
    formData.append('filename', fileInput.name); // Include the file name
    formData.append("userID", sessionStorage.getItem("userID"))
    // Send the FormData object to the server
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json()
    console.log(response.json());
    if (response.ok) {
        // If the file was successfully uploaded, trigger its download
        alert("File uploaded successfully!");
        sessionStorage.setItem("PFP", data.filename)
    } else {
        console.error('Failed to upload file');
    }
});

const fileInput = document.getElementById('fileInput');
const fileInputLabel = document.getElementById('customFileInput');

fileInput.addEventListener('change', (event) => {
    const fileName = event.target.files[0].name;
    fileInputLabel.innerText = fileName;
});


function isValidString(inputString) {
    // Check for all different banned characters
    if (inputString.includes("*") || inputString.includes("'") || inputString.includes("`") || inputString.includes('"') || inputString.includes(`/`) || inputString.includes("(") || inputString.includes(")") || inputString.includes(" ")) {
        return true
    } else {
        return false
    }    
}    


if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    LoadUser()
} else {
    window.location.assign("Login.html")
}
let hoverTime;
document.getElementsByClassName("DiscTitle")[0].addEventListener("mouseover", event => {

    hoverTime = setTimeout(() => {
        let popupText = document.getElementById("accountUnderText")
        console.log("entered custom styles");
        popupText.style.opacity = "1"

        console.log(event.clientY);
        console.log(event.clientX);
        popupText.style.left = event.clientX + 'px';
        popupText.style.top = event.clientY + 'px';

    }, 800)
})

document.getElementsByClassName("DiscTitle")[0].addEventListener("mouseout", event => {
    document.getElementById("accountUnderText").style.opacity = "0"
    clearTimeout(hoverTime)
})
document.getElementById("DeleteAccBtn").addEventListener("click", deleteAccount)
document.getElementById("LogOutBtn").addEventListener("click", LogOut)
document.getElementById("passwordChange").addEventListener("click", changePass)
document.getElementById("usernameChange").addEventListener("click", changeUser)
document.getElementById("submitBio").addEventListener("click", saveBio)