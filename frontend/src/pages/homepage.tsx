import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HomepageCarousel from "../components/Carousel";
import { Link } from "react-router-dom";
/*import Footer from "../components/Footer";*/
/*import CustomerSupportModal from "../components/customerSupportModal";*/
import { getAllUsers } from "../functions/getAllUsers";
import { useNavigate } from "react-router-dom";
import { useProductData, Product } from "../functions/getProductByID";
import mongoose from "mongoose";
import { getAllProducts } from "../functions/getAllProducts";

export interface Cart {
  _id?: string | mongoose.Types.ObjectId;
  cartItems: { item: Product; quantity: number }[];
  totalprice: number;
}
export interface Review {
  _id?: string;
  username?: string;
  thumbnailUrl?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt?: string | Date;
}

export interface User {
  _id?: string;
  username: string;
  emailaddress: string;
  password?: string;
  userthumbnailurl: string;
  userreviews: Review[];
  purchases?: Purchase[];
  role: "user" | "seller" | "admin";
  cart?: Cart[];
}

export interface Purchase {
  _id: string;
  productname: string;
  productId?: string;
  sellerName?: string;
  sellername?: string;
  thumbnailUrl: string;
  price: number;
  quantity: number;
  purchasedAt?: Date | string;
}

function Homepage() {
  const [users, setUsers] = useState<User[]>([]);
  const [bestSellers, setBestSellers] = useState<Purchase[]>([]);
  const [topSeller, setTopSeller] = useState<Purchase | null>(null);
  const navigate = useNavigate();
  const [handgproducts, setHandgProducts] = useState<Product[]>([]);
  const [healthproducts, setHealthProducts] = useState<Product[]>([]);
  const [techproducts, settechProducts] = useState<Product[]>([]);
  const [hardwareproducts, sethardwareProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchAllCatalogs() {
      try {
        const allProducts = await getAllProducts();

        setHandgProducts(
          allProducts
            .filter((p: any) => p.category === "Home and Garden")
            .slice(0, 3)
        );

        setHealthProducts(
          allProducts
            .filter((p: any) => p.category === "Health")
            .slice(0, 3)
        );

        settechProducts(
          allProducts
            .filter((p: any) => p.category === "Tech")
            .slice(0, 3)
        );

        sethardwareProducts(
          allProducts
            .filter((p: any) => p.category === "Hardware")
            .slice(0, 3)
        );
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    }

    fetchAllCatalogs();
  }, []);

  useEffect(() => {
    // Fetches all users and their purchases to determine best sellers
    async function fetchUsers() {
      try {
        const data = await getAllUsers();
        const fetchedUsers:Array<User> = Array.isArray(data) ? data : [];
        setUsers(fetchedUsers);

        const items: Purchase[] = [];

        fetchedUsers.forEach((user) => {
          if (Array.isArray(user.purchases)) {
            user.purchases.forEach((purchase) => {
              if (purchase.quantity > 0) {
                items.push(purchase);
              }
            });
          }
        });

        const aggregated = items.reduce((acc, purchase) => {
          const name = purchase.productname || (purchase as any).productName;
          const existing = acc.find(
            (p) => (p.productname || (p as any).productName) === name
          );

          if (existing) {
            existing.quantity += purchase.quantity || 0;
          } else {
            acc.push({ ...purchase });
          }
          return acc;
        }, [] as Purchase[]);

        aggregated.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

        setBestSellers(aggregated);
        setTopSeller(aggregated.length > 0 ? aggregated[0] : null);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50">
      <Navbar />
  
      {/* Main content expands to fill space, keeping footer anchored at bottom */}
      <main className="flex-grow container mx-auto px-4 mt-0 pt-0 space-y-12">
      <HomepageCarousel/>

        {/* Best Seller Section */}
        <div id="homepage-content" className="flex flex-col items-center">
          <p id="best-seller-title" className="text-3xl font-bold mb-4">
            Best Selling Sh!t
          </p>
          {topSeller ? (
            <Link to={`/productpage/${topSeller.productId || topSeller._id}`} className="group flex flex-col items-center justify-center">
              <div id="best-seller-content" className="flex flex-col items-center justify-center text-2xl font-bold">
                <div className="w-[400px] h-[400px] overflow-hidden rounded-lg shadow-md bg-white flex items-center justify-center">
                  <img
                    src={topSeller.thumbnailUrl || '/pooplogo.png'}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    alt="Top Seller"
                  />
                </div>
                <span className="mt-2 text-black">{topSeller.productname}</span>
              </div>
            </Link>
          ) : (
            <p className="text-gray-500 italic">No best sellers yet!</p>
          )}
        </div>

        {/* Home and Garden Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 id="home-and-garden-title" className="text-3xl font-bold">Home and Garden Sh!t</h2>
            <Link to="/home-and-garden-catalog" className="text-blue-600 hover:underline font-semibold">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {handgproducts.map((product) => (
              <Link key={product._id} to={`/productpage/${product._id}`} className="group border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition flex flex-col">
                <div className="h-40 w-full overflow-hidden rounded">
                  <img src={product?.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
                </div>
                <h3 className="font-semibold mt-2 text-lg text-black">{product.name}</h3>
                <p className="text-indigo-600 font-bold text-xl">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Health Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 id="health-title" className="text-3xl font-bold">Health Sh!t</h2>
            <Link to="/health-catalog" className="text-blue-600 hover:underline font-semibold">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {healthproducts.map((product) => (
              <Link key={product._id} to={`/productpage/${product._id}`} className="group border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition flex flex-col">
                <div className="h-40 w-full overflow-hidden rounded">
                  <img src={product?.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
                </div>
                <h3 className="font-semibold mt-2 text-lg text-black">{product.name}</h3>
                <p className="text-indigo-600 font-bold text-xl">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Tech Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 id="tech-title" className="text-3xl font-bold">Tech Sh!t</h2>
            <Link to="/tech-catalog" className="text-blue-600 hover:underline font-semibold">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techproducts.map((product) => (
              <Link key={product._id} to={`/productpage/${product._id}`} className="group border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition flex flex-col">
                <div className="h-40 w-full overflow-hidden rounded">
                  <img src={product?.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
                </div>
                <h3 className="font-semibold mt-2 text-lg text-black">{product.name}</h3>
                <p className="text-indigo-600 font-bold text-xl">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Hardware Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 id="hardware-title" className="text-3xl font-bold">Hardware Sh!t</h2>
            <Link to="/hardware-catalog" className="text-blue-600 hover:underline font-semibold">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hardwareproducts.map((product) => (
              <Link key={product._id} to={`/productpage/${product._id}`} className="group border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition flex flex-col">
                <div className="h-40 w-full overflow-hidden rounded">
                  <img src={product?.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
                </div>
                <h3 className="font-semibold mt-2 text-lg text-black">{product.name}</h3>
                <p className="text-indigo-600 font-bold text-xl">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
        
      </main>

   
    </div>
  );
}

export default Homepage;
