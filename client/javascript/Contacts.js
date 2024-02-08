if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    document.getElementById("accLink").innerHTML = "Account"
} else {
    window.location.assign("Login.html")
}

async function loadContacts() {
    let user = sessionStorage.getItem("username")
    // requests the database for all info about the users    
    const responce = await fetch("/contacts/user/" + user,
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database
    const users = await responce.json()
    for (let i = 0; i < users.length; i++) {
        let div = document.createElement("div")
        div.setAttribute("class", "Contact")

        let title = document.createElement("h1")
        title.setAttribute("class", "contactTitle")
        if (users[i].initiator == user) {
            title.innerHTML = users[i].accepter
        } else if (users[i].accepter == user) {
            title.innerHTML = users[i].initiator
        }
        div.appendChild(title)
        let element = document.getElementsByClassName("contactDiv")[0]
        element.appendChild(div)

        div.addEventListener("click", () => {
            loadMessages(users[i].initiator, users[i].accepter)
        })
    }

}
async function loadMessages(initiator, accepter) {
    document.getElementsByClassName("messages")[0].innerHTML = ""
    // requests the database for all info about the users    
    const responce = await fetch("/cont/message/" + initiator + "/" + accepter,
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database
    const messages = await responce.json()
    sessionStorage.setItem("messages", JSON.stringify(messages))
    let name;
    if (initiator == sessionStorage.getItem("username")) {
        name = accepter
    } else if (accepter == sessionStorage.getItem("username")) {
        name = initiator
    }
    sessionStorage.setItem("chatter", name)
    sessionStorage.setItem("init", initiator)
    sessionStorage.setItem("acce", accepter)
    let titles = document.getElementsByClassName("contactTitle")
    for (let i = 0; i < titles.length; i++) {
        if (titles[i].innerHTML == name) {
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
        sendMessage(initiator, accepter)
    })
}

async function sendMessage(initiator, accepter) {
    let TextMessage = document.getElementById("personalMessage").value
    if (TextMessage == "") {
        return
    }
    // sets user and password the user inputs
    const data = {
        init: initiator,
        acce: accepter,
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
    const responce = await fetch("/cont/message/" + sessionStorage.getItem("init") + "/" + sessionStorage.getItem("acce"),
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


document.getElementById("sendIcon").addEventListener("click", sendMessage)
loadContacts()
