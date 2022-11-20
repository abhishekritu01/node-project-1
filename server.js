require('dotenv').config();
const express = require('express')
const app = express();
const path = require('path')
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')

const PORT = process.env.PORT || 3000



// Database connection
const url = 'mongodb://localhost:27017/pizza'
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
})
    .on('error', function (err) {
        console.log(err);
    });


// Session store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})


// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
    // cookie: { maxAge: 1000 * 10} // 24 hour
}))


//passport setting   p7
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())



app.use(flash())
//Assets 
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }))    //handle multi data from front end(url encoded)
app.use(express.json());


// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

//set Templet Engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')
require('./routes/web')(app)



app.listen(PORT, () => {
    console.log(`server is running ${PORT}`);
})