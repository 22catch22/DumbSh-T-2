import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router";

import { getAllUsers } from "../functions/getUserData";

import { getAllProducts, Product } from "../functions/getAllProducts";

import { useSellerData } from "../functions/getSellerData";

import CustomerSupportModal from "./customerSupportModal";

import poopLogo from "../assets/pooplogo.png";



function Navbar(){

const navi = useNavigate();



const token = localStorage.getItem('token');

const [searchProducts, setSearchProducts] = useState<Product[]>([]);

const [searchModalVisible, setSearchModalVisible] = useState(false);

const [logoutModalVisible, setLogoutModalVisible] = useState(false);

const [Query, setQuery] = useState('');

const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const storedSellerId = localStorage.getItem('sellerId') || undefined;



const { currentSeller, loading: sellerLoading, getSellerData } = useSellerData(() => navi("/user-login-page"), storedSellerId);

const handleNavi = () => {

navi("/user-login-page");

};

const { currentUser, getUserData } = getAllUsers(handleNavi);


const handySearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {

setQuery(event.target.value);

};



const LeaveSearchModal = () => {

setSearchModalVisible(false);

setQuery('');

setSearchProducts([]);

};



const ShowLogoutModal = () => {

setLogoutModalVisible(true);

};


const totalCartItems = (currentUser || currentSeller)?.cart?.reduce((total, cartObj) => {

const itemsSum = cartObj.cartItems?.reduce((subTotal, item) => subTotal + (item.quantity || 0), 0) || 0;

return total + itemsSum;

}, 0) || 0;


useEffect(() => {

getUserData();


let activeSellerId = localStorage.getItem('sellerId') || localStorage.getItem('userId') || localStorage.getItem('_id');


if (!activeSellerId && token) {

try {

const base64Url = token.split('.')[1];

const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {

return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);

}).join(''));

const decoded = JSON.parse(jsonPayload);

activeSellerId = decoded.sellerId || decoded._id || decoded.id;

} catch (e) {

console.error("Failed to parse JWT token in Navbar:", e);

}

}



getSellerData(activeSellerId || undefined);

}, []);



const GimmieGoodies = async () => {

try {

const data = await getAllProducts();

let filter = (data?.filter((query) => query.productname.toLowerCase().includes(Query.toLowerCase())) || []);

setSearchProducts(filter);

setSearchModalVisible(true);

} catch (error) {

console.error("Failed to get the goods", error);

}

};



const resolveProfileImage = () => {

const itsraw = currentUser?.userthumbnailurl || currentSeller?.sellerthumbnailurl || poopLogo;

const trimmedThumb = itsraw.trim();


const resolvedThumbnail: string = !trimmedThumb

? '/pooplogo.png'

: trimmedThumb.startsWith('http') || trimmedThumb.startsWith('/')

? trimmedThumb

: `/${trimmedThumb}`;


return resolvedThumbnail;

};



const Logout = () => {

if(currentUser){

localStorage.removeItem('userId');

localStorage.removeItem('token');

localStorage.removeItem('userRole');

setLogoutModalVisible(false);

navi('/');

} else if(currentSeller){

localStorage.removeItem('sellerId');

localStorage.removeItem('token');

localStorage.removeItem('userRole');

setLogoutModalVisible(false);

navi('/');

} else {

localStorage.removeItem('token');

setLogoutModalVisible(false);

navi('/');

}

};



return (

<nav id="navbar" className="relative flex shrink items-center justify-between w-full bg-gray-400 px-4 py-2 min-h-16 z-50">


{/* Logo and Brand Name */}

<a href="/" className="flex items-center gap-2 shrink-0" id="logo">

<img

id="poop-logo"

src={poopLogo}

className="h-10 sm:h-12 relative -ml-2"

alt="Logo"

/>

<span

id="logo-text"

className="font-sans font-bold text-lg sm:text-xl tracking-tight text-slate-800 hover:text-slate-600 transition"

>

Dumb Sh!t

</span>

</a>



{/* Mobile Right Icons Container (Cart + Hamburger) */}

<div className="flex items-center gap-3 md:hidden">

{/* Mobile Cart Icon Link */}

{token && (currentUser ? true : currentSeller ? true : false) && (

<Link to="/checkout" className="relative text-gray-700 hover:text-purple-600">

<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />

</svg>

{totalCartItems > 0 && (

<span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">

{totalCartItems}

</span>

)}

</Link>

)}



{/* Mobile Hamburger Button */}

<button

onClick={() => setMobileMenuOpen(!mobileMenuOpen)}

className="p-2 rounded-lg text-slate-800 hover:text-gray-900 hover:bg-gray-300 focus:outline-none"

aria-label="Toggle Menu"

>

{mobileMenuOpen ? (

/* Close / X Icon */

<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

</svg>

) : (

/* Hamburger Icon */

<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />

</svg>

)}

</button>

</div>



{/* Desktop & Search Container */}

<div className={`flex flex-row shrink items-center justify-between ${mobileMenuOpen ? 'flex flex-col pb-3' : 'hidden md:flex'}`}>


{/* Search Bar */}

{/* Search Bar Container */}


<input

placeholder="Search..."

type="text"

id="searchbar-input"

value={Query}

required

onChange={handySearchChange}

className=" h-10 shrink transition-all duration-300 ease-in-out border rounded-l-md px-3 py-1.5 "

/>

<button

id="search-button"

onClick={GimmieGoodies}

className="bg-blue-500 text-white px-4 py-2 text-sm rounded-r-md hover:bg-blue-600 focus:outline-none shrink-0"

>

Search

</button>




{/* Search Modal */}

{searchModalVisible && (

<div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 p-4 overflow-scroll">

<div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col relative">

<div className="p-4 border-b flex justify-between items-start bg-white">

<h2 className="text-lg font-bold">Search Results</h2>

<button

onClick={LeaveSearchModal}

className="text-gray-500 hover:text-black bg-white font-bold text-lg"

>

✕

</button>

</div>



<div className="overflow-y-auto flex-grow">

{searchProducts.length > 0 ? (

<ul className="divide-y divide-gray-200">

{searchProducts.map((product) => (

<li key={product._id} className="py-2 hover:bg-gray-100 cursor-pointer">

<Link

to={`/productpage/${product._id}`}

className="text-gray-800 hover:text-gray-600 flex items-center gap-3 text-sm px-4"

onClick={() => { setSearchModalVisible(false); setMobileMenuOpen(false); }}

>

{product.imageUrl && (

<img

src={product.imageUrl}

alt={product.productname}

className="w-10 h-10 object-cover rounded flex-shrink-0 border"

/>

)}

<div>

<p className="font-semibold">{product.productname}</p>

{product.price && (

<span className="text-gray-500 text-xs">${product.price.toFixed(2)}</span>

)}

</div>

</Link>

</li>

))}

</ul>

) : (

<div className="px-4 py-4 text-gray-500 text-sm text-center">No products found.</div>

)}

</div>

</div>

</div>

)}

</div>



{/* Account Actions & Desktop Cart */}

<div id="account-sign-in" className="hidden md:flex shrink items-center gap-4">

{token && (currentUser || currentSeller) ? (

<>

<div id='user-profile' className="flex items-center gap-2 relative">

<img

src={resolveProfileImage()}

className="w-10 h-10 rounded-full object-cover border border-slate-400"

alt="Profile"

onError={(e) => {

const target = e.currentTarget as HTMLImageElement;

if (!target.src.includes('pooplogo.png')) {

target.src = poopLogo;

}

}}

/>

<Link

to={currentUser?._id ? `/userProfile/${currentUser._id}` : currentSeller?._id ? `/sellerDashboard/${currentSeller._id}` : '#'}

>

<p id='user-profile-name' className="font-sans font-bold text-base text-slate-800 hover:text-slate-600 transition">

{currentUser?.username || currentSeller?.sellername}

</p>

</Link>

</div>

<button

onClick={ShowLogoutModal}

className="text-sm font-medium text-red-600 hover:text-red-800"

>

Logout

</button>

</>

) : (

<Link

to="/seller-or-user-login"

className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"

>

Sign In

</Link>

)}



{/* Desktop Cart Link */}

{token && (currentUser ? true : currentSeller ? true : false) && (

<div className="flex items-center">

<Link to="/checkout" className="relative text-gray-700 hover:text-purple-600">

<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />

</svg>

{totalCartItems > 0 && (

<span className="absolute bottom-1 -right-2 transform translate-x-2 -translate-y-6 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">

{totalCartItems}

</span>

)}

</Link>

</div>

)}

</div>



{/* Mobile Dropdown Menu Drawer for the Slaves of the Mobile */}

{mobileMenuOpen && (

<div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-300 shadow-xl py-4 px-6 flex flex-col gap-4 z-50">


{/* Mobile Profile & Auth Section inside Drawer */}

<div className = "flex border p-4 flex-col gap-3">

<div className="pt-5 gap-3">

<h2 className="font-bold w-full">Menu



<button

onClick={() => { setMobileMenuOpen(false); }}

className="text-center font-sm font-bold py-2 "

>

X

</button>

</h2>

{token && (currentUser || currentSeller) ? (

<>

<div className="flex flex-row ">


<Link

to={currentUser?._id ? `/userProfile/${currentUser._id}` : currentSeller?._id ? `/sellerDashboard/${currentSeller._id}` : '#'}

onClick={() => setMobileMenuOpen(false)}

className="font-bold flex flex-row "

>


<img

src={resolveProfileImage()}

className="w-20 h-20 rounded-full object-contain shrink-0 border border-slate-400"

alt="Profile"

/>

<div className = "ml-3 my-auto text-black"> {currentUser?.username || currentSeller?.sellername}</div>

</Link>


</div>

<button

className="text-center bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg transition border border-red-200"

onClick={ShowLogoutModal}>Log Out</button>



</>

) : (

<Link

to="/seller-or-user-login"

onClick={() => setMobileMenuOpen(false)}

className="w-[500px] text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition"

>

Sign In

</Link>

)}

</div>

</div>

</div>

)}



{/* Logout Confirmation Modal */}

{logoutModalVisible && (

<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

<div className="bg-white p-6 rounded-lg shadow-lg mx-4 max-w-sm w-full">

<h3 className="text-lg font-bold mb-4">Confirm Logout</h3>

<p className="mb-4 text-sm">Are you sure you want to logout?</p>

<div className="flex gap-2 justify-center">

<button

onClick={() => setLogoutModalVisible(false)}

className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-md text-sm font-medium"

>

Cancel

</button>

<button

onClick={Logout}

className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md text-sm font-medium"

>

Logout

</button>

</div>

</div>

</div>

)}


</nav>

);

}



export default Navbar; 