import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import Footer from "../components/Footer";

import { useNavigate, useParams } from "react-router";

import axios from "axios";

import { useSellerData, Seller, } from "../../functions/getSellerData";

import { getAllProducts, Product } from "../../functions/getAllProducts";

import {getAllUsers, User} from "../../functions/getUserData";

import { SalesAnalytics } from "../../components/Charts";


const API_URL = "http://localhost:3000";



interface purchasedItems{

productname:string,

quantity:number,

price:number,

boughtBy:string,

purchasedAt:Date,

thumbnailUrl:string,



}





function SellerDashboard() {

const activeToken = localStorage.getItem("token");

const { id } = useParams<{ id: string }>();

const [loading, setLoading] = useState(true);

const navigate = useNavigate();

const [activeTab, setActiveTab] = useState< 'products' | 'sales'>('products');


const getActiveSellerId = () => {

if (id && id !== "undefined") return id;


// Check the active token first to see who is actually logged in!

if (activeToken) {

try {

const base64Url = activeToken.split('.')[1];

const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {

return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);

}).join(''));

const decoded = JSON.parse(jsonPayload);


// If the token explicitly belongs to a seller or admin, use their ID

if (decoded.role === 'seller' || decoded.role === 'admin' || decoded.sellerId) {

return decoded.sellerId || decoded._id || decoded.id;

}

} catch (e) {

console.error("Failed to parse token in SellerDashboard:", e);

}

}



// If the token is a regular user (or missing), ignore any lingering localStorage seller IDs!

return undefined;

};




// Custom Hook at Top-Level

const handleNavi = () => navigate("/seller-login-page");

const resolvedSellerId = getActiveSellerId();

const { sell, currentSeller,getSellerData} = useSellerData(handleNavi, resolvedSellerId);

const {currentUser, isRoyalty} = getAllUsers(handleNavi);

const [dashboardSeller, setDashboardSeller] = useState<any>(null);


// Local Component State

const [isVisible, setVisible] = useState(false);

const [isPFormVisible, setIsPFormVisible] = useState(false);

const [isupDateformvisible, setisupDateformvisible] = useState<boolean>(false);

const[deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

const [deleteProductModalVisible, setDeleteProductModalVisible] = useState<boolean>(false);

const [products, setProducts] = useState<Product[]>([]);

const [canModify, setCanModify] = useState(true);

const [mySales, setMySales] = useState<purchasedItems[]>([]);

const [buttonVisible, setButtonVisible] = useState(false);

const [currentUserData, setCurrentUserData] = useState<any>(null);






const [sellerformData, setSellerFormData] = useState({

sellerName: "",

description: "",

emailaddress: "",

sellerthumbnailurl: "",

});



const [productFormData, setProductFormData] = useState({

productname: "",

description: "",

price: 0,

category: "",

numberinstock: 0,

imageUrl: "",

sellerimageurl: "",

sellerdescription: "",

});



const [upDateproductFormData, setupDateProductFormData] = useState({

_id: "",

productname: "",

description: "",

price: 0,

category: "",

numberinstock: 0,

imageUrl: "",

sellerimageurl: "",

sellerdescription: "",

});



useEffect(() => {

getSellerData();


}, []);



useEffect(() => {

if (isVisible && sell) {

setSellerFormData({

sellerName: sell.sellername || "",

description: sell.description || "",

emailaddress: sell.emailaddress || "",

sellerthumbnailurl: sell.sellerthumbnailurl || "",

});

}

}, [isVisible, sell]);



const sellerId = resolvedSellerId || id || localStorage.getItem('id') || localStorage.getItem('sellerId');

const userId = currentUserData?.id || localStorage.getItem('id') || localStorage.getItem('userId');



// Add this useEffect to fetch the active user directly using the token

useEffect(() => {

const fetchCurrentUser = async () => {

if (!activeToken) return;

try {


const response = await axios.get(`${API_URL}/api/user/${userId}`, {

headers: { Authorization: `Bearer ${activeToken}` }

});

setCurrentUserData(response.data);

console.log("Successfully fetched current user:", currentUserData);

} catch (error) {

console.error("Failed to fetch current user data:", error);

}

};



fetchCurrentUser();

}, [activeToken]);





useEffect(() => {

async function GimmieGoodies() {

try {

const data = await getAllProducts();

setProducts(data || []);

} catch (error) {

console.error("Failed to get the goods", error);

}

}

GimmieGoodies();

}, []);



useEffect(() => {

if (!sellerId || sellerId === "undefined") {

setLoading(false);

return;

}



let cancelled = false;



// Re-run whenever the dashboard seller or current user finishes loading!


setCanModify(canModify);



;





const fetchProfile = async () => {

setLoading(true);

try {

console.log("Fetching profile for ID:", sellerId);

const response = await axios.get(`${API_URL}/api/seller/${sellerId}`);

console.log("API Response received:", response.data);


if (!cancelled) {

const sellerData = response.data.seller || response.data;


setDashboardSeller(sellerData);

console.log("Dashboard seller data set:", sellerData, dashboardSeller);


}

} catch (error: any) {

console.error("Failed to load profile:", error.response?.data || error.message);

if (cancelled) setDashboardSeller(null);

} finally {

if (!cancelled) setLoading(false);

}

};



void fetchProfile();



return () => {

cancelled = true;

};

}, [sellerId]);







/*Checks if the current user or seller has permission to modify the profile */

/*Checks if the current user or seller has permission to modify the profile */

const canIedit = async () => {

let currentSellerId = localStorage.getItem('id') || localStorage.getItem('sellerId');

let tokenRole = "";


// Extract ID and role directly from the JWT token for absolute reliability

if (activeToken) {

try {

const base64Url = activeToken.split('.')[1];

const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {

return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);

}).join(''));

const decoded = JSON.parse(jsonPayload);

currentSellerId = currentSellerId || decoded.sellerId || decoded._id || decoded.id;

tokenRole = decoded.role || "";

} catch (e) {

console.error("Failed to parse token in canIedit:", e);

}

}



const targetSellerId = typeof dashboardSeller === 'object'

? dashboardSeller?._id || dashboardSeller?.id

: dashboardSeller;



const isOwner = Boolean(currentSellerId && targetSellerId && String(currentSellerId) === String(targetSellerId));


// Check the newly fetched currentUserData, the hook's currentUser, OR the token role!

const effectiveRole = currentUserData?.role || currentUser?.role || tokenRole;

if (isOwner || effectiveRole === "admin" || isRoyalty === true) {

setCanModify(true);

}

else {

setCanModify(false);

}

console.log("Permission check debug:", {

currentSellerId,

targetSellerId,

currentUserData,

isOwner,

effectiveRole,

isRoyalty,

canModify

});

};









useEffect(() => {

if (dashboardSeller) {

canIedit();

}

}, [dashboardSeller, currentUser, currentUserData]);






const shutupNavi = (productId: string) => navigate(`/productpage/${productId}`);

const thoseAreMyProductsnotYours = products.filter((product) => product.sellername === sell?.sellername);

const sellerdash = dashboardSeller || currentSeller;



useEffect(() => {

if (isVisible && sellerdash) {

setSellerFormData({

sellerName: sellerdash.sellername || "",

description: sellerdash.description || "",

emailaddress: sellerdash.emailaddress || "",

sellerthumbnailurl: sellerdash.sellerthumbnailurl || "/pooplogo.png",


});

}

}, [isVisible, sellerdash]);







// 1. Import all images from src/assets dynamically using Vite's glob feature

const assetImages = import.meta.glob('/src/assets/*', { eager: true, import: 'default' }) as Record<string, string>;



// Helper to resolve the image dynamically

const resolveProductImage = (product: any) => {

const rawPath = product?.imageUrl || product?.thumbnailUrl || '';



if (!rawPath) return '/pooplogo.png';



// If it's already a full URL or absolute path, use it directly

if (rawPath.startsWith('http') || rawPath.startsWith('/')) {

return rawPath;

}



// Extract the filename (e.g., 'ultrawrench.jpg')

const filename = rawPath.split('/').pop();


if (filename) {

const matchedKey = Object.keys(assetImages).find((key) => key.endsWith(filename));

if (matchedKey) {

return assetImages[matchedKey];

}

}



return rawPath;

};









// Create Product

const createProduct = async (event: React.FormEvent<HTMLFormElement>) => {

event.preventDefault();

const currentSeller = sell?.sellername || "iamironman";



try {

await axios.post<Product>(`${API_URL}/api/products`, {

productname: productFormData.productname,

description: productFormData.description,

price: productFormData.price,

category: productFormData.category,

numberinstock: Number(productFormData.numberinstock),

unitssold: 0,

imageUrl: productFormData.imageUrl,

sellername: currentSeller,

reviews: [],

averagerating: 5,

});



setIsPFormVisible(false);

const updatedList = await getAllProducts();

setProducts(updatedList || []);

} catch (error) {

console.error("Error creating product:", error);

}

};


// Update Product Submit

const handleUpdateSubmit = async (e: React.FormEvent) => {

e.preventDefault();

if (!activeToken) return;



try {

const payload = {

productName: upDateproductFormData.productname,

description: upDateproductFormData.description,

price: Number(upDateproductFormData.price),

category: upDateproductFormData.category,

sellername: sell?.sellername || "iamironman",

numberinstock: Number(upDateproductFormData.numberinstock),


};



await axios.patch(

`${API_URL}/api/products/${upDateproductFormData._id}`,

payload,

{

headers: { Authorization: `Bearer ${activeToken}` },

}

);

console.log(payload)

setisupDateformvisible(false);

const updatedList = await getAllProducts();

console.log("Updated product list:", updatedList);

setProducts(updatedList || []);

console.log("Product updated successfully, product ID:", upDateproductFormData._id, "Payload:", payload);

} catch (error: any) {

if (error.response) {

console.error("Backend Error Data:", error.response.data);

} else {

console.error("Error updating product:", error.message);

}

}

};



// Update Profile

const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {

e.preventDefault();


try {

const payload = {

sellername: sellerformData.sellerName,

description: sellerformData.description,

emailaddress: sellerformData.emailaddress,

sellerthumbnailurl: sellerformData.sellerthumbnailurl,

};




await axios.patch(

`${API_URL}/api/seller/${currentSeller?._id}`,

payload,

{ headers: { Authorization: `Bearer ${activeToken}` } }

);

setVisible(false);

getSellerData();


} catch (error) {

console.error("Error updating profile:", error);

}

};



// Delete Account

const handleDeleteAccount = async () => {

if (!activeToken) return;

console.log("Attempting to delete seller account for seller ID:", currentSeller?._id);

try {

await axios.delete(`${API_URL}/api/seller/${currentSeller?._id}`, {

headers: { Authorization: `Bearer ${activeToken}` },

});

localStorage.removeItem("token");

handleNavi();

} catch (error) {

console.error("Failed to delete seller account", error);

}

};






// Delete Product

const handleDeleteProduct = async (_id: string) => {

if (!activeToken) return;

try {

await axios.delete(`${API_URL}/api/products/${_id}`, {

headers: { Authorization: `Bearer ${activeToken}` },

});

const updatedList = await getAllProducts();

setProducts(updatedList || []);

} catch (error) {

console.error("Error deleting product", error);

}

};

useEffect(() => {

console.log("Current seller:", currentSeller);

console.log("current User", currentUser);

}, [isRoyalty, currentSeller]);



useEffect(() => {

if (!sell?.sellername || activeTab !== 'sales') return;



async function fetchSalesFromUsers() {

try {

// Fallback: Fetch all users and extract purchases matching this seller's name

const response = await axios.get(`${API_URL}/api/user`); // adjust endpoint if needed

console.log("Fetched users for sales extraction:", response.data);

const sold = Array.isArray(response.data) ? response.data : response.data.users || [];


const extractedSales: purchasedItems[] = [];

for (const user of sold) {

if (Array.isArray(user.purchases)) {

const sellerPurchases = user.purchases.filter((p: any) => {

const sName = p.sellerName || p.sellername;

return sName?.trim().toLowerCase() === sell?.sellername?.trim().toLowerCase();

});

extractedSales.push(...sellerPurchases);

}

}



console.log("Client-extracted sales:", extractedSales);

setMySales(extractedSales);

} catch (error) {

console.error("Failed to fetch sales from user data:", error);

}

}



fetchSalesFromUsers();

}, [sell?.sellername, activeTab]);




if (loading) return <div>Loading...</div>;

if (!sell) return null;





const rawThumb = dashboardSeller?.sellerthumbnailurl || dashboardSeller?.thumbnailurl || sell?.sellerthumbnailurl || '';

const trimmedThumb = rawThumb.trim();

const resolvedThumb = !trimmedThumb

? '/pooplogo.png'

: trimmedThumb.startsWith('http') || trimmedThumb.startsWith('/')

? trimmedThumb

: `/${trimmedThumb}`;



return (

<div className="min-h-screen flex flex-col bg-gray-200">

<Navbar />


<div id="seller-dashboard-body" className="container bg-gray-200 mx-auto py-8 px-4 flex-1">

<div className="flex items-center bg-gray-200 gap-4 mb-8 w-full">

{sell?.sellerthumbnailurl && (

<img id="thumbnail-icon" className="h-25 w-25 rounded-full object-cover border"

src={resolvedThumb}

alt={dashboardSeller?.sellername || 'Profile'}

onError={(e) => {

const target = e.currentTarget as HTMLImageElement;

if (!target.src.endsWith('/pooplogo.png')) {

target.src = '/pooplogo.png';}

}}

/>

)}

<div>

</div>

<div>

<h1 className="text-3xl font-bold">{dashboardSeller?.sellername || sell?.sellername}</h1>

<p className="text-gray-600 mt-1">{dashboardSeller?.description || sell?.description}</p>

</div>

</div>



{ canModify === true && (

<div className="flex gap-3 mb-6">

<button onClick={() => setVisible(true)} className="bg-purple-800 text-white px-4 py-2 rounded hover:bg-slate-700">

Update Profile

</button>



<button onClick={() => setIsPFormVisible(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800">

Add Product

</button>

<button onClick={() => setDeleteModalVisible(true)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800">

Delete Account

</button>

</div>

)}


{/** Delete Product Modal */}

{deleteModalVisible && (

<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative mx-4">

<h3 className="text-xl font-bold mb-4">Delete Product</h3>

<p>Are you sure you want to delete this product? This action cannot be undone.</p>

<div className="flex justify-end gap-3 mt-4">

<button onClick={() => setDeleteModalVisible(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">

Cancel

</button>

<button onClick={handleDeleteAccount} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">

Delete

</button>

</div>

</div>

</div>

) }

{/* Update Profile Modal */}

{isVisible && (

<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative mx-4">

<h3 className="text-xl font-bold mb-4">Update Profile</h3>

<form onSubmit={handleUpdateProfile} className="space-y-4">

<div>

<label className="block text-sm font-medium text-gray-700" htmlFor="modal-name">Update Name</label>

<input

id="modal-name"

className="mt-1 block w-full border rounded p-2"

value={sellerformData.sellerName}

onChange={(e) => setSellerFormData({ ...sellerformData, sellerName: e.target.value })}

/>



<label className="block text-sm font-medium text-gray-700 mt-2" htmlFor="modal-desc">Profile Description</label>

<textarea

id="modal-desc"

className="mt-1 block w-full border rounded p-2 h-24"

value={sellerformData.description}

onChange={(e) => setSellerFormData({ ...sellerformData, description: e.target.value })}

/>



<label className="block text-sm font-medium text-gray-700 mt-2" htmlFor="modal-email">Update Email</label>

<input

id="modal-email"

className="mt-1 block w-full border rounded p-2"

value={sellerformData.emailaddress}

onChange={(e) => setSellerFormData({ ...sellerformData, emailaddress: e.target.value })}

/>

</div>



<div>

<label className="block text-sm font-medium text-gray-700" htmlFor="modal-img">Thumbnail Image URL</label>

<input

type="text"

id="modal-img"

className="mt-1 block w-full border rounded p-2"

value={sellerformData.sellerthumbnailurl}

onChange={(e) => setSellerFormData({ ...sellerformData, sellerthumbnailurl: e.target.value })}

/>

</div>



<div className="flex justify-end space-x-3 pt-2">

<button type="button" onClick={() => setVisible(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">

Cancel

</button>

<button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800">

Save Changes

</button>

</div>

</form>

</div>

</div>

)}



{/* Add Product Modal */}

{isPFormVisible && (

<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative mx-4">

<h3 className="text-xl font-bold mb-4">Add Product</h3>

<form onSubmit={createProduct} className="space-y-4">

<label className="block text-sm font-medium text-gray-700" htmlFor="modal-productname">Product Name</label>

<input

id="modal-productname"

className="mt-1 block w-full border rounded p-2"

value={productFormData.productname}

onChange={(e) => setProductFormData({ ...productFormData, productname: e.target.value })}

/>



<label className="block text-sm font-medium text-gray-700" htmlFor="modal-desc">Product Description</label>

<textarea

id="modal-desc"

className="mt-1 block w-full border rounded p-2 h-24"

value={productFormData.description}

onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}

/>



<label className="block text-sm font-medium text-gray-700" htmlFor="modal-price">Price</label>

<input

type="number"

id="modal-price"

min="0"

className="mt-1 block w-full border rounded p-2"

value={productFormData.price}

onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })}

/>



<div>

<label className="block text-sm font-medium text-gray-700" htmlFor="modal-categories">Select Category</label>

<select

id="modal-categories"

value={productFormData.category}

onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}

className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm"

>

<option value="">Select a Category</option>

<option value="Home and Garden">Home and Garden</option>

<option value="Tech">Tech</option>

<option value="Hardware">Hardware</option>

<option value="Health">Health</option>

<option value="Merch">Merch</option>

</select>

</div>



<div>

<label className="block text-sm font-medium text-gray-700" htmlFor="modal-stock">Number In Stock</label>

<input

type="number"

id="modal-stock"

className="mt-1 block w-full border rounded p-2"

value={productFormData.numberinstock}

onChange={(e) => setProductFormData({ ...productFormData, numberinstock: Number(e.target.value) })}

/>

</div>



<label className="block text-sm font-medium text-gray-700" htmlFor="modal-img">Thumbnail Image URL</label>

<input

type="text"

id="modal-img"

className="mt-1 block w-full border rounded p-2"

value={productFormData.imageUrl}

onChange={(e) => setProductFormData({ ...productFormData, imageUrl: e.target.value })}

/>



<div className="flex justify-end space-x-3 pt-2">

<button type="button" onClick={() => setIsPFormVisible(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">

Cancel

</button>

<button type="submit" className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">

Add Product

</button>

</div>

</form>

</div>

</div>

)}



{/* Update Product Modal */}

{isupDateformvisible && (

<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative mx-4">

<h3 className="text-xl font-bold mb-4">Update Product</h3>

<form onSubmit={handleUpdateSubmit} className="space-y-4">

<label className="block text-sm font-medium text-gray-700" htmlFor="modal-update-productname">Update Product Name</label>

<input

id="modal-update-productname"

className="mt-1 block w-full border rounded p-2"

value={upDateproductFormData.productname}

onChange={(e) => setupDateProductFormData({ ...upDateproductFormData, productname: e.target.value })}

/>



<label className="block text-sm font-medium text-gray-700" htmlFor="modal-update-desc">Update Product Description</label>

<textarea

id="modal-update-desc"

className="mt-1 block w-full border rounded p-2 h-24"

value={upDateproductFormData.description}

onChange={(e) => setupDateProductFormData({ ...upDateproductFormData, description: e.target.value })}

/>



<label className="block text-sm font-medium text-gray-700" htmlFor="modal-update-price">Update Price</label>

<input

type="number"

id="modal-update-price"

min="0"

className="mt-1 block w-full border rounded p-2"

value={upDateproductFormData.price}

onChange={(e) => setupDateProductFormData({ ...upDateproductFormData, price: Number(e.target.value) })}

/>



<label className="block text-sm font-medium text-gray-700" htmlFor="modal-update-categories">Update Category</label>

<select

id="modal-update-categories"

value={upDateproductFormData.category}

onChange={(e) => setupDateProductFormData({ ...upDateproductFormData, category: e.target.value })}

className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm"

>

<option value="">Select a Category</option>

<option value="Home and Garden">Home and Garden</option>

<option value="Tech">Tech</option>

<option value="Hardware">Hardware</option>

<option value="Health">Health</option>

<option value="Merch">Merch</option>

</select>



<label className="block text-sm font-medium text-gray-700" htmlFor="modal-update-stock">Update Number In Stock</label>

<input

type="number"

id="modal-update-stock"

className="mt-1 block w-full border rounded p-2"

value={upDateproductFormData.numberinstock}

onChange={(e) => setupDateProductFormData({ ...upDateproductFormData, numberinstock: Number(e.target.value) })}

/>



<label className="block text-sm font-medium text-gray-700" htmlFor="modal-update-img">Update Thumbnail Image URL</label>

<input

type="text"

id="modal-update-img"

className="mt-1 block w-full border rounded p-2"

value={upDateproductFormData.imageUrl}

onChange={(e) => setupDateProductFormData({ ...upDateproductFormData, imageUrl: e.target.value })}

/>



<div className="flex justify-end space-x-3 pt-2">

<button type="button" onClick={() => setisupDateformvisible(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">

Cancel

</button>

<button type="submit" className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">

Update Product

</button>

</div>

</form>

</div>

</div>

)}

{/* Tab Navigation Header */}

<div className="flex border-b border-gray-200 mb-6 gap-1">




<button

className={`font-medium border-blue-500 ${

activeTab === 'products'

? 'border-b-2 border-blue-500 text-black-600'

: 'text-gray-500 hover:text-gray-700'

}`}

onClick={() => setActiveTab('products')}

>

Products

</button>



<button

className={`font-medium border-blue-500 ${

activeTab === 'sales'

? 'border-b-2 text-blue-600'

: 'text-gray-500 hover:text-gray-700'

}`}

onClick={() => setActiveTab('sales')}

>

Sales

</button>

</div>



{/* Products Tab Content */}

{activeTab === 'products' && (

<div id="seller-dashboard-content" className="border bg-white p-6 rounded-md shadow-md mt-6">

<h2 className="text-2xl font-bold mb-4">Products</h2>

{thoseAreMyProductsnotYours.length === 0 ? (

<p className="text-gray-500">No products available.</p>

) : (

<ul className="space-y-4 w-full flex flex-col">

{thoseAreMyProductsnotYours.map((product) => {

const productId = product._id;

const imageSrc = resolveProductImage(product);

return (

<li

key={productId || product.productname}

onClick={() => productId && shutupNavi(productId)}

className="flex items-center w-full gap-4 border p-4 rounded shadow-sm bg-gray-50 cursor-pointer hover:bg-gray-100 transition"

>

{product.imageUrl && (

<img src={imageSrc} alt={product.productname} className="w-16 h-16 object-cover rounded" />

)}

<div className="flex-1">

<h4 className="text-lg font-semibold">{product.productname}</h4>

<div className="text-sm mt-1 flex justify-between items-center">

<div>

<span className="font-bold text-green-600">${product.price}</span> |

<span className="text-gray-500 ml-1">Stock: {product.numberinstock}</span>

</div>

<div className="flex gap-2">

<button

onClick={(e) => {

e.stopPropagation();

if (productId) {

setupDateProductFormData({

_id: productId,

productname: product.productname,

description: product.description,

price: product.price,

category: product.category,

numberinstock: product.numberinstock,

sellerimageurl: product.sellerimageurl,

sellerdescription: product.sellerdescription,

imageUrl: product.imageUrl,

});

setisupDateformvisible(true);

}

}}

className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"

>

Update

</button>

<button

onClick={(e) => {

e.stopPropagation();

if (productId) handleDeleteProduct(productId);

}}

className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"

>

Delete Product

</button>

</div>

</div>

</div>

</li>

);

})}

</ul>

)}

</div>

)}



{/* Sales Tab Content */}

{activeTab === 'sales' && (

<div className="space-y-4 w-full flex flex-col mt-6">


<SalesAnalytics mySales={mySales} />

</div>

)}

</div>

</div>

);

}



export default SellerDashboard; 