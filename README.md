This Mock Server help to create fast a new Rest API for development or testing
It create following Endponts for each model: 

Just a Model file should be created that contains a class with the name of file
this class have to has a BuildItem method
Sample Model

export class Letter {
    letterID: number;
    title: string;
    body: string;
    
    static BuildItem(obj): Letter {
        return {
            letterID: obj.letterID,
            title: obj.title,
            body: obj.body
        };
    }
}

It create following Endponts for each model: 

"get => /api/Letters ,Find All Letter",
"get => /api/Letters/:id ,Find Letter by id",
"delete => /api/Letters/:id ,Delete Letterby id",
"putt => /api/LetterLetters/:id ,Update Letterby id",
"post => /api/Letters , Add new Letter",
"post => /api/arrange/Letters ,Arrange Letter data with passed data"

