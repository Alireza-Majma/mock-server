export class Book {
    bookID: number;
    title: string;
    author: string;
    publicationYear: number;

    static BuildItem(obj: any): Book {
       const item = new Book();
       item.bookID = obj.bookID;
       item.title = obj.title;
       item.author = obj.author;
       item.publicationYear = obj.publicationYear;
       return item;
    }
}
