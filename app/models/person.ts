export class Person {
    id: number;
    first_name: string;
	last_name: string;
	email: string;
	gender: string;
    ip_address: string;

    static BuildItem(obj): Person {
        return {
            id: obj.id,
            first_name: obj.first_name,
			last_name: obj.last_name,
			email: obj.email,
			gender: obj.gender,
			ip_address: obj.ip_address
        };
    }

}
