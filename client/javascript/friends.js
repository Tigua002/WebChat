// Check if the user is logged in
if (!sessionStorage.getItem("username") ) {
    // If not logged in, redirect to the login page
    window.location.assign("Login.html");
}
document.getElementsByClassName("navLink")[2].style.backgroundColor = "#b86363"

const loadFriends = async () => {
    let res = await fetch("/get/friends/" + sessionStorage.getItem("userID"), {
        method: "GET"
    })
    const friends = await res.json()

    for (let i = 0; i < friends.length; i++) {
        let friend = friends[i];
        let friendId;
        let friendName;
        let friendPFP;
        if (friend.senderName == "DELETED USER" || friend.recieverName == "DELETED USER") {
            continue;
        }
        if (sessionStorage.getItem("userID") == friend.senderID) {
            friendId = friend.recieverID
            friendName = friend.recieverName
            friendPFP = friend.recieverPFP
        } else {
            friendId = friend.senderID
            friendName = friend.senderName
            friendPFP = friend.senderPFP
            
        }
        let div = document.createElement("div")
        let pfpDiv = document.createElement("div")
        let pfp = document.createElement("img")
        let name = document.createElement("h1")

        div.setAttribute("class", "friendDiv")
        pfpDiv.setAttribute("class", "friendPFPDiv")
        pfp.setAttribute("class", "friendProfilePic")
        name.setAttribute("class", "friendName")

        pfp.setAttribute("src", "userInput/profilePictures/" + friendPFP)
        pfp.setAttribute("alt", "profile picture of " + friendName)
        name.innerHTML = friendName

        div.appendChild(pfpDiv)
        div.appendChild(name)
        pfpDiv.appendChild(pfp)

        document.getElementsByClassName("friendsHolder")[0].appendChild(div)

    }
}
loadFriends()