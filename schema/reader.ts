export class Reader {
    readerID: number;
    name: string;
    weeklyReadingGoal: number;
    totalMinutesRead: number;

    static BuildItem(obj): Reader {
        return {
            readerID: obj.readerID,
            name: obj.name,
            weeklyReadingGoal: obj.weeklyReadingGoal,
            totalMinutesRead: obj.totalMinutesRead
        };
    }

}
