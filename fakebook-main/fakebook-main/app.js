const express = require('express')
const path = require('path');
const csrf = require('csurf')

const app = express()

const errorMiddleware = require('./middelwares/errorHandler')
const routeguard = require('./middelwares/route-guard')
const checkauth= require('./middelwares/check-auth')
const expressSession = require('express-session');
const db =require('./data/database')
const sessionconfig =require('./config/session')
const sessionconfigfunction = sessionconfig()  
const csrfmiddleware = require('./middelwares/csrftoken')
const authroutes =require('./routes/auth.routes')


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/users_img', express.static(path.join(__dirname, 'users_img')));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false  }));
app.use(express.static('users_img'));



app.use(expressSession(sessionconfigfunction))
 
app.use(csrf());

app.use(csrfmiddleware);
app.use(checkauth)

app.use(errorMiddleware)


app.use(authroutes)


db.connectToDatabase()
  .then(function () {
    app.listen(3000);
  })
  .catch(function (error) {
    console.log('Failed to connect to the database!');
    console.log(error);
  });