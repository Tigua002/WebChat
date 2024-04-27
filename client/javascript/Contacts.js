if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    document.getElementById("accLink").innerHTML = "Account"
} else {
    window.location.assign("Login.html")
}

async function loadContacts() {
    let userID = sessionStorage.getItem("userID")
    // requests the database for all info about the users    
    const responce = await fetch("/contacts/user/" + userID,
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database
    const users = await responce.json()
    for (let i = 0; i < users.length; i++) {

        let div = document.createElement("div")
        div.setAttribute("class", "Contact")
        let title = document.createElement("input")
        
        title.setAttribute("id", users[i].lobbyID)
        title.setAttribute("key", users[i].type)
        title.setAttribute("class", "contactTitle")
        title.setAttribute("readonly", "true")
        title.value = users[i].lobbyName
        div.appendChild(title)
        let element = document.getElementsByClassName("contactDiv")[0]
        element.appendChild(div)
        div.addEventListener("click", () => {
            loadMessages(users[i].lobbyID, users[i].lobbyName)
        })


        title.addEventListener("contextmenu", (event) => {
            // Prevent the default context menu from appearing
            document.getElementById("friendMenu").style.display = "none"
            event.preventDefault();

            sessionStorage.setItem("lobbyType", event.target.getAttribute("key"))

            sessionStorage.setItem("lobbyAltering", event.target.id)
            // Calculate the position of the custom context menu
            customContextMenu.style.left = event.pageX + 'px';
            customContextMenu.style.top = event.pageY + 'px';

            // Display the custom context menu
            customContextMenu.style.display = 'block';

        })
    }
    if (document.getElementsByClassName("contactDiv")[0].childElementCount > 7) {
        document.getElementById("downArrow").style.display = "block"
    }
}


async function loadMessages(lobbyID, lobbyName) {
    document.getElementsByClassName("messages")[0].innerHTML = ""
    // requests the database for all info about the users    
    const responce = await fetch("/cont/message/" + lobbyID,
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database
    const messages = await responce.json()
    sessionStorage.setItem("messages", JSON.stringify(messages))

    sessionStorage.setItem("chatter", lobbyName)

    sessionStorage.setItem("lobby", lobbyID)
    let titles = document.getElementsByClassName("contactTitle")
    for (let i = 0; i < titles.length; i++) {
        if (titles[i].value == sessionStorage.getItem("chatter")) {
            titles[i].parentElement.style.backgroundColor = "#b86363"
        } else {
            titles[i].parentElement.style.backgroundColor = "#2D3142"

        }
    }

    for (let i = 0; i < messages.length; i++) {
        let div = document.createElement("div")
        let sender = document.createElement("h1")
        let message = document.createElement("h1")

        div.setAttribute("class", "message")
        sender.setAttribute("class", "messageSender")
        message.setAttribute("class", "messageText")

        div.appendChild(sender)
        div.appendChild(message)
        sender.innerHTML = messages[i].sender + ":"
        message.innerHTML = messages[i].message

        document.getElementsByClassName("messages")[0].appendChild(div)

        setInterval(newMessage, 1000)
    }
    document.getElementsByClassName("TextMessage")[0].innerHTML = `
    <textarea id="personalMessage" cols="30" rows="10" placeholder="Type your message here:"></textarea>
    <h1 id="sendIcon">&#8674;</h1>
    `
    let icon = document.getElementById("sendIcon")
    icon.addEventListener("click", () => {
        sendMessage(lobbyID)
    })
}

async function sendMessage(lobbyID) {
    let TextMessage = document.getElementById("personalMessage").value
    if (TextMessage == "") {
        return
    }
    // sets user and password the user inputs
    const data = {
        lobbyID: lobbyID,
        sender: sessionStorage.getItem("username"),
        message: TextMessage
    }
    // sends the data to the database
    fetch("/send/message", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    document.getElementById("personalMessage").value = ""
    let div = document.createElement("div")
    let sender = document.createElement("h1")
    let message = document.createElement("h1")

    div.setAttribute("class", "message")
    sender.setAttribute("class", "messageSender")
    message.setAttribute("class", "messageText")

    div.appendChild(sender)
    div.appendChild(message)
    sender.innerHTML = sessionStorage.getItem("username") + ":"
    message.innerHTML = TextMessage

    document.getElementsByClassName("messages")[0].appendChild(div)

}


async function newMessage() {
    // requests the database for all info about the users    
    const responce = await fetch("/cont/message/" + sessionStorage.getItem("lobby"),
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database
    const messages = await responce.json()

    if (JSON.stringify(messages) == sessionStorage.getItem("messages")) {
        return
    }
    let titles = document.getElementsByClassName("contactTitle")
    for (let i = 0; i < titles.length; i++) {
        if (titles[i].innerHTML == sessionStorage.getItem("chatter")) {
            titles[i].parentElement.click()
        }
    }
}
var customContextMenu = document.getElementById('customContextMenu');


document.addEventListener("click", e => { // closes the new context menu on clicking outside
    const dimensions = customContextMenu.getBoundingClientRect()
    const friendDimensions = document.getElementById("friendMenu").getBoundingClientRect()
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
            document.getElementById("friendMenu").style.display = "none"
        }

    }
})



document.getElementById("addUserMenu").addEventListener("click", () => { // opens the friend menu
    let friendMenu = document.getElementsByClassName("friendsMenu")[0]
    friendMenu.style.display = "flex"
    let designatedLeft = parseInt(customContextMenu.style.left.replace("px", "")) + customContextMenu.offsetWidth
    friendMenu.style.left = designatedLeft + "px"
    friendMenu.style.top = customContextMenu.offsetTop + "px"


})

document.getElementById("menuItem1").addEventListener("click", async (event) => { // adds event listener to the rename button
    event.target.parentElement.style.display = "none"
    let inputField = document.getElementById(sessionStorage.getItem("lobbyAltering"))
    inputField.removeAttribute("readonly")
    inputField.focus()
    inputField.addEventListener("blur", rename)

})

async function rename(event) {
    if (!sessionStorage.getItem("lobbyAltering")) {
        return
    }
    event.target.setAttribute("readonly", "true")
    event.target.removeEventListener("blur", rename)
    sessionStorage.setItem("chatter", event.target.value)
    const data = {
        lobbyID: sessionStorage.getItem("lobbyAltering"),
        lobbyName: document.getElementById(sessionStorage.getItem("lobbyAltering")).value
    }
    // sends the data to the database
    fetch("/rename/lobby", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    event.target.parentElement.removeEventListener("click", () => {
        loadMessages()
    })
    window.location.reload()

}

const loadFriends = async () => {
    const res = await fetch("/get/friends/" + sessionStorage.getItem("userID"), {
        method: "GET"
    })
    const friends = await res.json()
    console.log(friends);
    for (let i = 0; i < friends.length; i++) {
        const friend = friends[i]
        let name = document.createElement("h1")
        let checkbox = document.createElement("label")
        let div = document.createElement("div")

        name.setAttribute("class", "friendName")
        checkbox.setAttribute("class", "custom-checkbox")
        div.setAttribute("class", "friend")
        div.addEventListener("click", checkboxFunctionality)

        let friendID;
        let friendName;
        if (friend.senderID == sessionStorage.getItem("userID")) {
            friendID = friend.recieverID
            friendName = friend.recieverName

        } else {
            friendID = friend.senderID
            friendName = friend.senderName
        }
        name.innerHTML = friendName
        name.setAttribute("id", friendID)
        div.appendChild(name)
        div.appendChild(checkbox)
        document.getElementById("friendMenu").appendChild(div)
    }
}



const checkboxFunctionality = e => { // the checkbox functionaly
    e.preventDefault()

    if (e.target.className == "friend") {
        if (e.target.getElementsByClassName("custom-checkbox")[0].checked == true) {
            e.target.getElementsByClassName("custom-checkbox")[0].checked = false
            e.target.getElementsByClassName("custom-checkbox")[0].innerHTML = ""
            e.target.getElementsByClassName("custom-checkbox")[0].style.opacity = ".3"

        } else {
            e.target.getElementsByClassName("custom-checkbox")[0].checked = true
            e.target.getElementsByClassName("custom-checkbox")[0].innerHTML = "&#x2713;"
            e.target.getElementsByClassName("custom-checkbox")[0].style.opacity = "1"
            e.target.getElementsByClassName("custom-checkbox")[0].style.border = "white 1px solid"
        }




    } else {
        if (e.target.parentElement.getElementsByClassName("custom-checkbox")[0].checked == true) {
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].checked = false
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].innerHTML = ""
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].style.opacity = ".3"

        } else {
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].checked = true
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].innerHTML = "&#x2713;"
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].style.opacity = "1"
            e.target.parentElement.getElementsByClassName("custom-checkbox")[0].style.border = "white 1px solid"

        }

    }
}

const submitGroupChange = async () => {
    const res = await fetch("/get/lobbyMembers/" + sessionStorage.getItem("lobbyAltering"), {
        method: "GET"
    })
    let lobbyMembers = await res.json()
    const checkedUsers = []
    for (let i = 0; i < document.getElementsByClassName("custom-checkbox").length; i++) {
        const checkbox = document.getElementsByClassName("custom-checkbox")[i]

        let name = checkbox.parentElement.getElementsByClassName("friendName")[0]
        if (checkbox.checked == true) {
            checkedUsers.push(
                { name: name.innerHTML, id: name.id }
            )
        }
    }

    
    // Output the filtered users
    const data = {
        hostID: sessionStorage.getItem("userID"),
        hostName: sessionStorage.getItem("username"),
        users: JSON.stringify(checkedUsers),
        
    }
    if (sessionStorage.getItem("lobbyType") == "direct") {
        fetch("create/Group", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }
    var filteredUsers = checkedUsers.filter(function (user) {
        // Check if any blacklisted member has the same name as the user
        return !lobbyMembers.some(function (member) {
            return member.clientName === user.name;
        });
    });
    console.log(filteredUsers);
}

document.getElementsByClassName("submitAddGroup")[0].addEventListener("click", submitGroupChange)
loadContacts()
loadFriends()
