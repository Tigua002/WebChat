// laster inn all node.js modulene
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const md5 = require('md5')
// definerer porten jeg skal bruke
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on this port: ${PORT}`));
const mysql = require('mysql');
// test databasen
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'server',
    password: 'serverpass',
    database: 'WebChat'
});

// connecter til databasen
connection.connect();
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


    connection.query(`CREATE TABLE ${user}Connections (initiator VARCHAR(100), accepter VARCHAR(100), initiatorID INT, accepterID INT)`)



})


app.post("/change/user/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let oldUser = req.body.oldUser
    let newUser = req.body.newUsername
    let password = req.body.pass
    let hiddenPass = md5(password)
    // legger til brukeren i users "table"
    connection.query(`UPDATE clients set username = "${newUser}" WHERE username = "${oldUser}" AND password = "${hiddenPass}"`)
    connection.query(`ALTER TABLE ${oldUser}connections RENAME TO ${newUser}connections`)
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
    let oldUser = req.body.oldUser
    let password = req.body.pass
    let hiddenPass = md5(password)
    // legger til brukeren i users "table"
    connection.query(`UPDATE clients set username = "DELETED USER", status = "DELETED" WHERE username = "${oldUser}" AND password = "${hiddenPass}"`)
})
app.post("/create/request/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let user = req.body.user
    let ReqUser = req.body.requestedUser
    let senderID = req.body.senderID
    // legger til brukeren i users "table"
    connection.query(`INSERT INTO requests (sender, reciever, senderID) VALUES ("${user}", "${ReqUser}", ${senderID})`)
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
    let user = req.body.user
    let sender = req.body.sender
    // legger til brukeren i users "table"
    connection.query(`DELETE FROM requests WHERE reciever = "${user}" AND sender = "${sender}"`)
})
app.post("/accept/request/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let user = req.body.user
    let sender = req.body.sender

    // legger til brukeren i users "table"
    connection.query(`DELETE FROM requests WHERE reciever = "${user}" AND sender = "${sender}"`)
    connection.query(`CREATE TABLE ${sender}TO${user} (message LONGTEXT, messageID INT auto_increment PRIMARY KEY, sender VARCHAR(50))`)
    connection.query(`INSERT INTO ${user}Connections (initiator, accepter) VALUES ("${sender}", "${user}")`)
    connection.query(`INSERT INTO ${sender}Connections (initiator, accepter) VALUES ("${sender}", "${user}")`)
})
app.post("/send/message/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let initiator = req.body.init
    let accepter = req.body.acce
    let sender = req.body.sender
    let message = req.body.message
    // legger til brukeren i users "table"
    connection.query(`INSERT INTO ${initiator}TO${accepter} (message, sender) VALUES ("${message}", "${sender}")`)
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
    connection.query(`SELECT * FROM ${req.params.a}connections`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});




app.get('/cont/message/:a/:b', (req, res) => {
    connection.query(`SELECT * FROM ${req.params.a}To${req.params.b} `, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});

app.get('/get/requests/:a', (req, res) => {
    connection.query(`SELECT * FROM requests WHERE reciever = "${req.params.a}" `, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});
app.use(express.static("client"))