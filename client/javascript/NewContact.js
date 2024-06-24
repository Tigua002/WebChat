// Check if the user is logged in
if (!sessionStorage.getItem("username")) {
    // If not logged in, redirect to the login page
    window.location.assign("Login.html");
}

// Set background color for the third element with class "navLink"
document.getElementsByClassName("navLink")[2].style.backgroundColor = "#b86363";

// Get the form element
var form = document.getElementsByClassName("NCholder")[0];

// Function to prevent default form submission behavior
function handleForm(event) { 
    event.preventDefault(); 
}

// Add event listener to the form to prevent default submission behavior
form.addEventListener('submit', handleForm);

// Function to add a contact
async function addContact(paramUser) {
    // Get the requested user from parameter or input field
    let requestedUser = paramUser || document.getElementById("usernameInput").value;

    // Check if the requested user is the logged-in user or a reserved keyword
    if (requestedUser.toUpperCase() == sessionStorage.getItem("username").toUpperCase()) {
        alert("Can't send a request to yourself, sorry.");
        return;
    } else if (requestedUser == "DELETED USER") {
        alert("You are using a reserved keyword. Can't send a message to this user.");
        return;
    }

    // Fetch user data from the database
    const response = await fetch("find/user/" + requestedUser, {
        method: "GET"
    });
    const user = await response.json();

    // Handle cases when user not found or multiple users found
    if (user.length <= 0) {
        alert("Can't find user.");
        return;
    } else if (user.length > 1) {
        alert("We have encountered a server-side error. Sorry for the inconvenience.");
        return;
    }

    // Prepare data for sending to the database
    const data = {
        user: requestedUser,
        senderPFP: sessionStorage.getItem("PFP"),
        senderID: sessionStorage.getItem("userID"),
        senderName: sessionStorage.getItem("username")
    };

    // Send the data to the database
    fetch("/create/request/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    alert("Success.");
}

// Function to load contact requests
async function loadRequests() {
    // Fetch contact requests for the logged-in user from the database
    const response = await fetch("get/requests/" + sessionStorage.getItem("userID"), {
        method: "GET"
    });
    const requests = await response.json();

    // Iterate through the requests and create elements to display them
    for (let i = 0; i < requests.length; i++) {
        let element = document.getElementsByClassName("contactRequests")[0];
        let holder = document.createElement("div");
        let title = document.createElement("h1");
        let BtnDiv = document.createElement("div");
        let accBtn = document.createElement("h1");
        let decBtn = document.createElement("h1");

        // Set attributes for created elements
        holder.setAttribute("class", "request");
        title.setAttribute("class", "requestUsername");
        BtnDiv.setAttribute("class", "requestBtns");
        accBtn.setAttribute("class", "acceptRequest");
        decBtn.setAttribute("class", "declineRequest");

        // Append elements to the DOM
        element.appendChild(holder);
        holder.appendChild(title);
        holder.appendChild(BtnDiv);
        BtnDiv.appendChild(accBtn);
        BtnDiv.appendChild(decBtn);
        title.innerHTML = requests[i].senderUsername;
        accBtn.innerHTML = "&#10003;"; // Check mark symbol
        decBtn.innerHTML = "&#88;"; // X symbol

        // Add event listeners for accepting and declining requests
        accBtn.addEventListener("click", () => {
            acceptReq(requests[i].sender, requests[i].senderUsername, requests[i].senderPFP);
        });
        decBtn.setAttribute("onClick", "declineReq('" + requests[i].sender + "')");
    }
}

// Function to decline a contact request
async function declineReq(sender) {
    // Prepare data for declining the request
    const data = {
        userID: sessionStorage.getItem("userID"),
        sender: sender
    };

    // Send the data to the database
    fetch("/decline/request", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    alert("Success.");
    window.location.reload(); // Refresh the page after declining request
}


// Function to accept a contact request
async function acceptReq(sender, senderUsername, senderPFP) {
    // Prepare data for accepting the request
    const data = {
        user: sessionStorage.getItem("username"),
        sender: sender,
        userID: sessionStorage.getItem("userID"),
        senderName: senderUsername,
        senderPFP: senderPFP,
        userPFP: sessionStorage.getItem("PFP")
    };

    // Send the data to the database
    fetch("/accept/request", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    alert("Success.");

    // Remove the accepted request from the UI
    let element = document.getElementsByClassName("requestUsername");
    for (let i = 0; i < element.length; i++) {
        if (element[i].innerHTML == sender) {
            element[i].parentElement.remove();
        }
    }
    window.location.reload(); // Refresh the page after accepting request
}

// Function to load users discovered by the logged-in user
async function loadDiscoveries() {
    // Fetch discovered users from the database
    const response = await fetch("/users/discovered", {
        method: "GET"
    });
    const user = await response.json(); // User data

    let userID = sessionStorage.getItem("userID");

    // Fetch contacts of the logged-in user from the database
    const res = await fetch("/get/friends/" + userID, {
        method: "GET"
    });
    const contacts = await res.json(); // Contacts data

    // Iterate through discovered users and display them
    for (let i = 0; i < user.length; i++) {
        let element = document.getElementsByClassName("discoverHolder")[0];

        let div = document.createElement("div");
        let title = document.createElement("h1");
        let description = document.createElement("h1");
        let headerHolder = document.createElement("div");
        let button = document.createElement("h1");

        // Set attributes for created elements
        button.setAttribute("class", "discoverAdd");
        headerHolder.setAttribute("class", "headerHolder");
        div.setAttribute("class", "discoveredUser");
        title.setAttribute("class", "discoverName");
        description.setAttribute("class", "discoverTitle");

        // Set content for elements
        title.innerHTML = user[i].username;
        description.innerHTML = user[i].BIO;
        button.innerText = "ADD USER";

        // Add event listener to the button to add contact
        button.addEventListener("click", () => {
            addContact(user[i].username);
        });

        // Append elements to the DOM
        div.appendChild(headerHolder);
        headerHolder.appendChild(title);
        headerHolder.appendChild(button);
        div.appendChild(description);

        element.appendChild(div);

        // Check if the discovered user is already a contact or the logged-in user
        for (let x = 0; x < contacts.length; x++) {
            if (user[i].clientID == contacts[x].recieverID || user[i].clientID == contacts[x].senderID) {
                div.remove();
            }
        }
        if (user[i].clientID == sessionStorage.getItem("userID")) {
            div.remove();
        }
    }
}

// Event listener for loading discoveries when discover button is clicked
document.getElementById("discoverBtn").addEventListener("click", loadDiscoveries);

// Load contact requests when the page is loaded
loadRequests();
loadDiscoveries()