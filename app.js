require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const colors = require('colors');
var cookieParser = require('cookie-parser');
let handlebars = require('express-handlebars');
let session = require('express-session');
let cookieSession = require('cookie-session');
let favicon = require("serve-favicon");
const cors = require('cors');
const compression = require("compression");
const UAParser = require('ua-parser-js');
const connectDB = require("./data/config");
const app = express();
const PORT = 3000;

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flags: "a" }
);


// Define a custom token for coloring status code
morgan.token('status', (req, res) => {
    const status = res.statusCode;
    let color = status >= 500 ? 'red'    // server error
        : status >= 400 ? 'yellow' // client error
            : status >= 300 ? 'cyan'   // redirection
                : status >= 200 ? 'green'  // success
                    : 'reset';                 // default

    return colors[color](status);
});

// Define the custom morgan format
app.use(
    morgan((tokens, req, res) => {
        return [
            colors.blue(tokens.method(req, res)),
            colors.magenta(tokens.url(req, res)),
            tokens.status(req, res),
            colors.cyan(tokens['response-time'](req, res) + ' ms'),
        ].join(' ');
    })
);

app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.static('public'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(cors());
app.use(favicon(path.join(__dirname, 'public', '/icon/favicon.png')));
app.engine('hbs', handlebars.engine({
    extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/', partialsDir: __dirname + '/views/partials/', helpers: {
        ifequal: function (arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        },
        formatNumber: (number) => {
            const units = ['K', 'M', 'B', 'T', 'P', 'E'];
            let unit = '';
            let num = number;

            for (let i = units.length - 1; i >= 0; i--) {
                const size = Math.pow(1000, i + 1);
                if (number >= size) {
                    num = number / size;
                    unit = units[i];
                    break;
                }
            }

            return num.toFixed(1).replace(/\.0$/, '') + unit;
        },
        formatDate: function (dateString) {
            const date = new Date(dateString);
            const options = { weekday: 'short', month: 'short', year: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);

            const [weekday, month, year] = formattedDate.split(' ');
            return `${weekday}, ${month} ${year}`;
        }
    }
}));

// app.use(session({ secret: "@tricbskt@#]$" }));
app.use(cookieSession({
    name: 'session',
    keys: ["@tricbgrvx@#{$"],
    maxAge: 30 * 24 * 60 * 60 * 1000
}))
app.set('view engine', 'hbs');


// app.use(compression());
app.use(compression({ level: 9 }));

// Middleware to parse User-Agent
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    req.device = device;
    next();
});

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing JSON data (if needed)
app.use(express.json());

app.use('/blog/', require('./route/blog'));
app.use('/', require('./route/user'));
app.use('/auth/', require('./route/auth'));
app.use('/admin/', require('./route/admin'));

app.use("*", (req, res, next) => {
    res.status(404).send("Hmm, not found :)");
});

app.listen(PORT, connectDB(), () => {
    console.log(`🚀 Listening at http://127.0.0.1:${PORT}/`);
});