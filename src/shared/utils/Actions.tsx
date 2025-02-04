class Action {
    id: number;
    user_name: string;
    item_name: string;
    action_type: string;
    timestamp: string;

    constructor(id: number, user_name: string, item_name: string, action_type: string, timestamp: string) {
        this.id = id;
        this.user_name = user_name;
        this.item_name = item_name;
        this.action_type = action_type;
        this.timestamp = timestamp;
    }

    /**
     * Serialize the Action instance into a plain object for sending to the backend.
     */
    toJSON(): object {
        return {
            id: this.id,
            user_name: this.user_name,
            item_name: this.item_name,
            action_type: this.action_type,
            timestamp: this.timestamp,
        };
    }

    /**
     * Provide a descriptive representation of the Action (useful for debugging/logging).
     */
    describe(): string {
        return `Action: ${this.action_type} performed by ${this.user_name} on ${this.item_name} at ${this.timestamp}`;
    }
}

export default Action;
