import { FileRepository, RepositoryResult } from './file_repository';
import * as jwt from  'jwt-simple';
import * as express from 'express';
import * as fs from "fs";
import * as path from "path";
import { User } from './schema/user';
import { BaseController } from './base_controller';

var bcrypt = require('bcrypt-nodejs')
export class SecurityController {
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

    static initSecurityControllers(app: express.Application ) {
        app.route(`/api/register`)
        .post((req, res) => {
            var userData = req.body
            var user = User.BuildItem(userData);
    
            console.log('call register', user.name);
            const ctrl = BaseController.getController(User);
            if (ctrl) {
                const newUser = <User>ctrl.model['BuildItem'](req.body);
                bcrypt.hash(newUser.password, null, null, (err, hash) => {
                    if (err) {
                        ctrl.onError(res, `Validate Password User ${ctrl.model.name} Failed`, err);
                    } else {
                        newUser.password = hash;
                        const rslt: RepositoryResult = ctrl.repository.addData(newUser);
                        if (rslt.error) {
                            ctrl.onError(res, `Register User ${ctrl.model.name} Failed`, rslt.error);
                        } else {
                            const token = SecurityController.createToken(newUser);
                            ctrl.onSuccess(res, { token });
                        }
                    }
                })
            }
        });

        app.route(`/api/login`)
        .post((req, res) => {
            var loginData = req.body;
            console.log('call login', loginData.name);
            const ctrl = BaseController.getController(User);
            console.log('After get Controller');
            if (!ctrl) {
                ctrl.onError(res, `Internal Error User controller was not found`, loginData.name);
                return;
            }
    
            console.log(ctrl.idName);
            const allUsers = ctrl.repository['getData']();
            const theUser = allUsers.find(x => x.name.toLowerCase() == loginData.name.toLowerCase());
            if (!theUser || theUser['name'] != loginData.name) {
                ctrl.onError(res, `User was not found`, loginData.name);
                return;
            }
    
            bcrypt.compare(loginData.password, theUser['password'], (err, isMatch) => {
                if (isMatch) {
                    const token = BaseController.createToken(theUser);
                    ctrl.onSuccess(res, theUser);
                } else {
                    ctrl.onError(res, `Email or Password invalid`, err);
                }
            })
        });
    
    }
    static createToken(user) {
        var payload = { sub: user.id.toString() };
        var token = jwt.encode(payload, '123');
        console.log('send back to client', token);
        return token;
    }
}
