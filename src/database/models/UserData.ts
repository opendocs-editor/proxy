export type UserServers = {
    [key: number]: {
        icon?: string;
        name?: string;
        id?: string;
        description?: string;
        poster?: string;
        isOwner?: boolean;
        members?: [
            {
                username?: string;
                id?: string;
                icon?: number;
                status?: {
                    icon?: "online" | "offline" | "idle" | "dnd";
                    message?: string;
                };
            }
        ];
        categories?: [
            {
                name?: "uncategorized" | string;
                id?: string;
                members?: [
                    {
                        name?: string;
                        type?: "text" | "voice" | "stage" | "announcement";
                        id?: string;
                        description?: string;
                    }
                ];
            }
        ];
    };
};

export type UserData = {
    username?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    servers?: UserServers;
};

export class UserSchema {
    constructor(
        public username?: string,
        public name?: string,
        public email?: string,
        public phone?: string,
        public avatar?: string,
        public servers?: UserServers
    ) {}
}
