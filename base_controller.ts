import { FileRepository, RepositoryResult } from './file_repository';
import * as jwt from  'jwt-simple';
import * as express from 'express';
import * as fs from "fs";
import * as path from "path";
import { User } from './schema/user';
var bcrypt = require('bcrypt-nodejs')
export interface ResultMethod {
    ctrl: BaseController, 
    res,
     data?: any, 
     error?: any
}

export class BaseController {

    static controllers: {};
    static restPath: {};
    idName: string;
    model: any;
    repository : FileRepository;
    constructor() {
    }

    onSuccess(res: express.Response, data: any) {
        res.status(200).json(data);
    }

    onError(res: express.Response, message: string, err: any) {
        console.error("Promise chain error ", message, err);
        res.status(500).send();
    }

    databaseErrorHandler(err: any, res: express.Response, message: string) {
        console.error(`<<<<<<<<<< ${message} >>>>>>>>>`);
        console.error("Database error occurred ", err);
        res.status(500).json({
            message: message
        });
    }

    getIntId(req) {
        return parseInt(req.params.id, 10);
    }
    wrapperSend(rslt : RepositoryResult,req, res) {
        if (rslt.error){
            this.onError(res,  `Method ${this.model.name} Failed`, rslt.error);
        } else{
            this.onSuccess(res, rslt.data);
        }
    }

     initRestApi(app: express.Application, ctrl: BaseController) {
         console.log('initRestApi for'+ ctrl.model.name);
        app.route(`/api/${ctrl.model.name}s`)
            .get((req, res) =>this.wrapperSend(this.repository.findAllData(), req, res));
        app.route(`/api/${ctrl.model.name}s/:id`)
            .get((req, res) => this.wrapperSend(this.repository.findDataById(this.getIntId(req)),req, res));
        app.route(`/api/${ctrl.model.name}s/:id`)
            .delete((req, res) => this.wrapperSend(this.repository.deleteDataById(this.getIntId(req)),req, res));
        app.route(`/api/${ctrl.model.name}s/:id`)
            .put((req, res) => this.wrapperSend(this.repository.updateDataById(this.getIntId(req), ctrl.model['BuildItem'](req.body,BaseController)),req, res));
        app.route(`/api/${ctrl.model.name}s`)
            .post((req, res) => this.wrapperSend(this.repository.addData(ctrl.model['BuildItem'](req.body, BaseController)),req, res));
        app.route(`/api/arrange/${ctrl.model.name}s`)
            .post((req, res) => this.wrapperSend(this.repository.arrangeData(ctrl.model, req.body),req, res));

        BaseController.restPath[ctrl.model.name + ' Controller'] = [
            `get     => /api/${ctrl.model.name}s  ,Find All ${ctrl.model.name}`,
            `get     => /api/${ctrl.model.name}s/:id ,Find ${ctrl.model.name} by id`,
            `delete => /api/${ctrl.model.name}s/:id ,Delete ${ctrl.model.name}by id`,
            `putt    => /api/${ctrl.model.name}s/:id ,Update ${ctrl.model.name}by id`,
            `post    => /api/${ctrl.model.name}s , Add new ${ctrl.model.name}`,
            `post    => /api/arrange/${ctrl.model.name}s ,Arrange ${ctrl.model.name} data with passed data`
        ];
    }

    static initControllers(app: express.sApplication, folderModel = "./schema", folderData = "./data/") {
        BaseController.controllers  = BaseController.controllers || {};
        BaseController.restPath = BaseController.restPath || {};
        const startFolder = path.basename(folderModel);
        console.log(folderModel);
        fs.readdirSync(folderModel).forEach((file) => {

            const fullName = path.join(folderModel, file);
            const stat = fs.lstatSync(fullName);
            // const ext = file.substring(file.length - 13).toLowerCase();
            if (stat.isFile()) {
                // Load the Model file and build a controller and pass the app to it
                const model = require(path.join(__dirname, fullName));
                for (const p in model) {
                    const modelName: string = model[p].name;
                    if (typeof model[p] === "function" && fullName.toLowerCase().indexOf(modelName.toLowerCase()) > -1) {
                        if (!!BaseController.controllers[modelName]) {
                            console.log(`Controller "${p}" allready loaded , file name: ${fullName} `);
                        } else {
                            if (typeof model[p]['BuildItem'] === "function") {
                                const ctrl = new BaseController();
                                BaseController.controllers[modelName] = ctrl;
                                ctrl.model = model[p];
                                const modelInstance = model[p].BuildItem({},BaseController);
                                ctrl.idName = Object.keys(modelInstance)[0];
                                ctrl.repository = new FileRepository();
                                ctrl.repository.datafile = `${folderData}${modelName.toLowerCase()}s.json`;
                                ctrl.repository.model = ctrl.model;
                                ctrl.repository.idName = ctrl.idName ;
                                console.log(`Initialize Controller for Model :"${modelName}" id Name : ${ctrl.idName}`);
                                ctrl.initRestApi(app, ctrl);
                            }
                            else {
                                console.log(`Model :"${modelName}" is not implimented IBuildItem`);
                            }
                        }
                    }
                }
            }
        });
        app.route("*").get((req, res) => res.status(200).json(BaseController.restPath));
    }
    static getController(model: any): BaseController{
        const controllerName = model.name;
        console.log('Try to find Controller:'+controllerName );
        return BaseController.controllers[controllerName];
    }
    static BuildItemById<T>(model: any, id:number): T {
        const ctrl = BaseController.getController(model);
        if (ctrl){
            return <T>ctrl.repository.findDataById( id);    
        } else {
            // console.log(`Loaded Controlers :${Object.keys(BaseController.controllers).join()}`);
            // console.log('Controller not found:'+controllerName+', id:'+ id );
            return <T>{};
        }
    }

    static createToken(user) {
        var payload = { sub: user.id.toString() };
        var token = jwt.encode(payload, '123');
        console.log('send back to client', token);
        return token;
    }
}
