import axios from "axios";

import mongoose from "mongoose";



import { useState, useCallback } from "react";



export interface Review {

_id?: string;

username?: string;

thumbnailUrl?: string;

rating: number;

title: string;

comment: string;

createdAt?: string | Date;

}



export interface Purchase{

_id:string,

productname:string,

sellerName:string,

thumbnailUrl:string,

price:number,

quantity:number

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



export interface Cart {

_id?:string|mongoose.Types.ObjectId;





cartItems:{ item: Product; quantity: number }[];


totalprice: number;

}

export interface User {

_id?: string;

username: string;

emailaddress: string;

password?: string;

userthumbnailurl: string;

userreviews: Review[];

purchases: Purchase[];

role: 'user' | 'seller' | 'admin';

cart: Cart[];

}






export function getUserbyID() {

const API_URL = 'http://localhost:3000';
const [user, setUser] = useState<User>({
_id:"",

username: "",

emailaddress: "",

password: "",

userthumbnailurl: "",

userreviews: [],

purchases: [],

role: 'user',

cart: []

});

const [loading, setLoading] = useState(true);

const [isRoyalty, setIsRoyalty] = useState(false);



const checktheBloodLine = (currentUser: any) => {

if (currentUser?.role === 'admin' || currentUser?.role === 'seller') {

setIsRoyalty(true);

} else {

setIsRoyalty(false);

}

console.log('Bloodline has been checked. It is:', currentUser?.role);

};







const getUserData = useCallback(async () => {

const token = localStorage.getItem('token');

console.log("fetching data...");



if (!token) {

console.error("no token found. Returning to Login");


return;

}



try {

// Decode user ID from JWT token payload

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

loggedInId = localStorage.getItem('userId') || "";

}



if (!loggedInId) {

console.error("Could not extract a valid user ID from token or localStorage.");

setLoading(false);

return;

}
 
// Fetch the authenticated user's profile directly (which populates cart items)

// Fallback to fetch all if fetching single endpoint fails

let currentUser: any = null;



try {

const singleUserResponse = await axios.get(`${API_URL}/api/user/${loggedInId}`, {

headers: { Authorization: `Bearer ${token}` }

});

currentUser = singleUserResponse.data?.data || singleUserResponse.data;

} catch (err) {

console.warn("Direct user lookup failed, falling back to all users array fetch...", err);

const response = await axios.get<any>(`${API_URL}/api/user`, {

headers: { Authorization: `Bearer ${token}` }

});

const userArray = response.data?.data;

if (Array.isArray(userArray)) {

currentUser = userArray.find((s: any) => s._id === loggedInId);

}

}



if (currentUser) {

setUser({

_id: currentUser._id,

username: currentUser.username,

emailaddress: currentUser.emailaddress,

password: currentUser.password,

userthumbnailurl: currentUser.userthumbnailurl || currentUser.sellerthumbnailurl || "/pooplogo.png",

userreviews: currentUser.reviews || currentUser.userreviews || [],

purchases: currentUser.purchases || [],

role: currentUser.role || 'user',

cart: currentUser.cart || []

});



checktheBloodLine(currentUser);

console.log("User Data Successfully set:", currentUser);

} else {

console.warn("Could not find a matching user in database for ID:", loggedInId);

}

} catch (error) {

console.error("Failed to fetch user data", error);

} finally {

setLoading(false);

}

}, []);



return {

currentUser: user,

setCurrentUser: setUser,


loading,

getUserData,

isRoyalty

};

} 