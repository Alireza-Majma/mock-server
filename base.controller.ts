import * as express from 'express';
import * as fs from "fs";
import * as path from "path";

export default class BaseController {

    static controllers: string[];
    static restPath: {};
    datafile: string;
    idName: string;
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

    getData() {
        if (fs.existsSync(this.datafile)) {
            const data = fs.readFileSync(this.datafile, 'utf8');
            return JSON.parse(data);
        }
        return [];
    }
    saveData(data) {
        fs.writeFile(this.datafile, JSON.stringify(data, null, 4), function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    getNextAvailableID(data) {
        let maxID = 0;
        data.forEach((element, index, array) => maxID = Math.max(maxID, element[this.idName]));
        console.log('MaxId : ', maxID);
        return ++maxID;
    }

    getIntId(req) {
        return parseInt(req.params.id, 10);
    }

    findAllData(req, res, errorMessage = "Find All Books Failed") {
        try {
            const result = this.getData();
            this.onSuccess(res, result);
        } catch (error) {
            this.onError(res, errorMessage, error);
        }
    }

    findDataById(req, res, id, errorMessage = "Find Book By Id Failed") {
        try {
            const result = this.getData().filter(x => x[this.idName] === id);
            this.onSuccess(res, result);
        } catch (error) {
            this.onError(res, errorMessage, error);
        }
    }
    updateDataById(req, res, id, newObj, errorMessage = "Update By Id Failed") {
        try {
            const data = this.getData();
            const pos = data.findIndex(x => x[this.idName] === id);

            if (pos > -1) {
                data[pos] = Object.assign(data[pos], newObj);
                data[pos][this.idName] = id;
                this.saveData(data);
                this.onSuccess(res, pos);
            } else {
                this.onError(res, errorMessage, 'Record not found');
            }
        } catch (error) {
            this.onError(res, errorMessage, error);
        }
    }
    deleteDataById(req, res, id, errorMessage = "Delete By Id Failed") {
        try {
            const data = this.getData();
            const pos = data.findIndex(x => x[this.idName] === id);

            if (pos > -1) {
                data.splice(pos, 1);
            } else {
                res.sendStatus(404);
            }
            this.saveData(data);
            this.onSuccess(res, pos);
        } catch (error) {
            this.onError(res, errorMessage, error);
        }
    }
    addData(req, res, newObj, errorMessage = "Add data Failed") {
        try {
            const data = this.getData();
            newObj[this.idName] = this.getNextAvailableID(data);
            data.push(newObj);
            this.saveData(data);
            this.onSuccess(res, newObj);
        } catch (error) {
            this.onError(res, errorMessage, error);
        }
    }
    arrangeData(req, res, model, body, errorMessage = "Arrange data Failed") {
        try {
            //console.log(data);
            const data = [];
            body.forEach(item => {
                data.push(model.BuildItem(item));
            });
            this.saveData(data);
            this.onSuccess(res, data);
        } catch (error) {
            this.onError(res, errorMessage, error);
        }
    }

    initRestApi(app: express.Application, model: any, modelName: string) {
        app.route(`/api/${modelName}s`)
            .get((req, res) => this.findAllData(req, res, `Find All ${modelName} Failed`));
        app.route(`/api/${modelName}s/:id`)
            .get((req, res) => this.findDataById(req, res, this.getIntId(req), `Find ${modelName} By Id Failed`));
        app.route(`/api/${modelName}s/:id`)
            .delete((req, res) => this.deleteDataById(req, res, this.getIntId(req), `Delete ${modelName} By Id Failed`));
        app.route(`/api/${modelName}s/:id`)
            .put((req, res) => this.updateDataById(req, res, this.getIntId(req), model.BuildItem(req.body),
                `Update ${modelName} By Id Failed`));
        app.route(`/api/${modelName}s`)
            .post((req, res) => this.addData(req, res, model.BuildItem(req.body), `Add ${modelName} Failed`));
        app.route(`/api/arrange/${modelName}s`)
            .post((req, res) => this.arrangeData(req, res, model,req.body, `Arrange ${modelName} Failed`));

        BaseController.restPath[modelName + ' Controller'] = [
            `get     => /api/${modelName}s  ,Find All ${modelName}`,
            `get     => /api/${modelName}s/:id ,Find ${modelName} by id`,
            `delete => /api/${modelName}s/:id ,Delete ${modelName}by id`,
            `putt    => /api/${modelName}s/:id ,Update ${modelName}by id`,
            `post    => /api/${modelName}s , Add new ${modelName}`,
            `post    => /api/arrange/${modelName}s ,Arrange ${modelName} data with passed data`
        ];
    }

    static initControllers(app: express.sApplication, folderModel = "./app/models",folderData = "./data/") {
        BaseController.controllers = BaseController.controllers || [];
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
                    const modelName = model[p].name;
                    if (typeof model[p] === "function" && fullName.toLowerCase().indexOf(modelName.toLowerCase()) > -1 ) {
                        if (BaseController.controllers.filter(c => c === modelName).length > 0) {
                            console.log(`Controller "${p}" allready loaded , file name: ${fullName} `);
                        } else {
                            BaseController.controllers.push(modelName);
                            if (typeof model[p]['BuildItem'] === "function") {
                                const ctrl = new BaseController();
                                const modelInstance = model[p].BuildItem({});
                                ctrl.idName = Object.keys(modelInstance)[0];
                                ctrl.datafile = `${folderData}${modelName.toLowerCase()}s.json`;
                                console.log(`Initialize Controller for Model :"${modelName}" id Name : ${ctrl.idName}`);
                                ctrl.initRestApi(app, model[p], modelName);
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
}
