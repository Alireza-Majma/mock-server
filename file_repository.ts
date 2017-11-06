import * as fs from "fs";
import * as path from "path";

export interface RepositoryResult {
     data?: any, 
     error?: any
}

export class FileRepository {

    datafile: string;
    idName: string;
    model: any;
    constructor() {
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

    findAllData(): RepositoryResult {
        const rslt: RepositoryResult = {};
        try {
            const data = this.getData();
            rslt.data = data;
        } catch (error) {
            rslt.error = error;
        }
        return rslt;
    }

    findDataById(id): RepositoryResult {
        const rslt: RepositoryResult = {data : {}};
        try {
            const data = this.getData().find(x => x[this.idName] === id);
            if (data){
                rslt.data = this.model['BuildItem'](data);
            } else {
                rslt.error = 'Data not found in database,  Model:' + this.model+', id:'+id;
            }
            } catch (error) {
               rslt.error = error;
               console.log( 'Error on find data, Model:' + this.idName+', id:'+id);
            }
        return rslt;
    }
    updateDataById(id, newObj) : RepositoryResult{
        newObj[this.idName] = id;
       return  this.addData(newObj);
    }
    
    deleteDataById(id): RepositoryResult {
        const rslt: RepositoryResult = {};
        try {
            const data = this.getData();
            let pos = data.findIndex(x => x[this.idName] === id);

            while (pos > -1) {
                data.splice(pos, 1);
                pos = data.findIndex(x => x[this.idName] === id);
            } 
            this.saveData(data);
            rslt.data = data;
        } catch (error) {
            rslt.error = error;
        }
        return rslt;
    }
    addData(newObj): RepositoryResult {
        const rslt: RepositoryResult = {};
        try {
            const data = this.getData();
            var id = newObj[this.idName];
            if (id) {
                // try to delete any item with this id
                let pos = data.findIndex(x => x[this.idName] === id);
                while (pos > -1) {
                    data.splice(pos, 1);
                    pos = data.findIndex(x => x[this.idName] === id);
                }
            } else{
                newObj[this.idName] = this.getNextAvailableID(data);
            }
            data.push(newObj);
            this.saveData(data);
            rslt.data = data;
        } catch (error) {
            rslt.error =  error;
        }
        return rslt;
    }
    arrangeData(model, body) {
        const rslt: RepositoryResult = {};
        try {
            //console.log(data);
            const data = [];
            body.forEach(item => {
                data.push(model.BuildItem(item));
            });
            this.saveData(data);
            rslt.data = data;
        } catch (error) {
            rslt.error = error;
        }
        return rslt;
    }
}
