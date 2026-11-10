export interface IUser{
    id: string;
    username: string;
    emailaddress: string;
    password: string;
    userthumbnailurl: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    userreviews: Array<any>;
    purchases?: Array<any>;
    cart?: Array<any>;
}