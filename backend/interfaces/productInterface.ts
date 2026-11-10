

export interface IProduct{
id: number;
name: string;
price: number;
description: string;
imageUrl: string;
category: string;
unitssold:number,
sellername:string,
stock: number;
createdAt: Date;
updatedAt: Date;
reviews: [];
}