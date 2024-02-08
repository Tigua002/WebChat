if (sessionStorage.getItem("username") && sessionStorage.getItem("userID")) {
    document.getElementById("accLink").innerHTML = "Account"
}

var form = document.getElementsByClassName("NCholder")[0];
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

async function addContact(paramUser) {
    let requestedUser = paramUser || document.getElementById("usernameInput").value
    if (requestedUser == sessionStorage.getItem("username")) {
        alert("Can't send a request to yourself sorry")
        return
    } else if (requestedUser == "DELETED USER") {
        alert("You are using a reserved keyword, can't send a message to this user")
        return
    }
    // requests the database for all info about the users    
    const responce = await fetch("find/user/" + requestedUser,
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database
    const user = await responce.json()
    if (user.length <= 0) {
        alert("Can't find user")
        return
    } else if (user.length > 1) {
        alert("We have ran into a server side error, sorry for the inconvenience")
        return
    }
    // sets user and password the user inputs
    const data = {
        user: sessionStorage.getItem("username"),
        requestedUser: requestedUser,
        senderID: sessionStorage.getItem("userID")
    }
    // sends the data to the database
    fetch("/create/request", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    alert("success")
}

async function loadRequests() {
    // requests the database for all info about the users    
    const responce = await fetch("get/requests/" + sessionStorage.getItem("username"),
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database
    const requests = await responce.json()

    for (let i = 0; i < requests.length; i++) {
        let element = document.getElementsByClassName("contactRequests")[0]
        let holder = document.createElement("div")
        let title = document.createElement("h1")
        let BtnDiv = document.createElement("div")
        let accBtn = document.createElement("h1")
        let decBtn = document.createElement("h1")

        holder.setAttribute("class", "request")
        title.setAttribute("class", "requestUsername")
        BtnDiv.setAttribute("class", "requestBtns")
        accBtn.setAttribute("class", "acceptRequest")
        decBtn.setAttribute("class", "declineRequest")

        element.appendChild(holder)
        holder.appendChild(title)
        holder.appendChild(BtnDiv)
        BtnDiv.appendChild(accBtn)
        BtnDiv.appendChild(decBtn)

        title.innerHTML = requests[i].sender
        accBtn.innerHTML = "&#10003;"
        decBtn.innerHTML = "&#88;"

        accBtn.setAttribute("onClick", "acceptReq('" + requests[i].sender + "')")
        decBtn.setAttribute("onClick", "declineReq('" + requests[i].sender + "')")


    }
}

async function declineReq(sender) {
    // sets user and password the user inputs
    const data = {
        user: sessionStorage.getItem("username"),
        sender: sender
    }
    // sends the data to the database
    fetch("/decline/request", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    alert("success")
}

async function acceptReq(sender,) {
    // sets user and password the user inputs
    const data = {
        user: sessionStorage.getItem("username"),
        sender: sender,

    }
    // sends the data to the database
    fetch("/accept/request", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    alert("success")
    let element = document.getElementsByClassName("requestUsername")
    for (let i = 0; i < element.length; i++) {
        if (element[i].innerHTML == sender) {
            element[i].parentElement.remove()
        }
    }
}

async function loadDiscoveries() {
    // requests the database for all info about the users    
    const responce = await fetch("/users/discovered",
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database    
    const user = await responce.json()
    let username = sessionStorage.getItem("username")
    // requests the database for all info about the users    
    const res = await fetch("/contacts/user/" + username,
        {
            method: "GET"
        })
    // sets user as the value we recieve from the database
    const contacts = await res.json()
    for (let i = 0; i < user.length; i++) {
        let element = document.getElementsByClassName("discoverHolder")[0]

        let div = document.createElement("div")
        let title = document.createElement("h1")
        let description = document.createElement("h1")
        let headerHolder = document.createElement("div")
        let button = document.createElement("h1")

        button.setAttribute("class", "discoverAdd")
        headerHolder.setAttribute("class", "headerHolder")
        div.setAttribute("class", "discoveredUser")
        title.setAttribute("class", "discoverName")
        description.setAttribute("class", "discoverTitle")

        title.innerHTML = user[i].username
        description.innerHTML = user[i].BIO
        button.innerText = "ADD USER"
        button.addEventListener("click", () => {
            addContact(user[i].username)
        })

        div.appendChild(headerHolder)
        headerHolder.appendChild(title)
        headerHolder.appendChild(button)
        div.appendChild(description)

        element.appendChild(div)
        for (let x = 0; x < contacts.length; x++) {
            if (user[i].username == contacts[x].accepter || user[i].username == contacts[x].initiator || user[i].username == sessionStorage.getItem("username")) {
                div.remove()
            }            
        }
    }
}


document.getElementById("discoverBtn").addEventListener("click", loadDiscoveries)

loadRequests()
