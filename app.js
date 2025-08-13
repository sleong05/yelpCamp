if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const express = require('express');
const User = require('./models/user')
const ExpressError = require('./utils/expressError')
const mongoose = require('mongoose');
const path = require('path');
const methodOveride = require('method-override')
const ejsMate = require('ejs-mate')
const flash = require('connect-flash')
const passport = require('passport');
const localStrategy = require('passport-local')
const helmet = require("helmet")
const campgroundRoutes = require('./routes/campgrounds.js')
const reviewRoutes = require('./routes/reviews.js')
const userRoutes = require('./routes/users.js')
const session = require('express-session')

const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL;
// const dbUrl = 'mongodb://localhost:27017/yelpCamp'
mongoose.connect(dbUrl)
    .then(() => { console.log("connected"); })
    .catch(err => {
        console.log("Error connecting to database");
        console.log(err);
    });

const app = express();

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];

app.engine('ejs', ejsMate)
app.set('query parser', 'extended');
app.use(sanitizeV5({ replaceWith: '_' }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.urlencoded({ extended: true }));
app.use(methodOveride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dqsojznwk/",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
                "https://www.nps.gov/",
                "https://*.nps.gov/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET,
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: "session",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(session(sessionConfig))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

app.get("/home", (req, res) => {
    res.render('home.ejs')
})
app.use('/', userRoutes)
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong"
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log("serving")
})