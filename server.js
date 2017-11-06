var express = require("express");
var bodyParser = require("body-parser");
var base_controller_1 = require("./base.controller");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var cors = require("cors");
console.log('Initialze Server...');
var corsOrigin = '"http://localhost:/4200"';
var port = '8808';
var app = express();
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
app.set('port', port);
app.use(favicon(path.join(__dirname, './favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
var corsOption = {
    origin: corsOrigin,
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,HEAD,OPTIONS'
};
app.use(cors(corsOption));
app.use(function (req, res, next) {
    console.log("***************************************");
    console.log("Hello Meadelware executed. <=======>");
    console.log(req.body);
    console.log(new Date(), req.method, req.url);
    console.log("**************************************");
    next();
});
base_controller_1["default"].initControllers(app, "./schema", "./data/");
app.use(function (err, req, res, next) {
    console.log("API Error Hanler trigered", err);
    var errorObject = {
        errorCode: 'ERR-101',
        message: 'Internal ServerError'
    };
    res.status(500).json(errorObject);
});
app.use(function (req, res, next) {
    console.log("***************************************");
    console.log("By By Meadelware executed.");
    console.log(new Date(), req.method, req.url);
    res.send();
});
app.listen(app.get('port'));
console.log("server is running on port " + app.get('port') + " Loaded Controlers :" + Object.keys(base_controller_1["default"].controllers).join());
