// laster inn all node.js modulene
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const md5 = require('md5')
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


// app.post("/change/user/", function (req, res) {
//     // skaffer user og passord fra data-en og gir dem en verdi
//     let oldUser = req.body.oldUser
//     let newUser = req.body.newUsername
//     let password = req.body.pass
//     let hiddenPass = md5(password)
//     // legger til brukeren i users "table"
//     connection.query(`UPDATE clients set username = "${newUser}" WHERE username = "${oldUser}" AND password = "${hiddenPass}"`)
//     connection.query(`ALTER TABLE ${oldUser}connections RENAME TO ${newUser}connections`)
// })
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
// app.post("/delete/user/", function (req, res) {
//     // skaffer user og passord fra data-en og gir dem en verdi
//     let oldUser = req.body.oldUser
//     let password = req.body.pass
//     let hiddenPass = md5(password)
//     // legger til brukeren i users "table"
//     connection.query(`UPDATE clients set username = "DELETED USER", status = "DELETED" WHERE username = "${oldUser}" AND password = "${hiddenPass}"`)
// })
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
    // legger til brukeren i users "table"
    connection.query(`INSERT INTO messages (lobbyID, message, sender) VALUES (${lobbyID}, '${message}', '${sender}')`)
})
app.post("/rename/lobby/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let lobbyID = req.body.lobbyID
    let lobbyName = req.body.lobbyName

    // legger til brukeren i users "table"

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
    let query = ``


    for (let i = 0; i < allUsers.length; i++) {
        let user = allUsers[i]
        query = `INSERT INTO connections (clientID, lobbyID, clientName, lobbyName, type) VALUES (${user.id}, ${lobbyID}, '${user.name}', "groupchat", "groupchat") `
        connection.query(query)

    }
})
app.post("/delete/group/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let lobbyID = req.body.lobbyID



    
    let query = `UPDATE lobbies SET type="DELETED" WHERE lobbyID = ${lobbyID}`
    connection.query(query)
    connection.query(`UPDATE connections SET type="DELETED" WHERE lobbyID = ${lobbyID}`)


})



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