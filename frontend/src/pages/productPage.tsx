import React, { useState, useEffect } from 'react';

import Navbar from './homepage';

import axios from 'axios';

import Footer from '../components/Footer';

import { useParams, useNavigate, Link } from 'react-router-dom';

import {useSellerData, Seller} from '../functions/getSellerByID';

import {getAllProducts,Product as ProductFromAPI} from '../functions/getProductByID';

import { getAllUsers } from '../functions/getUserData';

import { getAllSellers } from '../functions/getAllSellers';

import CustomerSupportModal from "../components/customerSupportModal";

interface User {

_id: string;

username: string;

thumbnailUrl: string;

}







function ProductPage() {

const API_URL = 'http://localhost:3000';

const { id } = useParams<{ id: string }>();

const [product, setProduct] = useState<ProductFromAPI | null>(null);

const [commentformVisible, setCommentFormVisible] = useState(false);

const navigate = useNavigate();

const [similarProducts, setSimilarProducts] = useState<ProductFromAPI[]>([]);


const handleNavigate = () => {

navigate("/user-login-page");

};

const [sellerThumbnail, setSellerThumbnail] = useState<string>('/pooplogo.png');

const [sellerDescription, setSellerDescription] = useState<string>('');

const [sellerId, setSellerId] = useState<string>('');

const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);

const { currentUser, getUserData, isRoyalty } = getAllUsers(handleNavigate);

const { sell: seller, getSellerData } = useSellerData(handleNavigate);

const [sellerData, setSellerData] = useState<Seller[]>([]);

const userId = localStorage.getItem('userId') || currentUser?._id;

const [quantity, setQuantity] = useState<number>(1);


const [commentData, setCommentData] = useState({



rating: 5,

thumbnailUrl: '',

username: '',

title: '',

comment: '',

});


// Check if the role stored in localStorage is 'seller'

const isSellerLoggedIn = localStorage.getItem('role') === 'seller' || Boolean(seller && seller._id);







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



const getRandomProducts = (arr: any[], count: number) => {

if (!arr || arr.length === 0) return [];

const shuffled = [...arr].sort(() => 0.5 - Math.random());

return shuffled.slice(0, count);

};



/* Fetch Product Details */

/* Fetch Product Details & Sellers Concurrently */

async function getProductData() {

if (!id) return;

try {

// Fire product details and all sellers request at the exact same time

const [productRes, responseSellers] = await Promise.all([

axios.get<ProductFromAPI>(`${API_URL}/api/product/${id}`),

getAllSellers()

]);



const rawProduct = productRes.data;

if (!rawProduct) return;



const resolvedImg = resolveProductImage(rawProduct);



setProduct({

...rawProduct,

imageUrl: resolvedImg,

});



// Extract the sellers array safely

const fetchedSellers = Array.isArray(responseSellers)

? responseSellers

: (responseSellers as any)?.data || (responseSellers as any)?.users || [];



const matchedSeller = fetchedSellers.find(

(s: any) =>

(s.sellername || s.username || s.name)?.trim().toLowerCase() === rawProduct.sellername?.trim().toLowerCase()

);



if (matchedSeller) {

const rawThumb =

matchedSeller.sellerthumbnailurl ||

matchedSeller.userthumbnailurl ||

matchedSeller.thumbnailurl ||

matchedSeller.thumbnail ||

matchedSeller.avatar ||

matchedSeller.profilepicture || '';



const trimmedThumb = rawThumb.trim();

const resolvedThumbnail: string = !trimmedThumb

? '/pooplogo.png'

: trimmedThumb.startsWith('http') || trimmedThumb.startsWith('/')

? trimmedThumb

: `/${trimmedThumb}`;



setSellerThumbnail(resolvedThumbnail);

setSellerDescription(matchedSeller.description || '');

setSellerId(matchedSeller._id || '');

} else {

setSellerThumbnail('/pooplogo.png');

setSellerDescription('No description available.');

}

} catch (error) {

console.error("Could not find product:", error);

}

}





useEffect(() => {

if (id) {

getProductData();


}

}, [id]);



useEffect(() => {

getUserData();

}, []);


/* Fetch similar products based on the current product's category, tempting the user to waste even more money*/

useEffect(() => {

const fetchSimilarProducts = async () => {

if (!product?.category) return;

try {


const allProducts = await getAllProducts();

console.log("All Products:", allProducts)



const similar = allProducts.filter(

(p) => p.category === product.category && p._id !== product._id

);


similar.forEach(sim => {

const itsRawUrl = sim.imageUrl?.trim();


const resolvedImg = resolveProductImage(itsRawUrl ? { imageUrl: itsRawUrl } : { imageUrl: '/pooplogo.png' });

sim.imageUrl = resolvedImg;

});


setSimilarProducts(getRandomProducts(similar, 3));

console.log("Similar Products:", similar);

} catch (error) {

console.error("Failed to fetch similar products:", error);

}

};

fetchSimilarProducts();

}, [product]);


if (!product) {

return <div className="p-8 text-center text-lg font-semibold">Loading product data...</div>;

}


const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

const { name, value } = e.target;

setCommentData((prev) => ({

...prev,

[name]: value,

}));

};






const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {

const val = Math.max(1, parseInt(e.target.value, 10) || 1);

setQuantity(val);

};



const renderStars = (rating: number) => {

const stars = [];

const currentRating = Math.round(Number(rating) || 0);



for (let i = 1; i <= 5; i++) {

stars.push(

<span

key={i}

className={`[paint-order:stroke_fill] [webkit-text-stroke:1.2px_black] ${

i <= currentRating ? "text-yellow-600" : "text-gray-300"

}`}

>

★

</span>

);

}

return <div className="flex text-xl">{stars}</div>;

};




/* Add Product to User Cart */

const addToCart = async () => {

if (!currentUser || !currentUser._id) {

console.error("User is not logged in. Cannot add to cart.");

return;

}



const calculatedTotalPrice = product.price * quantity;

const targetProductId = product._id || id;



const payload = {

cartItems: [

{

item: targetProductId,

quantity: quantity,

},

],

totalprice: calculatedTotalPrice,

};



try {

const token = localStorage.getItem('token');

await axios.patch(

`${API_URL}/api/user/${currentUser._id}/cart`,

payload,

{

headers: {

Authorization: `Bearer ${token}`,

},

}

);



console.log("Item successfully added to cart!");

if (getUserData) {

await getUserData();

}

} catch (error: any) {

console.error("Failed to update cart:", error.response?.data || error.message);

}

};



/* Remove Item from User Cart */

const removeFromCart = async (productId: string) => {

const token = localStorage.getItem('token');

const userId = currentUser?._id;



if (!window.confirm("Are you sure you want to remove this item from your cart?")) return;



try {

await axios.delete(`${API_URL}/api/user/${userId}/cart/${productId}`, {

headers: {

Authorization: `Bearer ${token}`,

},

});



if (getUserData) {

getUserData();

}

} catch (error) {

console.error("Error removing item from cart:", error);

}

};



const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

e.preventDefault();

if (!currentUser || !currentUser._id) {

console.error("User not logged in. Cannot submit review.");

return;

}



const newUserReview = {

userId: currentUser._id,

username: currentUser.username || 'Anonymous',

thumbnailUrl: currentUser.userthumbnailurl || '/pooplogo.png',

rating: Number(commentData.rating),

title: commentData.title,

comment: commentData.comment,

createdAt: new Date(),

};

console.log("Submitting new review:", newUserReview);

try {

await axios.post(`${API_URL}/api/product/${id}/reviews`, newUserReview);

setCommentData({



rating: 5,

thumbnailUrl: '',

username: '',

title: '',

comment: '',

});

setCommentFormVisible(false);

getProductData();

} catch (error) {

console.error("Error submitting review:", error);

}

};

const handleDeleteReview = async (reviewId: string) => {

const userId = currentUser?._id;

if (!userId) {

console.error("User ID missing for deletion.");

return;

}


if (!window.confirm("Are you sure you want to delete this review?")) return;



try {



await axios.delete(`${API_URL}/api/product/${id}/user/${userId}/reviews/${reviewId}`);

getProductData(); // Refresh product page

} catch (error: any) {

console.error("Error deleting review:", error.response?.data || error.message);

}

};

const descLines = product.description?.split('\n').map((line, index) => (

<React.Fragment key={index}>

{line}

<br />

</React.Fragment>

));



// Extract active user cart subdocument items safely

const userCartSubdoc = currentUser.cart && currentUser.cart.length > 0 ? currentUser.cart[0] : null;

const activeCartItems = userCartSubdoc?.cartItems || [];

const cartTotalPrice = userCartSubdoc?.totalprice || 0;



return (

<div className="min-h-screen flex flex-col justify-between">

<Navbar />



{/*Enlarged Image Modal */}



{imageModalVisible && (

<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

<div className="bg-white p-4 rounded-lg shadow-lg">

<img

src={product.imageUrl || '/pooplogo.png'}

alt={product.productname}

className="max-w-full max-h-full object-contain"

/>

<button

onClick={() => setImageModalVisible(false)}

className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"

>

Close

</button>

</div>

</div>

)}






{/* Submit Comment Modal */}

{commentformVisible && (

<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

<div className="bg-white p-8 rounded-lg shadow-lg flex flex-col h-auto w-96">

<form onSubmit={handleReviewSubmit} className="flex flex-col space-y-4">

<label htmlFor="rating" className="font-semibold">Rating (1-5):</label>

<input

type="number"

id="rating"

name="rating"

min="1"

max="5"

required

className="border p-2 rounded"

value={commentData.rating}

onChange={handleReviewChange}

/>



<label htmlFor="title" className="font-semibold">Title:</label>

<input

type="text"

id="title"

name="title"

required

className="border p-2 rounded"

value={commentData.title}

onChange={handleReviewChange}

/>



<label htmlFor="comment" className="font-semibold">Comment:</label>

<textarea

id="comment"

name="comment"

required

className="border p-2 rounded"

value={commentData.comment}

onChange={handleReviewChange}

/>



<div className="flex justify-between mt-4">

<button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">

Submit

</button>

<button

type="button"

onClick={() => setCommentFormVisible(false)}

className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500"

>

Cancel

</button>

</div>

</form>

</div>

</div>

)}


<div id = 'product-cart-box' className='flex-row mx-auto '>

{/* Product Information and Cart Display */}

<div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">

<CustomerSupportModal />



<div id="product-box" className="flex flex-col md:flex-row w-full bg-white rounded-lg shadow-md p-6 gap-6">

<div id="name-box" className="w-full md:w-1/2">


<h2 className="text-2xl font-bold mb-2">{product.productname}</h2>

<div className="mt-4">{renderStars(product.averagerating)}</div>

<img

alt={product.productname}

src={product.imageUrl || '/pooplogo.png'}

onClick={() => setImageModalVisible(true)}

className="w-full max-w-sm h-80 object-cover px-4 py-5 rounded-md cursor-pointer hover:opacity-95 transition"

onError={(e) => {

const target = e.currentTarget as HTMLImageElement;

if (!target.src.endsWith('/pooplogo.png')) {

target.src = '/pooplogo.png';

}

}}

/>


</div>



<div id="product-stuff" className="w-full h-full md:w-1/2 flex flex-col justify-between">

<div id="product-info" >

<p className="text-gray-800 text-l pt-10">{descLines}</p>

<p className="font-semibold text-gray-700 pt-8">In Stock: {product.numberinstock}</p>

Seller: <Link to={`/sellerDashboard/${sellerId}`}>{product.sellername}</Link>

<div className="flex gap-2 mt-4">


</div>



</div>

</div>


{/* Cart Box */}

<div id="cart" className="border-2 border-gray-300 bg-gray-50 p-6 rounded-lg shadow-inner">

<p className="text-xl font-bold text-gray-800 mb-2">Price: ${product.price.toFixed(2)}</p>

<h3 className="text-lg font-semibold mb-3">Your Cart</h3>



{seller && !currentUser ? (

<div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm mb-4">

🛒 **Seller Account Active:** Sellers cannot purchase items or add them to a shopping cart.

</div>

) : (

<>

{activeCartItems.length === 0 ? (

<p className="text-gray-500 italic mb-4">Your cart is empty. Fill it up!</p>

) : (

<ul className="space-y-3 max-h-48 overflow-y-auto mb-4 pr-2">

{activeCartItems.map((cartEntry: any, index: number) => {

const itemObj = typeof cartEntry.item === 'object' ? cartEntry.item : null;

const itemId = itemObj?._id || cartEntry.item;

const rawPath = itemObj?.imageUrl || itemObj?.thumbnailUrl || cartEntry.imageUrl || '';



const resolvedImg = resolveProductImage(rawPath ? { imageUrl: rawPath } : { imageUrl: '/pooplogo.png' });

const imagesrc = resolvedImg || '/pooplogo.png';

return (

<li key={cartEntry._id || index} className="border-b pb-2 flex justify-between items-center">

<div className="flex items-center gap-3">

<img

src={imagesrc}

alt={itemObj?.productname || "Product Thumbnail"}

className="w-10 h-10 rounded object-cover border"

onError={(e) => {

const target = e.currentTarget as HTMLImageElement;

if (!target.src.endsWith('/pooplogo.png')) {

target.src = '/pooplogo.png';

}

}}

/>

<div>

<p className="font-semibold text-sm">{itemObj?.productname || 'Item'}</p>

{itemObj?.price && (

<p className="text-xs text-gray-600">

${itemObj.price.toFixed(2)} (x{cartEntry.quantity})

</p>

)}

</div>

</div>



{itemId && (

<button

onClick={() => removeFromCart(itemId)}

className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded border border-red-200 bg-red-50"

>

Remove

</button>

)}

</li>

);

})}

</ul>

)}



<div className="flex items-center gap-3 mb-4">

<label className="font-semibold text-sm">Quantity:</label>

<input

className="w-20 p-2 bg-white border border-gray-400 rounded text-center focus:ring-blue-500"

type="number"

min="1"

max="10"

value={quantity}

onChange={handleQuantityChange}

/>

</div>



<div className="flex gap-2">

<button

className="bg-blue-600 hover:bg-blue-700 text-white text-center font-bold rounded transition"

onClick={addToCart}

>

Add

</button>

<button

className="bg-green-600 hover:bg-green-700 text-white text-center font-bold rounded transition"

onClick={() => navigate('/checkout')}

>

Checkout

</button>

</div>



<div className="mt-4 pt-3 border-t text-right font-bold text-gray-800">

Total: ${cartTotalPrice.toFixed(2)}

</div>

</>

)}

</div>

</div>

</div>

</div>




{/* Similar Products Section */}

<h2>You might also like:</h2>

<div id = 'similair-products' className="mt-6 flex flex-col md:flex-row w-full flex flex-col md:flex-row w-full bg-white rounded-lg shadow-md p-6 gap-6bg-white border rounded-lg shadow-md p-6">


<div className="flex flex-col md:flex-row w-full items-center pbg-white rounded-lg shadow-md p-6 gap-6 ">

{similarProducts.map((similarProduct) => (

<div key={similarProduct._id} className="w-full h-full overflow-hidden rounded-t-md bg-gray-50 flex flex-col items-center justify-center border-gray-700 h-full rounded-lg on hover:shadow-lg transition-shadow border-black-300 duration-300">

<a href={`/productpage/${similarProduct._id}`}>


<img

src={similarProduct.imageUrl}

alt={similarProduct.productname}

className="w-full h-48 object-cover rounded-t-md"

/>

</a>

<p> {renderStars(similarProduct.averagerating)}</p>

<h4 className="font-semibold text-gray-800">{similarProduct.productname}</h4>

<p>{similarProduct.sellername}</p>

<p className="text-gray-600">${similarProduct.price.toFixed(2)}</p>

</div>

))}

</div>







</div>

{/* Reviews Section */}

<div id="comment-section" className="container mx-auto p-6 bg-white rounded-lg shadow-md my-6">

<div className="flex justify-between items-center mb-6">

<h2 id="comment-title" className="text-2xl font-bold">Customer Reviews</h2>

<button

className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"

onClick={() => setCommentFormVisible(!commentformVisible)}

>

Add Review

</button>

</div>



{product.reviews?.length === 0 ? (

<p className="text-gray-500 italic">No reviews yet! Be the first to leave one.</p>

) : (

<ul className="space-y-4">

{product.reviews?.map((review: any, index: number) => {

const isRoyalUser = isRoyalty || currentUser?.role === 'admin' || currentUser?.role === 'seller';

const isCommentOwner = Boolean(currentUser?.username) && currentUser.username === review.username;

const canBanish = isRoyalUser || isCommentOwner;



return (

<li key={review._id || index} className="border-b pb-4 flex justify-between items-start">

<div className="flex gap-4">

<Link to = {`/userProfile/${review.userId}`}>

<img

src={review.thumbnailUrl || '/pooplogo.png'}

alt="User Thumbnail"

onError={(e) => {

const target = e.currentTarget as HTMLImageElement;

if (!target.src.endsWith('/pooplogo.png')) {

target.src = '/pooplogo.png';

}

}}

className="w-12 h-12 rounded-full object-cover border"

/>

<div>

<p className="font-semibold text-gray-900">{review.username || 'Anonymous'}</p>

{renderStars(review.rating)}

{review.title && <p className="font-bold text-sm mt-1 text-gray-800">{review.title}</p>}

<p className="text-gray-700 mt-1">{review.comment}</p>

</div>

</Link>

</div>



{canBanish && (

<button

onClick={() => handleDeleteReview(review._id)}

className="text-red-600 hover:text-red-800 text-xs font-semibold px-3 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 transition"

>

Delete

</button>

)}

</li>

);

})}

</ul>

)}

</div>



<Footer />

</div>

);

}



export default ProductPage; 