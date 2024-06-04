NODE:

 Instalering:
  kjør "nodeBash.sh" filen i en ubuntu maskin.
  
 NPM: 
  npm i express body-parser path mysql2 md5 fs multer nodemailer dotenv

MYSQL:

CREATE TABLE clients (
 username VARCHAR(70),
 password VARCHAR(70), 
 lastChat VARCHAR(100), 
 BIO longtext, 
 status varchar(50) DEFAULT 'hidden', 
 clientID INT PRIMARY KEY auto_increment, 
 PFPlink VARCHAR(255) default 'catImage.png', 
 senderPFP VARCHAR(255) default 'catImage.png', 
 recieverPFP VARCHAR(255) default 'catImage.png'
);

CREATE TABLE connections (
 lobbyID int,
 clientID int,
 clientName VARCHAR(255),
 lobbyName VARCHAR(255),
 type VARCHAR(255) DEFAULT 'direct',
 PFP VARCHAR(255) DEFAULT 'catImage.png'
);


CREATE TABLE friends (senderID int,
 recieverID int,
 senderName VARCHAR(255),
 recieverName VARCHAR(255)
 );

CREATE TABLE lobbies (lobbyID int PRIMARY KEY auto_increment,
 lobbyName varchar(255),
 type VARCHAR(255) default 'direct'
 );

CREATE TABLE messages (lobbyID int,
 message LONGTEXT,
 sender VARCHAR(255),
 messageID int PRIMARY KEY auto_increment,
 profile VARCHAR(255) DEFAULT 'catImage.png'
 clientID INT,
 type VARCHAR(100) DEFAULT 'TEXT'
 );

CREATE TABLE requests (sender VARCHAR(100),
 reciever varchar(100),
 senderUsername VARCHAR(100),
 senderPFP VARCHAR(255) DEFAULT 'catImage.png'
 );
