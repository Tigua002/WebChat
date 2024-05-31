// Change background color of the second nav link
document.getElementsByClassName("navLink")[1].style.backgroundColor = "#b86363";

// Function to load user information
async function LoadUser() {
    let found = false;
    // Request all users from the database
    const res = await fetch("/users", {
        method: "GET"
    });
    // Get users from the response
    const users = await res.json();
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == sessionStorage.getItem("username") && users[i].clientID == sessionStorage.getItem("userID")) {
            document.getElementById("username").innerHTML = sessionStorage.getItem("username");
            document.getElementById("userBio").value = users[i].BIO;
            document.getElementsByClassName("friendProfilePic")[0].src = "userInput/profilePictures/" + users[i].PFPlink;
            if (users[i].status == "discoverable") {
                document.getElementById("checked").checked = true;
            }
            found = true;
        }
    }
    if (!found) {
        alert("Seems like something went wrong...");
        sessionStorage.clear();
        window.location.assign("Login.html");
    }
}

// Function to log out
function LogOut() {
    sessionStorage.clear();
    window.location.assign("Login.html");
}

// Function to change username
async function changeUser() {
    let newUser = prompt("What do you wish to change the username to?");
    if (isValidString(newUser)) {
        alert("You are using invalid characters in your username!");
        return;
    }
    if (newUser.includes("DELETED USER") || newUser.includes("STATUS")) {
        alert("Don't use reserved keywords");
        return;
    }

    const res = await fetch("/users", {
        method: "GET"
    });
    const users = await res.json();
    for (let i = 0; i < users.length; i++) {
        if (users[i].username.toLowerCase() == newUser.toLowerCase()) {
            alert("The username has already been taken");
            return;
        }
    }
    const data = {
        userID: sessionStorage.getItem("userID"),
        newUser: newUser,
        username: sessionStorage.getItem("username")
    };
    fetch("/change/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    alert("Success");
    sessionStorage.setItem("username", newUser);
    document.getElementById("username").innerHTML = newUser;
}

// Function to change password
async function changePass() {
    let newPass = prompt("What do you wish to change the password to?");
    if (isValidString(newPass)) {
        alert("You are using invalid characters in your new password!");
        return;
    }
    let password = prompt("What is your current password?");

    if (isValidString(password) || !checkPassword(password)) {
        alert("Wrong password");
        return;
    }
    const data = {
        user: sessionStorage.getItem("username"),
        pass: password,
        newPassword: newPass
    };
    fetch("/change/password", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    alert("Success");
}

// Function to delete account
function deleteAccount() {
    let confirmation = confirm("Are you sure you want to delete your account, \nThis action is irreversible");
    if (!confirmation) {
        return;
    }
    let password = prompt("What is your password?");

    if (isValidString(password) || !checkPassword(password)) {
        alert("Wrong password");
        return;
    }
    const data = {
        userID: sessionStorage.getItem("userID"),
        username: sessionStorage.getItem("username")
    };
    fetch("/delete/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    alert("Success");
    sessionStorage.clear();
    window.location.assign("Login.html");
}


// Function to save user bio and status
async function saveBio() {
    let status = "failed";
    if (document.getElementById("checked").checked == true) {
        status = "discoverable";
    } else if (document.getElementById("checked").checked == false) {
        status = "hidden";
    }
    const data = {
        user: sessionStorage.getItem("username"),
        bio: document.getElementById("userBio").value,
        status: status
    };
    fetch("/save/bio", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    alert("success");
}

// Function to check password validity
async function checkPassword(password) {
    let brukernavn = sessionStorage.getItem("username");
    const responce = await fetch("user/" + brukernavn + "/" + password, {
        method: "GET"
    });
    const user = await responce.json();
    if (user.length == 1) {
        return true;
    } else if (user.length == 0) {
        return false;
    } else {
        alert("We have ran into a server side error, contact admin before proceeding");
        return false;
    }
}

// Event listener for file upload form submission
document.getElementById('fileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (document.getElementById('fileInput').files[0].size > (1024 * 1024)) {
        
    }
    const formData = new FormData();
    const fileInput = document.getElementById('fileInput').files[0];
    formData.append('file', fileInput);
    formData.append('filename', fileInput.name);
    formData.append("userID", sessionStorage.getItem("userID"));
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    if (response.ok) {
        alert("File uploaded successfully!");
        sessionStorage.setItem("PFP", data.filename);
    } else {
        console.error('Failed to upload file');
    }
});

// Event listener for file input change
const fileInput = document.getElementById('fileInput');
const fileInputLabel = document.getElementById('customFileInput');
fileInput.addEventListener('change', (event) => {
    const fileName = event.target.files[0].name;
    fileInputLabel.innerText = fileName;
});

// Function to check if a string contains banned characters
function isValidString(inputString) {
    if (inputString.includes("*") || inputString.includes("'") || inputString.includes("`") || inputString.includes('"') || inputString.includes(`/`) || inputString.includes("(") || inputString.includes(")") || inputString.includes(" ")) {
        return true;
    } else {
        return false;
    }
}

// Check if user is logged in, if not redirect to login page
if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    LoadUser();
} else {
    window.location.assign("Login.html");
}

// Event listener for displaying account hover popup
let hoverTime;
document.getElementsByClassName("DiscTitle")[0].addEventListener("mouseover", event => {
    hoverTime = setTimeout(() => {
        let popupText = document.getElementById("accountUnderText");
        popupText.style.opacity = "1";
        popupText.style.left = event.clientX + 'px';
        popupText.style.top = event.clientY + 'px';
    }, 800);
});

// Event listener for hiding account hover popup
document.getElementsByClassName("DiscTitle")[0].addEventListener("mouseout", event => {
    document.getElementById("accountUnderText").style.opacity = "0";
    clearTimeout(hoverTime);
});

// Event listeners for account actions
document.getElementById("DeleteAccBtn").addEventListener("click", deleteAccount);
document.getElementById("LogOutBtn").addEventListener("click", LogOut);
document.getElementById("passwordChange").addEventListener("click", changePass);
document.getElementById("usernameChange").addEventListener("click", changeUser);
document.getElementById("submitBio").addEventListener("click", saveBio);
