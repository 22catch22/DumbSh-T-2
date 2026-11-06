export interface User{
    id: number;
    name: string;
    emailaddress: string;
    password: string;
    userthumbnail: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    userreviews: Array<any>;
    purchases?: Array<any>;
    cart?: Array<any>;


}