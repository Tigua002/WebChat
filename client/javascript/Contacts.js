// Check if the user is logged in
if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    // If logged in, set the innerHTML of the element with id "accLink" to "Account"
    document.getElementById("accLink").innerHTML = "Account";
} else {
    // If not logged in, redirect to the login page
    window.location.assign("Login.html");
}

// Function to load contacts
async function loadContacts() {
    // Get the user ID from session storage
    let userID = sessionStorage.getItem("userID");

    // Request contact information from the database for the user
    const response = await fetch("/contacts/user/" + userID, {
        method: "GET"
    });

    // Get the user contacts from the response
    const users = await response.json();

    // Iterate through the user contacts
    for (let i = 0; i < users.length; i++) {
        if (users[i].type == "DELETED") {
            continue
        }
        // Create elements for each contact
        let div = document.createElement("div");
        let title = document.createElement("input");
        let option = document.createElement("h1");

        // Set attributes for the elements
        div.setAttribute("class", "Contact");
        div.setAttribute("id", users[i].lobbyID);
        div.setAttribute("key", users[i].type);
        title.setAttribute("id", users[i].lobbyID);
        title.setAttribute("key", users[i].type);
        title.setAttribute("class", "contactTitle");
        title.setAttribute("readonly", "true");
        title.value = users[i].lobbyName;
        option.innerHTML = "&#x22EF;"
        option.setAttribute("id", users[i].lobbyID);
        option.setAttribute("key", users[i].type);
        option.setAttribute("class", "friendOption");

        // Append elements to the contact div
        div.appendChild(title);
        div.appendChild(option);

        // Add event listener for the option element
        option.addEventListener("click", (e) => {
            // Get the mouse coordinates relative to the viewport
            var clientX = e.clientX;
            var clientY = e.clientY;

            // Simulate right-click event with mouse coordinates
            simulateRightClick(title, clientX, clientY);
        });

        // Append contact div to the container
        let element = document.getElementsByClassName("contactDiv")[0];
        element.appendChild(div);

        // Add event listener for the contact div
        div.addEventListener("click", () => {
            loadMessages(users[i].lobbyID, users[i].lobbyName);
        });

        // Add event listener for the context menu
        div.addEventListener("contextmenu", (event) => {
            // Prevent the default context menu from appearing
            if (document.getElementById("deleteGroup")) {
                document.getElementById("deleteGroup").remove()
            }
            document.getElementById("friendMenu").style.display = "none";
            event.preventDefault();
            // sets a lot of useful data in sessionstorage
            sessionStorage.setItem("lobbyType", event.target.getAttribute("key"));
            sessionStorage.setItem("lobbyAltering", event.target.id);
            sessionStorage.setItem("optionOpen", true);
            // delete groupchat function
            // checks if the selected item is a groupchat
            if (event.target.getAttribute("key") == "groupchat") {
                // creates the DELETE group chat button
                let groupDiv = document.createElement("div")
                groupDiv.setAttribute("class", "customMenuItem") 
                groupDiv.setAttribute("id", "deleteGroup") 
                groupDiv.innerHTML = "DELETE GROUPCHAT"
                customContextMenu.appendChild(groupDiv)
                // sets an eventlistener
                groupDiv.addEventListener("click", () => {
                    // double checks with the user
                    if (!window.confirm("You are about to delete the group chat, you sure you want to proceed?")){
                        alert("Action succesfully aborted")
                        return
                    }
                    // deletes the group chat
                    const data = {
                        lobbyID: sessionStorage.getItem("lobbyAltering"),
                    }
                    fetch("delete/group", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    // refreshes the page to prevent bugs
                    window.location.reload()
                })
            }

            // Calculate the position of the custom context menu
            customContextMenu.style.left = event.clientX + 'px';
            customContextMenu.style.top = event.clientY + 'px';

            // Display the custom context menu
            customContextMenu.style.display = 'block';
        });
    }

    // Show arrow if there are more contacts than can fit in the container
    if (document.getElementsByClassName("contactDiv")[0].childElementCount > 7) {
        document.getElementById("downArrow").style.display = "block";
    }
}
var intervalActive = false
// Function to load messages for a given lobby
async function loadMessages(lobbyID, lobbyName) {
    // Clear existing messages
    document.getElementsByClassName("messages")[0].innerHTML = "";

    // Request messages for the given lobby from the database
    const response = await fetch("/cont/message/" + lobbyID, {
        method: "GET"
    });

    // Get messages from the response
    const messages = await response.json();

    // Set session storage variables
    sessionStorage.setItem("messages", JSON.stringify(messages));
    sessionStorage.setItem("chatter", lobbyName);
    sessionStorage.setItem("lobby", lobbyID);

    // Highlight selected contact
    let titles = document.getElementsByClassName("contactTitle");
    for (let i = 0; i < titles.length; i++) {
        if (titles[i].value == sessionStorage.getItem("chatter")) {
            titles[i].parentElement.style.backgroundColor = "#b86363";
        } else {
            titles[i].parentElement.style.backgroundColor = "#2D3142";
        }
    }

    // Create message elements
    for (let i = 0; i < messages.length; i++) {
        let div = document.createElement("div");
        let sender = document.createElement("h1");
        let message = document.createElement("h1");

        // Set attributes and content
        div.setAttribute("class", "message");
        sender.setAttribute("class", "messageSender");
        message.setAttribute("class", "messageText");
        sender.innerHTML = messages[i].sender + ":";
        message.innerHTML = messages[i].message;

        // Append elements
        div.appendChild(sender);
        div.appendChild(message);
        document.getElementsByClassName("messages")[0].appendChild(div);

        // Refresh messages every second
    }
    
    if (!intervalActive) {
        setInterval(newMessage, 1000);
        intervalActive = true
    }

    // Create text message input
    document.getElementsByClassName("TextMessage")[0].innerHTML = `
        <textarea id="personalMessage" cols="30" rows="10" placeholder="Type your message here:"></textarea>
        <h1 id="sendIcon">&#8674;</h1>
    `;

    // Add event listener for sending message
    let icon = document.getElementById("sendIcon");
    icon.addEventListener("click", () => {
        sendMessage(lobbyID);
    });
}

// Function to send a message
async function sendMessage(lobbyID) {
    let TextMessage = document.getElementById("personalMessage").value;
    if (TextMessage == "") {
        return;
    }
    const data = {
        lobbyID: lobbyID,
        sender: sessionStorage.getItem("username"),
        message: TextMessage
    };
    // Send data to the database
    fetch("/send/message", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    // Clear input field
    document.getElementById("personalMessage").value = "";

    // Create message elements
    let div = document.createElement("div");
    let sender = document.createElement("h1");
    let message = document.createElement("h1");

    // Set attributes and content
    div.setAttribute("class", "message");
    sender.setAttribute("class", "messageSender");
    message.setAttribute("class", "messageText");
    sender.innerHTML = sessionStorage.getItem("username") + ":";
    message.innerHTML = TextMessage;

    // Append elements
    div.appendChild(sender);
    div.appendChild(message);
    document.getElementsByClassName("messages")[0].appendChild(div);
}

// Function to check for new messages
async function newMessage() {
    // Request messages for the current lobby from the database
    const response = await fetch("/cont/message/" + sessionStorage.getItem("lobby"), {
        method: "GET"
    });

    // Get messages from the response
    const messages = await response.json();
    // If there are new messages, reload the corresponding lobby
    if (JSON.stringify(messages) == sessionStorage.getItem("messages")) {
        console.log("no new messages");
        return;
    }
    let titles = document.getElementsByClassName("contactTitle");
    for (let i = 0; i < titles.length; i++) {
        if (titles[i].value == sessionStorage.getItem("chatter")) {
            titles[i].parentElement.click();
        }
    }
}

// Event listener to close the context menu on clicking outside
document.addEventListener("click", e => {
    if (sessionStorage.getItem("optionOpen") == "true") {
        sessionStorage.setItem("optionOpen", false);
        return;
    }
    const dimensions = customContextMenu.getBoundingClientRect();
    const friendDimensions = document.getElementById("friendMenu").getBoundingClientRect();
    if (
        e.clientX < dimensions.left ||
        e.clientX > dimensions.right ||
        e.clientY < dimensions.top ||
        e.clientY > dimensions.bottom
    ) {
        if (
            e.clientX < friendDimensions.left ||
            e.clientX > friendDimensions.right ||
            e.clientY < friendDimensions.top ||
            e.clientY > friendDimensions.bottom
        ) {
            customContextMenu.style.display = 'none';
            document.getElementById("friendMenu").style.display = "none";
        }
    }
});

// Event listener to open the friend menu
document.getElementById("addUserMenu").addEventListener("click", () => {
    let friendMenu = document.getElementsByClassName("friendsMenu")[0];
    friendMenu.style.display = "flex";
    let designatedLeft = parseInt(customContextMenu.style.left.replace("px", "")) + customContextMenu.offsetWidth;
    friendMenu.style.left = designatedLeft + "px";
    friendMenu.style.top = customContextMenu.offsetTop + "px";
});

// Event listener for renaming lobby
document.getElementById("menuItem1").addEventListener("click", async (event) => {
    event.target.parentElement.style.display = "none";
    let inputField = document.getElementById(sessionStorage.getItem("lobbyAltering"));
    inputField.removeAttribute("readonly");
    inputField.focus();
    inputField.addEventListener("blur", rename);
});

// Function to rename lobby
async function rename(event) {
    if (!sessionStorage.getItem("lobbyAltering")) {
        return;
    }
    event.target.setAttribute("readonly", "true");
    event.target.removeEventListener("blur", rename);
    sessionStorage.setItem("chatter", event.target.value);
    const data = {
        lobbyID: sessionStorage.getItem("lobbyAltering"),
        lobbyName: document.getElementById(sessionStorage.getItem("lobbyAltering")).value
    };
    // Send data to the database
    fetch("/rename/lobby", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    event.target.parentElement.removeEventListener("click", () => {
        loadMessages();
    });
    window.location.reload();
}

// Function to load user friends
const loadFriends = async () => {
    // Request friends for the current user from the database
    const response = await fetch("/get/friends/" + sessionStorage.getItem("userID"), {
        method: "GET"
    });
    // Get friends from the response
    const friends = await response.json();
    for (let i = 0; i < friends.length; i++) {
        const friend = friends[i];
        let name = document.createElement("h1");
        let checkbox = document.createElement("label");
        let div = document.createElement("div");

        // Set attributes and content
        name.setAttribute("class", "friendName");
        checkbox.setAttribute("class", "custom-checkbox");
        div.setAttribute("class", "friend");
        div.addEventListener("click", checkboxFunctionality);

        let friendID;
        let friendName;
        if (friend.senderID == sessionStorage.getItem("userID")) {
            friendID = friend.recieverID;
            friendName = friend.recieverName;
        } else {
            friendID = friend.senderID;
            friendName = friend.senderName;
        }
        name.innerHTML = friendName;
        name.setAttribute("id", friendID);
        div.appendChild(name);
        div.appendChild(checkbox);
        document.getElementById("friendMenu").appendChild(div);
    }
};

// Function for checkbox functionality
const checkboxFunctionality = e => {
    e.preventDefault();
    if (e.target.className == "friend") {
        if (e.target.getElementsByClassName("custom-checkbox")[0].checked == true) {
            e.target.getElementsByClassName("custom-checkbox")[0].checked = false;
            e.target.getElementsByClassName("custom-checkbox")[0].innerHTML = "";
            e.target.getElementsByClassName("custom-checkbox")[0].style.opacity = ".3";
        } else {
            e.target.getElementsByClassName("custom-checkbox")[0].checked = true;
            e.target.getElementsByClassName("custom-checkbox")[0].innerHTML = "&#x2713;";
            e.target.getElementsByClassName("custom-checkbox")[0].style.opacity = "1";
            e.target.getElementsByClassName("custom-checkbox")[0].style.border = "white 1px solid";
        }
    } else {
        if (e.target.parentElement.getElementsByClassName("custom-checkbox")[0].checked == true) {
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].checked = false;
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].innerHTML = "";
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].style.opacity = ".3";
        } else {
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].checked = true;
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].innerHTML = "&#x2713;";
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].style.opacity = "1";
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].style.border = "white 1px solid";
        }
    }
};

// Function to submit group changes
const submitGroupChange = async () => {
    const res = await fetch("/get/lobbyMembers/" + sessionStorage.getItem("lobbyAltering"), {
        method: "GET"
    });
    let lobbyMembers = await res.json();
    const checkedUsers = [];
    for (let i = 0; i < document.getElementsByClassName("custom-checkbox").length; i++) {
        const checkbox = document.getElementsByClassName("custom-checkbox")[i];

        let name = checkbox.parentElement.getElementsByClassName("friendName")[0];
        if (checkbox.checked == true) {
            checkedUsers.push(
                { name: name.innerHTML, id: name.id }
            );
        }
    }
    if (sessionStorage.getItem("lobbyType") == "direct") {
        console.log(checkedUsers.length);
        if (checkedUsers.length <= 1) {
            alert("To few users to initailize a new group")
            return
        }
        const data = {
            hostID: sessionStorage.getItem("userID"),
            hostName: sessionStorage.getItem("username"),
            users: JSON.stringify(checkedUsers)
        };
        fetch("create/Group", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    } else if (sessionStorage.getItem("lobbyType") == "groupchat") {
        var filteredUsers = checkedUsers.filter(function (user) {
            // Check if any blacklisted member has the same name as the user
            return !lobbyMembers.some(function (member) {
                return member.clientName === user.name;
            });
        });
        const data = {
            lobbyID: sessionStorage.getItem("lobbyAltering"),
            users: JSON.stringify(filteredUsers)
        };
        fetch("alter/Group", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
};

// Function to simulate right-click event
function simulateRightClick(element, clientX, clientY) {
    // Create a new MouseEvent object for a right-click event
    var event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: false,
        view: window,
        button: 2, // 2 represents the right mouse button
        buttons: 2, // 2 represents the right mouse button
        clientX: clientX, // Mouse X-coordinate relative to the viewport
        clientY: clientY // Mouse Y-coordinate relative to the viewport
    });

    // Dispatch the event on the specified element
    element.dispatchEvent(event);
}

// Event listener to submit group changes
document.getElementsByClassName("submitAddGroup")[0].addEventListener("click", submitGroupChange);

// Load contacts and friends
loadContacts();
loadFriends();
