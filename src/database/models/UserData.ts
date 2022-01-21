import mongoose from "mongoose";

export type Data = {
    username?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    servers?: [
        {
            icon?: string;
            name?: string;
            id?: number;
            description?: string;
            poster?: string;
            isOwner?: boolean;
            members?: [
                {
                    username?: string;
                    icon?: string;
                    id?: string;
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
        }
    ];
};

export const schema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    phone: String,
    avatar: String,
    servers: [
        {
            icon: String,
            name: String,
            id: String,
            description: String,
            poster: String,
            isOwner: Boolean,
            members: [
                {
                    username: String,
                    icon: String,
                    id: Number,
                    status: {
                        icon: String,
                        message: String,
                    },
                },
            ],
        },
    ],
});

const UserData = mongoose.model("ODS_UserData", schema);
console.log("[Model] Registered model: UserData.");

export default UserData;
