class User {
    id: number;
    name: string;
    permission: string;
    public borrowedItems: string[]

    constructor(id: number, name: string, permission: string, borrowedItems: string[]) {
        this.id = id;
        this.name = name;
        this.permission = permission;
        this.borrowedItems = borrowedItems;
    }

}

export default User ;