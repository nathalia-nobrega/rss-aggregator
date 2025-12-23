export type User = {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    password: string;
};

export type UserDataResponse = {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    // show feeds maybe?
};
