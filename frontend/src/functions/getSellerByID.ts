import axios from "axios";
 

import { useState, useCallback } from "react";

 


export interface Seller{
id: string,
sellername: string,
emailaddress:string,
password?: string,
sellerthumbnailurl: string,
productsforsale: Product[],
createdAt:  Date,
updatedAt:  Date;



}




export interface Review {

_id?: string;

sellername?: string;

thumbnailUrl?: string;

rating: number;

title: string;

comment: string;

createdAt?: string | Date;

}


 

export interface Product{

_id?:string,

productname:string,

description:string,

price:number,

category:string,

numberinstock:number,

unitssold:number,

createdAt:Date,

updatedAt:Date,

imageUrl:string,

sellername:string,

reviews: Review[]

averagerating:number

}

 

export function useSellerData() {

const API_URL = 'http://localhost:3000';
const [seller, setSeller] = useState<Seller>({
id:"",

sellername: "",

emailaddress: "",

password: "",

sellerthumbnailurl: "",
 
productsforsale:[],

createdAt: new Date(),

updatedAt: new Date()

});

const [loading, setLoading] = useState(true);
 
 
const getSellerData = useCallback(async () => {

const token = localStorage.getItem('token');

console.log("fetching data...");



if (!token) {

console.error("no token found. Returning to Login");


return;

}



try {

// Decode seller ID from JWT token payload

let loggedInId = "";

try {

const base64Url = token.split('.')[1];

const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

const jsonPayload = decodeURIComponent(

window.atob(base64)

.split('')

.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))

.join('')

);



const decoded = JSON.parse(jsonPayload);

loggedInId = decoded._id || decoded.id || decoded.sub;

} catch (e) {

console.error("Failed to parse JWT token structure:", e);

}



if (!loggedInId || loggedInId === "undefined") {

loggedInId = localStorage.getItem('sellerId') || "";

}



if (!loggedInId) {

console.error("Could not extract a valid seller ID from token or localStorage.");

setLoading(false);

return;

}
 
// Fetch the authenticated seller's profile directly (which populates cart items)

// Fallback to fetch all if fetching single endpoint fails

let currentSeller: any = null;



try {

const singleSellerResponse = await axios.get(`${API_URL}/api/sellers/${loggedInId}`, {

headers: { Authorization: `Bearer ${token}` }

});

currentSeller = singleSellerResponse.data?.data || singleSellerResponse.data;

} catch (err) {

console.warn("Direct Seller lookup failed, falling back to all sellers array fetch...", err);

const response = await axios.get<any>(`${API_URL}/api/seller`, {

headers: { Authorization: `Bearer ${token}` }

});

const sellerArray = response.data?.data;

if (Array.isArray(sellerArray)) {

currentSeller = sellerArray.find((s: any) => s._id === loggedInId);

}

}



if (currentSeller) {

setSeller({

id: currentSeller._id,

sellername: currentSeller.sellername,

emailaddress: currentSeller.emailaddress,

password: currentSeller.password,

sellerthumbnailurl: currentSeller.sellerthumbnailurl || currentSeller.sellerthumbnailurl || "/pooplogo.png",
 
productsforsale: currentSeller.productsforsale,

createdAt: currentSeller.createdAt,

updatedAt: currentSeller.upDatedAt

});
 
 
} else {

console.warn("Could not find a matching seller in database for ID:", loggedInId);

}

} catch (error) {

console.error("Failed to fetch seller data", error);

} finally {

setLoading(false);

}

}, []);



return {

currentSeller: seller,

setCurrentseller: setSeller,


loading,

getSellerData,
 

};

} 