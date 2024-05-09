// laster inn all node.js modulene
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const md5 = require('md5')
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'client/userInput/profilePictures' });
// definerer porten jeg skal bruke
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on this port: ${PORT}`));
const mysql = require('mysql2');
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
// andre nødvendige kommandoer
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const path = require("path");
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + "/client/index.html"))
})

// post "/create/user/"
app.post("/create/user/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let user = req.body.user
    let passord = req.body.passord
    let hiddenPass = md5(passord)
    // legger til brukeren i users "table"
    connection.query(`INSERT INTO clients (username, password) VALUES ("${user}", "${hiddenPass}")`)
})


app.post("/change/user/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let userID = req.body.userID
    let newUser = req.body.newUser
    let oldUser = req.body.username
    connection.query(`UPDATE clients set username = "${newUser}" WHERE clientID = ${userID}`)
    connection.query(`UPDATE connections set clientName = "${newUser}" WHERE clientID = ${userID}`)

    connection.query(`UPDATE friends SET senderName = "${newUser}" WHERE senderID= ${userID}`)
    connection.query(`UPDATE friends SET recieverName = "${newUser}" WHERE recieverID= ${userID}`)
    connection.query(`UPDATE messages SET sender = "${newUser}" WHERE sender= "${oldUser}"`)
})
app.post("/change/password/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let user = req.body.user
    let password = req.body.pass
    let hiddenPass = md5(password)
    let newPass = req.body.newPassword
    let newHiddenPass = md5(newPass)
    // legger til brukeren i users "table"
    connection.query(`UPDATE clients set password = "${newHiddenPass}" WHERE username = "${user}" AND password = "${hiddenPass}"`)
})
app.post("/delete/user/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let userID = req.body.userID
    let oldUser = req.body.username

    connection.query(`UPDATE clients set username = "DELETED USER" WHERE clientID = ${userID}`)
    connection.query(`UPDATE clients set status = "DELETED" WHERE clientID = ${userID}`)
    connection.query(`UPDATE connections set clientName = "DELETED USER" WHERE clientID = ${userID}`)

    connection.query(`UPDATE friends SET senderName = "DELETED USER" WHERE senderID= ${userID}`)
    connection.query(`UPDATE friends SET recieverName = "DELETED USER" WHERE recieverID= ${userID}`)
    connection.query(`UPDATE messages SET sender = "DELETED USER" WHERE sender= "${oldUser}"`)

})
app.post("/create/request/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let user = req.body.user
    let senderID = req.body.senderID
    let senderName = req.body.senderName
    // legger til brukeren i users "table"
    connection.query(`SELECT * FROM clients WHERE username="${user}"`, (err, result, fields) => {
        let data = JSON.parse(JSON.stringify(result))
        connection.query(`INSERT INTO requests (sender, reciever, senderUsername) VALUES ("${senderID}", "${data[0].clientID}", "${senderName}")`)

    })
})

app.post("/save/bio/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let user = req.body.user
    let bio = req.body.bio
    let status = req.body.status
    // legger til brukeren i users "table"
    connection.query(`UPDATE clients SET BIO = "${bio}", status = "${status}" WHERE username = "${user}"`)
})
app.post("/decline/request/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let userID = req.body.userID
    let sender = req.body.sender
    // legger til brukeren i users "table"
    connection.query(`DELETE FROM requests WHERE reciever = "${userID}" AND sender = "${sender}"`)

})
app.post("/accept/request/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let userID = req.body.userID
    let user = req.body.user
    let sender = req.body.sender
    let senderName = req.body.senderName
    connection.query(`INSERT INTO friends (senderID, recieverID, senderName, recieverName) VALUES (${sender}, ${userID}, '${senderName}', '${user}')`)
    connection.query(`DELETE FROM requests WHERE reciever = "${userID}" AND sender = "${sender}"`)
    connection.query(`SELECT * FROM lobbies `, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        connection.query(`INSERT INTO lobbies (lobbyID, lobbyName) VALUES (${data.length + 1}, "${user}TO${senderName}")`)
        connection.query(`INSERT INTO connections (lobbyID, clientID, clientName, lobbyName) VALUES (${data.length + 1}, ${userID},' ${user}', "${user}TO${senderName}")`)
        connection.query(`INSERT INTO connections (lobbyID, clientID, clientName, lobbyName) VALUES (${data.length + 1}, ${sender}, '${senderName}', "${user}TO${senderName}")`)
    })
})
app.post("/send/message/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let lobbyID = req.body.lobbyID
    let message = req.body.message
    let sender = req.body.sender
    let userID = req.body.userID
    let pfp = req.body.pfp
    // legger til brukeren i users "table"
    connection.execute('INSERT INTO messages (lobbyID, message, sender, clientID, profile) VALUES ( ? ,  ? ,  ?, ?, ?)', [lobbyID, message, sender, userID, pfp])
})
app.post("/rename/lobby/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let lobbyID = req.body.lobbyID
    let lobbyName = req.body.lobbyName
    let username = req.body.username
    // legger til brukeren i users "table"
    connection.query(`INSERT INTO messages (lobbyID, message, sender, profile) VALUES (${lobbyID}, "${username} changed the name to '${lobbyName}'", "STATUS", "systemAdmin.png")`)
    connection.query(`UPDATE lobbies SET lobbyName = '${lobbyName}' WHERE lobbyID = ${lobbyID}`)
    connection.query(`UPDATE connections SET lobbyName = '${lobbyName}' WHERE lobbyID = ${lobbyID}`)
})
app.post("/create/Group/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let allUsers = JSON.parse(req.body.users)
    let hostID = req.body.hostID
    let hostName = req.body.hostName
    let query = ``


    let dataLength;


    connection.query(`SELECT * FROM lobbies `, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        dataLength = data.length + 1
        connection.query(`INSERT INTO lobbies (lobbyID, lobbyName, type) VALUES (${dataLength}, "groupchat", "groupchat")`)
        for (let i = 0; i < allUsers.length; i++) {
            let user = allUsers[i]
            query = `INSERT INTO connections (clientID, lobbyID, clientName, lobbyName, type) VALUES (${user.id}, ${dataLength}, '${user.name}', "groupchat", "groupchat") `
            connection.query(query, function (err, result) {
                if (err) {
                    console.error("Error executing query:", err);
                    res.status(500).send("Error executing query");
                    return;
                }
            })

        }
        query = `INSERT INTO connections (lobbyID, clientID, clientName, lobbyName, type) VALUES (${dataLength}, ${hostID}, '${hostName}', "groupchat", "groupchat")`
        connection.query(query, function (err, result) {
            if (err) {
                console.error("Error executing query:", err);
                res.status(500).send("Error executing query");
                return;
            }
        })
    })
})
app.post("/alter/Group/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let allUsers = JSON.parse(req.body.users)
    let lobbyID = req.body.lobbyID
    let groupName = req.body.groupName
    let query = ``


    for (let i = 0; i < allUsers.length; i++) {
        let user = allUsers[i]
        query = `INSERT INTO connections (clientID, lobbyID, clientName, lobbyName, type) VALUES (${user.id}, ${lobbyID}, '${user.name}', "${groupName}", "groupchat") `
        connection.query(query)
        connection.query(`INSERT INTO messages (lobbyID, message, sender) VALUES ( ${lobbyID} ,  "${user.name} joined the group" ,  "STATUS" )`)

    }
})
app.post("/delete/group/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let lobbyID = req.body.lobbyID
    let query = `UPDATE lobbies SET type="DELETED" WHERE lobbyID = ${lobbyID}`
    connection.query(query)
    connection.query(`UPDATE connections SET type="DELETED" WHERE lobbyID = ${lobbyID}`)


})
app.post("/leave/chat/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let username = req.body.username
    let lobbyID = req.body.lobbyID
    let userID = req.body.userID

    let query = `DELETE FROM connections WHERE clientID = ${userID} AND lobbyID = ${lobbyID}`
    connection.query(query)
    connection.query(`INSERT INTO messages (lobbyID, message, sender) VALUES ( ${lobbyID} ,  "${username} left the group" ,  "STATUS" )`)
})
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    let userID = req.body.userID;
    const date = new Date();
    const dateString = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/${date.getHours()}/${date.getMinutes()}/${date.getSeconds()}/${date.getMilliseconds()}`;
    
    // Here, you may process the uploaded file as needed (e.g., save it to a specific location)
    const parts = req.file.originalname.split('.');
    const extension = parts[parts.length - 1];
    const customFilename = md5(dateString) + "." + extension;

    // Set the path where the uploaded file will be saved
    const filePath = `client/userInput/profilePictures/${customFilename}`;

    // Move the uploaded file to the specified path with the custom filename
    fs.rename(req.file.path, filePath, (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).send('Error saving file');
        }

        // Update database records
        connection.query(`UPDATE clients SET PFPlink = "${customFilename}" WHERE clientID=${userID}`);
        connection.query(`UPDATE friends SET senderPFP = "${customFilename}" WHERE senderID=${userID}`);
        connection.query(`UPDATE friends SET recieverPFP = "${customFilename}" WHERE recieverID=${userID}`);
        connection.query(`UPDATE messages SET profile = "${customFilename}" WHERE clientID=${userID}`);

        // Send back the file name to the client
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