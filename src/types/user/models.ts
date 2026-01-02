export type User = {
    id: string;
    username: string;
    email: string;
    password: string;
};

export type UserDB = {
    id: string;
    email: string;
    username: string;
    password: string;
};

export type UserDataResponse = {
    id: string;
    username: string;
    email: string;
    createdAt: number;
    // show feeds maybe?
};
