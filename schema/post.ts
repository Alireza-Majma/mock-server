import {User} from "./user";
import {BaseController} from '../base_controller';
export class Post {
    id: number;
    title: string;
	message: string;
    userId: number;
    user : User

    static BuildItem(obj: any): Post {
        const user = BaseController['BuildItemById']<User>(User, obj.userId,);
        return {
            id: obj.id,
            title: obj.title,
			message: obj.message,
            userId: obj.userId,
            user
        };
    }
}
