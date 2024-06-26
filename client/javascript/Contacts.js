// Check if the user is logged in
if (!sessionStorage.getItem("username")) {
    // If not logged in, redirect to the login page
    window.location.assign("Login.html");
}
document.getElementsByClassName("navLink")[0].style.backgroundColor = "#b86363"


// Create a function to adjust the viewport meta tag
function adjustViewportZoom(enableZoom) {
    let viewport = document.querySelector("meta[name=viewport]");
    if (enableZoom) {
        viewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes";
    } else {
        viewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    }
}

// Add event listeners to input fields
document.querySelectorAll('input, textarea, select').forEach(element => {
    element.addEventListener('focus', function () {
        adjustViewportZoom(false);
    });

    element.addEventListener('blur', function () {
        adjustViewportZoom(true);
    });
});


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
        // Skip deleted contacts
        if (users[i].type == "DELETED") {
            continue;
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
        if (window.innerWidth <= 600) {
            title.addEventListener("click", () => {
                loadMessages(users[i].lobbyID, users[i].lobbyName);
            });

        } else {
            div.addEventListener("click", () => {
                loadMessages(users[i].lobbyID, users[i].lobbyName);
            });
            
        }
        // Add event listener for the contact div

        // Add event listener for the context menu
        div.addEventListener("contextmenu", (event) => {
            // Prevent the default context menu from appearing
            if (document.getElementById("deleteGroup")) {
                document.getElementById("deleteGroup").remove()
            }
            if (document.getElementById("leaveChat")) {
                document.getElementById("leaveChat").remove()
            }

            document.getElementById("friendMenu").style.display = "none";
            event.preventDefault();

            // sets a lot of useful data in sessionstorage
            sessionStorage.setItem("lobbyType", event.target.getAttribute("key"));
            sessionStorage.setItem("lobbyAltering", event.target.id);
            sessionStorage.setItem("optionOpen", true);
            let titles = document.getElementsByClassName("contactTitle")
            for (let i = 0; i < titles.length; i++) {
                if (titles[i].id == sessionStorage.getItem("lobbyAltering")) {
                    titles[i].parentElement.style.backgroundColor = "#b86363";
                } else {
                    titles[i].parentElement.style.backgroundColor = "#2D3142";
                }
            }

            // delete groupchat function
            // checks if the selected item is a groupchat
            if (event.target.getAttribute("key") == "groupchat") {
                // creates the DELETE group chat button
                let groupDiv = document.createElement("div")
                groupDiv.setAttribute("class", "customMenuItem")
                groupDiv.setAttribute("id", "deleteGroup")
                groupDiv.innerHTML = "DELETE GROUPCHAT"
                customContextMenu.appendChild(groupDiv)

                groupDiv.addEventListener("click", () => {
                    // double checks with the user
                    if (!window.confirm("You are about to delete the group chat, you sure you want to proceed?")) {
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

                let leaveChat = document.createElement("div")
                leaveChat.setAttribute("class", "customMenuItem")
                leaveChat.setAttribute("id", "leaveChat")
                leaveChat.innerHTML = "LEAVE CHAT"
                customContextMenu.appendChild(leaveChat)

                leaveChat.addEventListener("click", () => {
                    if (!confirm("you are leaving a chat, are you sure you want to proceed?")) {
                        alert("action succesfully aborted")
                        return
                    }
                    const data = {
                        userID: sessionStorage.getItem("userID"),
                        lobbyID: sessionStorage.getItem("lobbyAltering"),
                        username: sessionStorage.getItem("username")
                    }
                    fetch("leave/chat", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    window.location.reload()
                })
                // sets an eventlistener
            } else if (event.target.getAttribute("key") == "direct") {
                let leaveChat = document.createElement("div")
                leaveChat.setAttribute("class", "customMenuItem")
                leaveChat.setAttribute("id", "leaveChat")
                leaveChat.innerHTML = "REMOVE CHAT"
                customContextMenu.appendChild(leaveChat)

                leaveChat.addEventListener("click", () => {
                    if (!confirm("you are leaving a chat, are you sure you want to proceed?")) {
                        alert("action succesfully aborted")
                        return
                    }
                    const data = {
                        userID: sessionStorage.getItem("userID"),
                        lobbyID: sessionStorage.getItem("lobbyAltering"),
                        username: sessionStorage.getItem("username")
                    }
                    fetch("leave/chat", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
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

    // Add margins to the first and last contact
    let contact = document.getElementsByClassName("Contact")
    contact[0].classList.add("firstContact")
}

var intervalActive = false;
let firstRun = true
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
        let senderDiv = document.createElement("div")
        let sender = document.createElement("h1");
        let message = document.createElement("h1");
        let pfpDiv = document.createElement("div")
        let pfp = document.createElement("img")
        let userInfoDiv = document.createElement("div")
        let messageOption = document.createElement("img")

        // Set attributes and content
        div.setAttribute("class", "message");
        pfpDiv.setAttribute("class", "userMessagePFP");
        userInfoDiv.setAttribute("class", "userInfoMessage");
        pfp.setAttribute("class", "friendProfilePic");
        sender.setAttribute("class", "messageSender");
        message.setAttribute("class", "messageText");
        pfp.setAttribute("src", "userInput/profilePictures/" + messages[i].profile)
        senderDiv.setAttribute("class", "messageSenderDiv")
        messageOption.setAttribute("class", "chatOption")
        messageOption.setAttribute("src", "bilder/icons8-three-dots-100.png")
        sender.innerHTML = messages[i].sender + ":";
        message.innerHTML = messages[i].message;

        // Append elements
        div.appendChild(userInfoDiv);
        userInfoDiv.appendChild(senderDiv)
        senderDiv.appendChild(pfpDiv)
        pfpDiv.appendChild(pfp)
        senderDiv.appendChild(sender)
        div.appendChild(message);
        userInfoDiv.appendChild(messageOption)
        messageOption.addEventListener("click", async () => {
            let messageID = messages[i].messageID
            const data = {
                ID: messageID
            }
            fetch("/delete/message/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        })
        document.getElementsByClassName("messages")[0].appendChild(div);

    }

    // Refresh messages every second
    if (!intervalActive) {
        setInterval(newMessage, 1000);
        intervalActive = true
    }

    // Create text message input
    document.getElementsByClassName("TextMessage")[0].innerHTML = `
    <textarea id="personalMessage" cols="30" rows="10" placeholder="Type your message here:"></textarea>
    <input id="sendIcon" type="button" value="&#8593;">
    `;

    // Add event listener for sending message
    let icon = document.getElementById("sendIcon");
    icon.addEventListener("click", () => {
        sendMessage(lobbyID);
    });

    // Add event listener for "Enter" key to send message
    document.getElementById('personalMessage').addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default Enter behavior (new line)
            document.getElementById('sendIcon').click(); // Submit the form
        }
    });
    if (window.innerWidth <= 600) {
        document.getElementsByClassName("messageHolder")[0].style.transition = ".1s ease-in"
        document.getElementsByClassName("messageHolder")[0].style.transform = `translateX(0px)`
        document.getElementsByClassName("messageHolder")[0].style.width = "100%"
        document.getElementsByClassName("Arrow")[0].style.transform = "scaleX(-1)"
        document.getElementsByClassName("contactDiv")[0].style.pointerEvents = "none"
        for (let i = 0; i < document.getElementsByClassName("Contact").length; i++) {
            const element = document.getElementsByClassName("Contact")[i];
            
            element.style.pointerEvents = "none"
        }
        
        if (firstRun) {
            swiper()
            firstRun = false
            document.getElementsByClassName("closeArrow")[0].addEventListener("click", (e) => {
                slideable = document.getElementsByClassName("messageHolder")[0]
                slideable.style.transition = ".1s ease-in"
                if (ContClosed) {
                    ContClosed = false
                    slideable.style.transform = `translateX(${limit}px)`;
                    slideable.style.width = "70%"
                    document.getElementsByClassName("Arrow")[0].style.transform = "scaleX(1)"
                    for (let i = 0; i < document.getElementsByClassName("Contact").length; i++) {
                        const element = document.getElementsByClassName("Contact")[i];
                        
                        element.style.pointerEvents = "visibleFill"
                    }
                    document.getElementsByClassName("contactDiv")[0].style.pointerEvents = "auto"
                    currentX = 0
                } else {
                    ContClosed = true
                    slideable.style.transition = ".1s ease-in"
                    document.getElementsByClassName("Arrow")[0].style.transform = "scaleX(-1)"
                    document.getElementsByClassName("messageHolder")[0].style.transform = `translateX(0px)`
                    document.getElementsByClassName("messageHolder")[0].style.width = "100%" 
                    
                    for (let i = 0; i < document.getElementsByClassName("Contact").length; i++) {
                        const element = document.getElementsByClassName("Contact")[i];
                        element.style.pointerEvents = "none"
                    }
                }
            })

        }
        document.getElementsByClassName("contactDiv")[0].style.pointerEvents = "none"
        for (let i = 0; i < document.getElementsByClassName("Contact").length; i++) {
            const element = document.getElementsByClassName("Contact")[i];
            element.style.pointerEvents = "none"
        }
        
        ContClosed = true
    }
}

// Function to send a message
async function sendMessage(lobbyID) {
    // Get the message from the input field
    let TextMessage = document.getElementById("personalMessage").value;

    // Check if the message is empty
    if (TextMessage == "") {
        return;
    }

    // Prepare data to send to the server
    const data = {
        lobbyID: lobbyID,
        sender: sessionStorage.getItem("username"),
        message: TextMessage,
        userID: sessionStorage.getItem("userID"),
        pfp: sessionStorage.getItem("PFP")
    };

    // Send data to the server
    fetch("/send/message", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    // Clear the input field after sending the message
    document.getElementById("personalMessage").value = "";

    // Create message elements for the sent message
    let div = document.createElement("div");
    let sender = document.createElement("h1");
    let message = document.createElement("h1");

    // Set attributes and content for the message elements
    div.setAttribute("class", "message");
    sender.setAttribute("class", "messageSender");
    message.setAttribute("class", "messageText");
    sender.innerHTML = sessionStorage.getItem("username") + ":";
    message.innerHTML = TextMessage;

    // Append message elements to the message container
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

    // Check if there are new messages
    // If the new messages are the same as the previously stored messages, no action is needed
    if (JSON.stringify(messages) == sessionStorage.getItem("messages")) {
        return;
    }

    // If there are new messages, reload the corresponding lobby
    let titles = document.getElementsByClassName("contactTitle");
    for (let i = 0; i < titles.length; i++) {
        // Find the title matching the current chatter
        if (titles[i].value == sessionStorage.getItem("chatter")) {
            // Simulate a click on the contact to reload messages
            titles[i].parentElement.click();
        }
    }
}

// Event listener to close the context menu on clicking outside
document.addEventListener("click", e => {
    // Check if the custom context menu is open
    if (sessionStorage.getItem("optionOpen") == "true") {
        // If the context menu is open, do nothing
        sessionStorage.setItem("optionOpen", false);
        return;
    }

    // Get the dimensions of the custom context menu and friend menu
    const dimensions = customContextMenu.getBoundingClientRect();
    const friendDimensions = document.getElementById("friendMenu").getBoundingClientRect();

    // Check if the click is outside the custom context menu
    if (
        e.clientX < dimensions.left ||
        e.clientX > dimensions.right ||
        e.clientY < dimensions.top ||
        e.clientY > dimensions.bottom
    ) {
        // Check if the click is outside the friend menu as well
        if (
            e.clientX < friendDimensions.left ||
            e.clientX > friendDimensions.right ||
            e.clientY < friendDimensions.top ||
            e.clientY > friendDimensions.bottom
        ) {
            // If the click is outside both menus, hide the custom context menu
            customContextMenu.style.display = 'none';
            document.getElementById("friendMenu").style.display = "none";
        }
    }
});

// Event listener to open the friend menu
document.getElementById("addUserMenu").addEventListener("click", () => {
    // Get the friend menu element
    let friendMenu = document.getElementsByClassName("friendsMenu")[0];

    // Display the friend menu
    friendMenu.style.display = "flex";

    // Calculate the position of the friend menu relative to the custom context menu
    let designatedLeft = parseInt(customContextMenu.style.left.replace("px", "")) + customContextMenu.offsetWidth;
    friendMenu.style.left = designatedLeft + "px";
    friendMenu.style.top = customContextMenu.offsetTop + "px";
});

// Event listener for renaming lobby
document.getElementById("menuItem1").addEventListener("click", async (event) => {
    // Hide the context menu
    event.target.parentElement.style.display = "none";

    // Get the selected lobby div and its input field
    let divSelect = document.getElementById(sessionStorage.getItem("lobbyAltering"));
    let inputField = divSelect.getElementsByClassName("contactTitle")[0];

    // Enable editing and focus on the input field
    inputField.removeAttribute("readonly");
    inputField.focus();

    // Add event listener for when input field loses focus (blur)
    inputField.addEventListener("blur", rename);
});

// Function to rename lobby
async function rename(event) {
    // Check if lobby altering information is available
    if (!sessionStorage.getItem("lobbyAltering")) {
        return;
    }

    // Set input field to read-only
    event.target.setAttribute("readonly", "true");

    // Remove event listener for blur
    event.target.removeEventListener("blur", rename);

    // Update session storage with the new lobby name
    sessionStorage.setItem("chatter", event.target.value);

    // Prepare data for sending to the server
    const data = {
        lobbyID: sessionStorage.getItem("lobbyAltering"),
        lobbyName: event.target.value,
        username: sessionStorage.getItem("username")
    };

    // Send data to the server to rename the lobby
    fetch("/rename/lobby", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    // Remove click event listener from parent element
    event.target.parentElement.removeEventListener("click", () => {
        loadMessages();
    });

    // Reload the page to reflect the changes
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

    // Iterate through the user's friends
    for (let i = 0; i < friends.length; i++) {
        const friend = friends[i];

        // Skip if friend is deleted
        if (friend.senderName == "DELETED USER" || friend.recieverName == "DELETED USER") {
            continue;
        }

        // Create elements for friend
        let name = document.createElement("h1");
        let checkbox = document.createElement("label");
        let div = document.createElement("div");

        // Set attributes and content
        name.setAttribute("class", "friendMenuName");
        checkbox.setAttribute("class", "custom-checkbox");
        div.setAttribute("class", "friend");
        div.addEventListener("click", checkboxFunctionality);

        // Determine friend ID and name based on sender and receiver
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
    let checkbox;
    if (e.target.className == "friend") {
        checkbox = e.target.getElementsByClassName("custom-checkbox")[0];
    } else {
        checkbox = e.target.parentElement.getElementsByClassName("custom-checkbox")[0];
    }
    if (checkbox.checked) {
        checkbox.checked = false;
        checkbox.innerHTML = "";
        checkbox.style.opacity = ".3";
    } else {
        checkbox.checked = true;
        checkbox.innerHTML = "&#x2713;";
        checkbox.style.opacity = "1";
        checkbox.style.border = "white 1px solid";
    }
};

// Function to submit group changes
const submitGroupChange = async () => {
    // Fetch lobby members from the server
    const res = await fetch("/get/lobbyMembers/" + sessionStorage.getItem("lobbyAltering"), {
        method: "GET"
    });
    let lobbyMembers = await res.json();

    // Initialize an array to store checked users
    const checkedUsers = [];

    // Iterate through custom checkboxes
    for (let i = 0; i < document.getElementsByClassName("custom-checkbox").length; i++) {
        const checkbox = document.getElementsByClassName("custom-checkbox")[i];
        let name = checkbox.parentElement.getElementsByClassName("friendMenuName")[0];

        // If checkbox is checked, add user to checkedUsers array
        if (checkbox.checked == true) {
            checkedUsers.push(
                { name: name.innerHTML, id: name.id }
            );
        }
    }

    // If lobby type is direct
    if (sessionStorage.getItem("lobbyType") == "direct") {
        // Check if there are enough users to initialize a new group
        if (checkedUsers.length <= 1) {
            alert("Too few users to initialize a new group");
            return;
        }
        const data = {
            hostID: sessionStorage.getItem("userID"),
            hostName: sessionStorage.getItem("username"),
            users: JSON.stringify(checkedUsers)
        };
        // Send data to server to create a new group
        fetch("create/Group", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        alert("sucess")
        window.location.reload()
    }
    // If lobby type is groupchat
    else if (sessionStorage.getItem("lobbyType") == "groupchat") {
        // Filter checked users to remove existing members
        var filteredUsers = checkedUsers.filter(function (user) {
            return !lobbyMembers.some(function (member) {
                return member.clientName === user.name;
            });
        });
        const data = {
            lobbyID: sessionStorage.getItem("lobbyAltering"),
            users: JSON.stringify(filteredUsers),
            groupName: sessionStorage.getItem("chatter")
        };
        // Send data to server to alter the group
        fetch("alter/Group", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        // Reload the page
        window.location.reload()
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
const screenWidth = window.innerWidth;
let ContClosed = true;
let startX;
let currentX;
let initialX = 0;
let isDragging = false;
let slideable = document.getElementsByClassName("messageHolder")[0]
const limit = screenWidth * 0.3; // 20% of the screen width
if (window.innerWidth <= 600) {

    slideable.style.transform = `translateX(${limit}px)`;
}
function swiper() {
    slideable.addEventListener("touchstart", function (event) {
        slideable.style.transition = "none"
        startX = event.touches[0].clientX;
        isDragging = true;
        initialX = currentX || 0;
    });

    slideable.addEventListener("touchmove", function (event) {
        slideable.style.transition = "none"
        if (!isDragging) return;
        currentX = event.touches[0].clientX - startX + initialX;
        let transalte = parseFloat(slideable.style.transform.replace("translateX(", "").replace("px)", ""))
        if (currentX < 10 && currentX > -10) {
            return
        }
        // Limit the movement to 20% of the screen width


        if (currentX > limit) {
            currentX = limit;
        }

        slideable.style.transform = `translateX(${currentX}px)`;
        slideable.style.width = (100 - (currentX/4)) + "%"

       
        if (currentX < 0) {
            let slideWidth = 100 - ((117 + currentX)/4)
            slideable.style.width = slideWidth + "%"
            ContClosed = true
            if (slideWidth > 100) {
                slideable.style.width = "100%"
                ContClosed = true
                document.getElementsByClassName("Arrow")[0].style.transform = "scaleX(1)"
                
            }
            
            slideable.style.transform = `translateX(${117 + currentX}px)`;
            if (currentX < -117) {
                slideable.style.transform = `translateX(0px)`;
                
                
            }
        } else {
            ContClosed = false
            document.getElementsByClassName("Arrow")[0].style.transform = "scaleX(-1)"

        }
        

    });

    slideable.addEventListener("touchend", function (event) {
        slideable.style.transition = "none"
        isDragging = false;
        // Check if the movement is within 20% of the screen width
        if (!ContClosed) {
            document.getElementsByClassName("Arrow")[0].style.transform = "scaleX(1)"
            slideable.style.transform = `translateX(${limit}px)`;
            slideable.style.width = "70%"
            for (let i = 0; i < document.getElementsByClassName("Contact").length; i++) {
                const element = document.getElementsByClassName("Contact")[i];
                
                element.style.pointerEvents = "auto"
            }
            document.getElementsByClassName("contactDiv")[0].style.pointerEvents = "auto"
            currentX = 0
        } else if (ContClosed) {document.getElementsByClassName("Arrow")[0].style.transform = "scaleX(-1)"
            slideable.style.transform = `translateX(0px)`
            slideable.style.width = "100%"

            document.getElementsByClassName("contactDiv")[0].style.pointerEvents = "none"
            for (let i = 0; i < document.getElementsByClassName("Contact").length; i++) {
                const element = document.getElementsByClassName("Contact")[i];
                
                element.style.pointerEvents = "none"
            }
            
            currentX = 0
        }
    });

}

// Event listener to submit group changes
document.getElementsByClassName("submitAddGroup")[0].addEventListener("click", submitGroupChange);

// Load contacts and friends
loadContacts();
loadFriends();
