export class User {
    id: number;
    name: string;
    password: string;
    email: string;
	description: string;

    static BuildItem(obj: any): User {
        return {
            id: obj.id,
            name: obj.name,
            password: obj.password,
			email: obj.email,
			description: obj.description
        };
    }
}
