import * as express from "express";
import * as bodyParser from "body-parser";
import BaseController from "./base.controller";

import * as path from "path";
import * as favicon from "serve-favicon";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
 import * as cors from "cors";

const port = '8808';
const app: express.Application = express();
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
app.set('port', port);
app.use(favicon(path.join(__dirname, './favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
const corsOption: cors.CorsOptions = {
    origin: "http://localhost:" + app.get('port'),
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,HEAD,OPTIONS'
};
app.use(cors(corsOption));

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("***************************************");
    console.log("Hello Meadelware executed. <=======>");
    console.log(req.body);
    console.log(new Date(), req.method, req.url);
    console.log("**************************************");
    next();
});

BaseController.initControllers(app,"./app/models","./data/");

app.use((err: express.ErrorRequestHandler, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("API Error Hanler trigered", err);
    const errorObject = {
        errorCode: 'ERR-101',
        message: 'Internal ServerError'
    };
    res.status(500).json(errorObject);
});
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("***************************************");
    console.log("By By Meadelware executed.");
    console.log(new Date(), req.method, req.url);
    res.send();
});
app.listen(app.get('port'));
console.log(`server is running on port ${app.get('port')} Loaded Controlers :${BaseController.controllers.join()}`);
