const expressSession = require('express-session')
const mongodbstore =require('connect-mongodb-session')

function sessionstore(){
    const Mongodbstore =mongodbstore(expressSession)

    const store = new Mongodbstore({
    uri: 'mongodb://127.0.0.1:27017',
    databaseName: 'fakebook',
    collection: 'sessions'
    })

    return store
}

function sessionconfig(){
    return{
    secret: 'secret-tefa',
    resave: false,
    saveUninitialized: false,
    store: sessionstore(),
    cookie: {
      maxAge: 2 * 24 * 60 * 60 * 1000
    }
    }
}

module.exports= sessionconfig