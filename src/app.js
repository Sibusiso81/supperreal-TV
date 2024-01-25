//reqquiring dependancies
require('dotenv').config();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const handlebars = require('handlebars')
const fs = require('fs');
//declaring credentials from .env 
const username = process.env.EMAIL_ID;
const password = process.env.EMAIL_PASSWORD;

//requiring express framework
const express = require('express');
const path = require('path')

//calling express function to create app
const app = express();

//Add bodyparser
app.use(bodyParser.urlencoded({ extended: false }));

//getting access to public/pages files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'pages')));

//declaring then reading and  converting html files to string
const source = fs.readFileSync('src/pages/emailrecived.html', 'utf-8').toString();
const teamSourceFile = fs.readFileSync('src/pages/emailtemplete.html', 'utf-8').toString()
//setting basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/pages/index.html'))
})
//Redirecting to applications page
app.get('/pages/application.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/pages/application.html'));
});


//creating transpoter
const transporter = nodemailer.createTransport({

  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: username,
    pass: password,
  }
});

app.post('/pages/application.html', (req, res) => {
  //compliling taplates 
  const templateOne = handlebars.compile(source);
  const responseToTeam = handlebars.compile(teamSourceFile)
  const replacements = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    text: req.body.text,
  }
  //declaring tamplates as html to be sent in mail
  const htmToSendToUser = templateOne(replacements);
  const htmlToSendToTeam = responseToTeam(replacements);
  //creating mail options for user
  const mailOptions = {
    from: username,
    to: replacements.email,
    subject: `Superreal Team:`,
    text: 'Hello World!',
    html: htmToSendToUser
  };

  //creating mail options for owner
  const mailOptionsTwo = {
    from: req.body.email,
    to: username,
    subject: `${req.body.name} Reached Out !`,
    text: 'Hello World!',
    html: htmlToSendToTeam
  };
  
  //sending mail to user and handling any errors 
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Erorr Sending email');
    } else {
      console.log('Email sent ' + info.response);

      res.status(200).sendFile(path.join(__dirname, '/pages/emailrecived.html'));
    }
  });

  //sending mail to owner and handling any errors
  transporter.sendMail(mailOptionsTwo, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Erorr Sending email');
    } else {
      res.status(200)
      console.log('Email sent ' + info.response);


    }

  });




});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on https:/localhost:${port}`);
})

