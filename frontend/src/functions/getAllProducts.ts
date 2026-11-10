import axios from "axios"


export interface Product
{
_id: string;
name: string;
price: number;
description: string;
imageUrl: string;
unitssold:number;
category: string;
stock: number;
sellername:string,
createdAt: Date;
updatedAt: Date;
reviews: [];
}


export async function getAllProducts()




{
const API_URL = "http://localhost:3000"
try
{
const response = await axios.get(`${API_URL}/api/products`);    
return response.data
}
catch(error)
{
console.error("Failed to fetch all products, idiot", error);
return [];

}

}