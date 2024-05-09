// Load all necessary Node.js modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const md5 = require('md5');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'client/userInput/profilePictures' });
const mysql = require('mysql2');

// Define the port to use
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));

// test databasen
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    database: 'webprot'
});

// connecter til databasen
connection.connect(function (err) {
    if (err) {
        console.error("Error connectiong to database: \n", err)
        return
    }
    console.log("MySQL database connected");
})
// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'client' directory
app.use(express.static("client"));

// Handle requests

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});

app.post("/create/user/", function (req, res) {
    let user = req.body.user;
    let password = req.body.passord;
    let hiddenPass = md5(password);

    // Use parameterized query to insert user
    connection.execute('INSERT INTO clients (username, password) VALUES (?, ?)', [user, hiddenPass], function(err, result) {
        if (err) {
            console.error("Error creating user:", err);
            res.status(500).send("Error creating user");
            return;
        }
        res.send("User created successfully");
    });
});
app.post("/change/user/", function (req, res) {
    let userID = req.body.userID;
    let newUser = req.body.newUser;
    let oldUser = req.body.username;

    // Use parameterized query to update username
    connection.execute('UPDATE clients SET username = ? WHERE clientID = ?', [newUser, userID], function(err, result) {
        if (err) {
            console.error("Error changing username:", err);
            res.status(500).send("Error changing username");
            return;
        }
        // Update other related tables
        connection.execute('UPDATE connections SET clientName = ? WHERE clientID = ?', [newUser, userID]);
        connection.execute('UPDATE friends SET senderName = ? WHERE senderID = ?', [newUser, userID]);
        connection.execute('UPDATE friends SET recieverName = ? WHERE recieverID = ?', [newUser, userID]);
        connection.execute('UPDATE messages SET sender = ? WHERE sender = ?', [newUser, oldUser]);
        res.send("Username changed successfully");
    });
});
app.post("/change/password/", function (req, res) {
    let user = req.body.user;
    let password = req.body.pass;
    let hiddenPass = md5(password);
    let newPass = req.body.newPassword;
    let newHiddenPass = md5(newPass);

    // Use parameterized query to update password
    connection.execute('UPDATE clients SET password = ? WHERE username = ? AND password = ?', [newHiddenPass, user, hiddenPass], function(err, result) {
        if (err) {
            console.error("Error changing password:", err);
            res.status(500).send("Error changing password");
            return;
        }
        res.send("Password changed successfully");
    });
});
app.post("/delete/user/", function (req, res) {
    let userID = req.body.userID;
    let oldUser = req.body.username;

    // Use parameterized queries to update username, status, and related tables
    connection.execute('UPDATE clients SET username = "DELETED USER", status = "DELETED" WHERE clientID = ?', [userID], function(err, result) {
        if (err) {
            console.error("Error deleting user:", err);
            res.status(500).send("Error deleting user");
            return;
        }
        // Update connections, friends, and messages
        connection.execute('UPDATE connections SET clientName = "DELETED USER" WHERE clientID = ?', [userID]);
        connection.execute('UPDATE friends SET senderName = "DELETED USER" WHERE senderID = ?', [userID]);
        connection.execute('UPDATE friends SET recieverName = "DELETED USER" WHERE recieverID = ?', [userID]);
        connection.execute('UPDATE messages SET sender = "DELETED USER" WHERE sender = ?', [oldUser]);
        res.send("User deleted successfully");
    });
});
app.post("/create/request/", function (req, res) {
    let user = req.body.user;
    let senderID = req.body.senderID;
    let senderName = req.body.senderName;

    // Use parameterized query to insert request
    connection.execute('SELECT * FROM clients WHERE username = ?', [user], function(err, result) {
        if (err) {
            console.error("Error creating request:", err);
            res.status(500).send("Error creating request");
            return;
        }
        let data = JSON.parse(JSON.stringify(result));
        connection.execute('INSERT INTO requests (sender, reciever, senderUsername) VALUES (?, ?, ?)', [senderID, data[0].clientID, senderName]);
        res.send("Request created successfully");
    });
});
app.post("/save/bio/", function (req, res) {
    let user = req.body.user;
    let bio = req.body.bio;
    let status = req.body.status;

    // Use parameterized query to update bio and status
    connection.execute('UPDATE clients SET BIO = ?, status = ? WHERE username = ?', [bio, status, user], function(err, result) {
        if (err) {
            console.error("Error saving bio:", err);
            res.status(500).send("Error saving bio");
            return;
        }
        res.send("Bio saved successfully");
    });
});
app.post("/decline/request/", function (req, res) {
    let userID = req.body.userID;
    let sender = req.body.sender;

    // Use parameterized query to delete request
    connection.execute('DELETE FROM requests WHERE reciever = ? AND sender = ?', [userID, sender], function(err, result) {
        if (err) {
            console.error("Error declining request:", err);
            res.status(500).send("Error declining request");
            return;
        }
        res.send("Request declined successfully");
    });
});
app.post("/accept/request/", function (req, res) {
    let userID = req.body.userID;
    let user = req.body.user;
    let sender = req.body.sender;
    let senderName = req.body.senderName;

    // Use parameterized queries to insert friendship, delete request, and insert into lobbies
    connection.execute('INSERT INTO friends (senderID, recieverID, senderName, recieverName) VALUES (?, ?, ?, ?)', [sender, userID, senderName, user], function(err, result) {
        if (err) {
            console.error("Error accepting request:", err);
            res.status(500).send("Error accepting request");
            return;
        }
        // Delete request
        connection.execute('DELETE FROM requests WHERE reciever = ? AND sender = ?', [userID, sender]);

        // Insert into lobbies
        connection.query('INSERT INTO lobbies (lobbyID, lobbyName) VALUES ((SELECT MAX(lobbyID) + 1 FROM lobbies), ?)', [`${user}TO${senderName}`]);
        connection.query('INSERT INTO connections (lobbyID, clientID, clientName, lobbyName) VALUES ((SELECT MAX(lobbyID) FROM lobbies), ?, ?, ?)', [userID, user, `${user}TO${senderName}`]);
        connection.query('INSERT INTO connections (lobbyID, clientID, clientName, lobbyName) VALUES ((SELECT MAX(lobbyID) FROM lobbies), ?, ?, ?)', [sender, senderName, `${user}TO${senderName}`]);

        res.send("Request accepted successfully");
    });
});
app.post("/send/message/", function (req, res) {
    let lobbyID = req.body.lobbyID;
    let message = req.body.message;
    let sender = req.body.sender;
    let userID = req.body.userID;
    let pfp = req.body.pfp;

    // Use parameterized query to insert message
    connection.execute('INSERT INTO messages (lobbyID, message, sender, clientID, profile) VALUES (?, ?, ?, ?, ?)', [lobbyID, message, sender, userID, pfp], function(err, result) {
        if (err) {
            console.error("Error sending message:", err);
            res.status(500).send("Error sending message");
            return;
        }
        res.send("Message sent successfully");
    });
});
app.post("/rename/lobby/", function (req, res) {
    let lobbyID = req.body.lobbyID;
    let lobbyName = req.body.lobbyName;
    let username = req.body.username;

    // Use parameterized queries to update lobby name and related tables
    connection.execute('INSERT INTO messages (lobbyID, message, sender, profile) VALUES (?, ?, ?, "STATUS", "systemAdmin.png")', [lobbyID, `${username} changed the name to '${lobbyName}'`, "STATUS"], function(err, result) {
        if (err) {
            console.error("Error renaming lobby:", err);
            res.status(500).send("Error renaming lobby");
            return;
        }
        connection.execute('UPDATE lobbies SET lobbyName = ? WHERE lobbyID = ?', [lobbyName, lobbyID]);
        connection.execute('UPDATE connections SET lobbyName = ? WHERE lobbyID = ?', [lobbyName, lobbyID]);
        res.send("Lobby renamed successfully");
    });
});
app.post("/create/Group/", function (req, res) {
    let allUsers = JSON.parse(req.body.users);
    let hostID = req.body.hostID;
    let hostName = req.body.hostName;

    // Use parameterized query to get the length of lobbies and insert into lobbies and connections
    connection.execute('SELECT MAX(lobbyID) + 1 AS newLobbyID FROM lobbies', function(err, result) {
        if (err) {
            console.error("Error creating group:", err);
            res.status(500).send("Error creating group");
            return;
        }
        let dataLength = result[0].newLobbyID || 1;
        connection.execute('INSERT INTO lobbies (lobbyID, lobbyName, type) VALUES (?, "groupchat", "groupchat")', [dataLength]);
        let queries = [];
        for (let i = 0; i < allUsers.length; i++) {
            let user = allUsers[i];
            queries.push(connection.execute('INSERT INTO connections (clientID, lobbyID, clientName, lobbyName, type) VALUES (?, ?, ?, "groupchat", "groupchat")', [user.id, dataLength, user.name]));
        }
        queries.push(connection.execute('INSERT INTO connections (lobbyID, clientID, clientName, lobbyName, type) VALUES (?, ?, ?, "groupchat", "groupchat")', [dataLength, hostID, hostName]));
        Promise.all(queries)
            .then(() => {
                res.send("Group created successfully");
            })
            .catch((error) => {
                console.error("Error creating group:", error);
                res.status(500).send("Error creating group");
            });
    });
});
app.post("/alter/Group/", function (req, res) {
    let allUsers = JSON.parse(req.body.users);
    let lobbyID = req.body.lobbyID;
    let groupName = req.body.groupName;
    let queries = [];

    for (let i = 0; i < allUsers.length; i++) {
        let user = allUsers[i];
        queries.push(connection.execute('INSERT INTO connections (clientID, lobbyID, clientName, lobbyName, type) VALUES (?, ?, ?, ?, "groupchat")', [user.id, lobbyID, user.name, groupName]));
        queries.push(connection.execute('INSERT INTO messages (lobbyID, message, sender, profile) VALUES (?, ?, "STATUS", "systemAdmin.png")', [lobbyID, `${user.name} joined the group`]));
    }

    Promise.all(queries)
        .then(() => {
            res.send("Group altered successfully");
        })
        .catch((error) => {
            console.error("Error altering group:", error);
            res.status(500).send("Error altering group");
        });
});
app.post("/delete/group/", function (req, res) {
    let lobbyID = req.body.lobbyID;
    // Use parameterized queries to update the lobby and connections
    connection.execute('UPDATE lobbies SET type="DELETED" WHERE lobbyID = ?', [lobbyID], function(err, result) {
        if (err) {
            console.error("Error deleting group:", err);
            res.status(500).send("Error deleting group");
            return;
        }
        connection.execute('UPDATE connections SET type="DELETED" WHERE lobbyID = ?', [lobbyID]);
        res.send("Group deleted successfully");
    });
});
app.post("/leave/chat/", function (req, res) {
    let username = req.body.username;
    let lobbyID = req.body.lobbyID;
    let userID = req.body.userID;

    // Use parameterized query to delete user from the chat and insert a leaving message
    connection.execute('DELETE FROM connections WHERE clientID = ? AND lobbyID = ?', [userID, lobbyID], function(err, result) {
        if (err) {
            console.error("Error leaving chat:", err);
            res.status(500).send("Error leaving chat");
            return;
        }
        connection.execute('INSERT INTO messages (lobbyID, message, sender, profile) VALUES (?, ?, "STATUS", "systemAdmin.png")', [lobbyID, `${username} left the group`]);
        res.send("Left chat successfully");
    });
});
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    let userID = req.body.userID;
    const date = new Date();
    const dateString = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/${date.getHours()}/${date.getMinutes()}/${date.getSeconds()}/${date.getMilliseconds()}`;
    
    const parts = req.file.originalname.split('.');
    const extension = parts[parts.length - 1];
    const customFilename = md5(dateString) + "." + extension;

    const filePath = `client/userInput/profilePictures/${customFilename}`;

    fs.rename(req.file.path, filePath, (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).send('Error saving file');
        }

        // Use parameterized query to update user profile link
        connection.execute('UPDATE clients SET PFPlink = ? WHERE clientID = ?', [customFilename, userID]);
        connection.execute('UPDATE friends SET senderPFP = ? WHERE senderID = ?', [customFilename, userID]);
        connection.execute('UPDATE friends SET recieverPFP = ? WHERE recieverID = ?', [customFilename, userID]);
        connection.execute('UPDATE messages SET profile = ? WHERE clientID = ?', [customFilename, userID]);

        res.send({ filename: customFilename });
    });
});




app.get("/users", function (req, res) {
    connection.query(`SELECT * FROM clients`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
})
app.get("/users/discovered", function (req, res) {
    connection.query(`SELECT * FROM clients WHERE status = "discoverable"`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
})



app.get('/user/:a/:b', (req, res) => {
    let password = md5(req.params.b)
    connection.query(`SELECT * FROM clients WHERE username = "${req.params.a}" AND password = "${password}"`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});

app.get('/find/user/:a', (req, res) => {
    connection.query(`SELECT * FROM clients WHERE username = "${req.params.a}" `, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});
app.get('/contacts/user/:a', (req, res) => {
    connection.query(`SELECT * FROM connections WHERE clientID = "${req.params.a}";`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});


app.get('/cont/message/:a', (req, res) => {
    connection.query(`SELECT * FROM messages WHERE lobbyID = ${req.params.a}`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});

app.get('/get/requests/:a', (req, res) => {
    connection.query(`SELECT * FROM requests WHERE reciever="${req.params.a}" `, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});
app.get('/get/friends/:a', (req, res) => {
    let query = `SELECT * FROM friends WHERE senderID="${req.params.a}" OR recieverID = "${req.params.a}" `
    connection.query(query, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});
app.get('/get/lobbyMembers/:a', (req, res) => {
    let query = `SELECT * FROM connections WHERE lobbyID="${req.params.a}"`
    connection.query(query, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});


app.use(express.static("client"))