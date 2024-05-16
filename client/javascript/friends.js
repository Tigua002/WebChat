// Check if the user is logged in
if (!sessionStorage.getItem("username")) {
    // If not logged in, redirect to the login page
    window.location.assign("Login.html");
}

// Set background color for the third element with class "navLink"
document.getElementsByClassName("navLink")[2].style.backgroundColor = "#b86363";

// Define an asynchronous function to load friends
const loadFriends = async () => {
    // Fetch friends data for the logged-in user
    let res = await fetch("/get/friends/" + sessionStorage.getItem("userID"), {
        method: "GET"
    });
    // Parse the response as JSON
    const friends = await res.json();

    // Iterate through the list of friends
    for (let i = 0; i < friends.length; i++) {
        let friend = friends[i];
        let friendId;
        let friendName;
        let friendPFP;
        
        // Skip if the friend is a "DELETED USER"
        if (friend.senderName == "DELETED USER" || friend.recieverName == "DELETED USER") {
            continue;
        }
        
        // Determine friend details based on whether the user is the sender or receiver
        if (sessionStorage.getItem("userID") == friend.senderID) {
            friendId = friend.recieverID;
            friendName = friend.recieverName;
            friendPFP = friend.recieverPFP;
        } else {
            friendId = friend.senderID;
            friendName = friend.senderName;
            friendPFP = friend.senderPFP;
        }

        // Create HTML elements for displaying friend information
        let div = document.createElement("div");
        let pfpDiv = document.createElement("div");
        let pfp = document.createElement("img");
        let name = document.createElement("h1");

        // Set attributes for the created elements
        div.setAttribute("class", "friendDiv");
        pfpDiv.setAttribute("class", "friendPFPDiv");
        pfp.setAttribute("class", "friendProfilePic");
        name.setAttribute("class", "friendName");

        // Set image source and alt text for the profile picture
        pfp.setAttribute("src", "userInput/profilePictures/" + friendPFP);
        pfp.setAttribute("alt", "profile picture of " + friendName);
        name.innerHTML = friendName;

        // Append elements to the DOM
        div.appendChild(pfpDiv);
        div.appendChild(name);
        pfpDiv.appendChild(pfp);

        document.getElementsByClassName("friendsHolder")[0].appendChild(div);
    }
};

// Call the function to load friends when the page is loaded
loadFriends();
