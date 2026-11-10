import React from "react";
import Navbar from "../pages/homepage";
import Footer from "../components/Footer";
import { useState } from 'react';
import { useEffect } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import axios from "axios";
import { getAllUsers, User } from '../../functions/getUserData';
import { Link } from "react-router";

function UserProfile(){
  const API_URL = 'http://localhost:3000';
  const activeToken = localStorage.getItem('token');
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setVisible] = useState(false);
  const [totalprice, setTotalPrice] = useState(0);
  const [activeTab, setActiveTab] = useState<'PersonalInfo' | 'purchases' | 'reviews'>('PersonalInfo');
  const navigate = useNavigate();

  const handleNavi = () => {
    navigate("/user-login-page");
  };

  const { id } = useParams<{ id?: string }>();
  const userId = id || localStorage.getItem('id') || localStorage.getItem('userId');
  const { currentUser, isRoyalty, getUserData } = getAllUsers(handleNavi);

  const [userFormData, setUserFormData] = useState({
    username: "",
    emailaddress: "",
    userthumbnailurl: "",
  });

  // Single unified effect to fetch profile by ID or fallback to currentUser
  useEffect(() => {
    if (!userId || userId === "undefined") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        console.log("Fetching profile for ID:", userId);
        const response = await axios.get(`${API_URL}/api/user/${userId}`);
        
        if (!cancelled) {
          const userData = response.data.data || response.data.user || response.data;
          setProfileUser(userData);
        }
      } catch (error: any) {
        console.error("Failed to load profile:", error.response?.data || error.message);
        if (!cancelled) setProfileUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    getUserData();
  }, []);

  const displayUser = profileUser || currentUser;

  useEffect(() => {
    if (isVisible && displayUser) {
      setUserFormData({
        username: displayUser.username || "",
        emailaddress: displayUser.emailaddress || "",
        userthumbnailurl: displayUser.userthumbnailurl || "/pooplogo.png",
      });
    }
  }, [isVisible, displayUser]);

  // Calculate total spent safely
  useEffect(() => {
    if (displayUser?.purchases && Array.isArray(displayUser.purchases)) {
      const sum = displayUser.purchases.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1) || 0), 0);
      setTotalPrice(sum);
    } else {
      setTotalPrice(0);
    }
  }, [displayUser?.purchases]);

  async function makeFormVisible(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setVisible(true);
  }

  async function handleDeleteAccount(){
    if(!activeToken){
      console.error("No token found. Cannot delete account.");
      return;
    }
    try{  
      const response = await axios.delete(`${API_URL}/api/user/${userId || currentUser?._id}`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      console.log("Account deleted successfully:", response.data);
      localStorage.removeItem('token');
      handleNavi();
    } catch(error){
      console.error("Failed to delete account", error);
    }
  }

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
    return <div className="flex text-lg">{stars}</div>;
  };

  const handleDeleteReview = async (reviewId: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/user/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getUserData(); 
    } catch (error) {
      console.error("Failed to delete review", error);
    }
  };

  const assetImages = import.meta.glob('/src/assets/*', { eager: true, import: 'default' }) as Record<string, string>;

  const resolveProductImage = (purchase: any) => {
    const productDoc = purchase.productId;
    const rawPath = productDoc?.imageUrl || productDoc?.thumbnailUrl || purchase.thumbnailUrl || '';

    if (rawPath.startsWith('http')) return rawPath;

    const filename = rawPath.split('/').pop();
    if (filename) {
      const matchedKey = Object.keys(assetImages).find((key) => key.endsWith(filename));
      if (matchedKey) {
        return assetImages[matchedKey];
      }
    }
    return rawPath || '/pooplogo.png';
  };

  const UpdateUserProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const targetId = userId || currentUser?._id;
      const response = await axios.patch(
        `${API_URL}/api/user/${targetId}`,
        {
          username: userFormData.username,
          emailaddress: userFormData.emailaddress,
          userthumbnailurl: userFormData.userthumbnailurl,
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      await getUserData();
      setVisible(false);
      console.log("Profile updated successfully", response.data);
    } catch(error){
      console.error("Error updating profile", error);
    }
  };
 
  if (loading && !displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading profile...</p>
      </div>
    );
  }

  const isOwner = Boolean(
    currentUser?._id && displayUser?._id && currentUser._id === displayUser._id
  );
  const canModify = isOwner || currentUser?.role === 'admin' || currentUser?.role === 'seller' || isRoyalty;

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 min-h-[800px]">
        {/* Navigation Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'PersonalInfo'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('PersonalInfo')}
          >
            Personal Info
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'purchases'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('purchases')}
          >
            Purchases
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'reviews'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'PersonalInfo' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">
              {displayUser?.username || 'Guest'}
            </h2>

            <img
              src={displayUser?.userthumbnailurl || '/pooplogo.png'}
              alt="Profile Pic"
              loading="eager"
              fetchPriority="high"
              className="w-48 h-48 object-cover mx-auto rounded-full shadow border"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/pooplogo.png'; }}
            />

            <p className="text-lg text-center">
              <b>Name:</b> {displayUser?.username || 'Not provided'}
            </p>
            <p className="text-lg text-center">
              <b>Email:</b> {displayUser?.emailaddress || 'Not provided'}
            </p>
            <p className="text-lg text-center">
              <b>Reviews:</b> {displayUser?.userreviews?.length || 0}
            </p>
            <p className="text-lg text-center">
              <b>Purchases:</b> {displayUser?.purchases?.length || 0}
            </p>
            <p className="text-lg text-center">
              <b>Total Money "Spent":</b> ${totalprice.toFixed(2)}  
            </p>

            {canModify && (
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={makeFormVisible}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Update Profile
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        )}
     
        {activeTab === 'purchases' && (
          <div id="purchase-history" className="space-y-4 w-full mb-10">
            <h3 className="text-xl font-bold mb-2">Purchase History</h3>
            {(!displayUser?.purchases || displayUser.purchases.length === 0) ? (
              <div className="text-center text-gray-500 mt-4">
                <p>No purchases yet!</p>
              </div>
            ) : (
              <ul id="purchase-list" className="space-y-4 w-full">
                {displayUser.purchases.map((purchase: any) => {
                  const imageSrc = resolveProductImage(purchase);
                  const productId = purchase.productId?._id || purchase._id || '#';
                  
                  return (
                    <li key={purchase._id || Math.random()} className="border-b pb-4">
                      <div className="flex flex-row gap-4 text-gray-800 items-center">
                        <img 
                          src={imageSrc}
                          className="w-20 h-20 object-cover rounded border"
                          alt={purchase.productname || 'Product'}
                          onError={(e) => { e.currentTarget.src = '/pooplogo.png'; }}
                        />
                        <div id="purchase-details" className="flex flex-col gap-1">
                          <Link to={`/productpage/${productId}`} className="hover:underline">
                            <p className="font-semibold text-xl">{purchase.productname || 'Unnamed Product'}</p>
                          </Link>
                          <p className="text-gray-600 text-sm">Seller: {purchase.sellername || 'Unknown'}</p>
                          <p className="text-gray-600 font-medium">${(purchase.price || 0).toFixed(2)}</p>
                          <p className="text-gray-600 text-sm">Quantity: {purchase.quantity || 1}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div id="review-history" className="space-y-4 w-full">
            <h3 className="text-xl font-bold mb-2">My Reviews</h3>
            {(!displayUser?.userreviews || displayUser.userreviews.length === 0) ? (
              <p className="text-gray-500">No reviews yet!</p>
            ) : (
              <ul className="space-y-4">
                {displayUser.userreviews.map((review: any, index: number) => {
                  const isRoyalUser = isRoyalty || currentUser?.role === 'admin' || currentUser?.role === 'seller';
                  const isCommentOwner = Boolean(currentUser?.username) && currentUser.username === review.username;
                  const canBanish = isRoyalUser || isCommentOwner;

                  return (
                    <li key={review._id || index} className="border-b pb-3 flex justify-between items-start">
                      <div className="flex gap-3">
                        <img 
                          src={review.thumbnailUrl || '/pooplogo.png'} 
                          alt="User Thumbnail" 
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if(!target.src.endsWith('/pooplogo.png')) {
                              target.src = '/pooplogo.png';
                            }
                          }}
                          className="w-10 h-10 rounded-full object-cover border" 
                        />
                        <div>
                          <p className="font-semibold">{review.username || 'Anonymous'}</p>
                          {renderStars(review.rating)}
                          {review.title && <p className="font-bold text-sm mt-1">{review.title}</p>}
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>

                      {canBanish && review._id && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition"
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
        )}
      </div>

      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative mx-4">
            <h3 className="text-xl font-bold mb-4">Update Profile</h3>
            
            <form onSubmit={UpdateUserProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="modal-name">
                  Change User Name
                </label>
                <input
                  id="modal-name"
                  type="text"
                  className="mt-1 block w-full border rounded p-2"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                />

                <label className="block text-sm font-medium text-gray-700 mt-2" htmlFor="modal-email">
                  Update Email
                </label>
                <input
                  id="modal-email"
                  type="text"
                  className="mt-1 block w-full border rounded p-2"
                  value={userFormData.emailaddress}
                  onChange={(e) => setUserFormData({ ...userFormData, emailaddress: e.target.value })}
                />

                <label className="block text-sm font-medium text-gray-700 mt-2" htmlFor="modal-thumbnail">
                  User Thumbnail Url
                </label>
                <input
                  id="modal-thumbnail"
                  type="text"
                  className="mt-1 block w-full border rounded p-2"
                  value={userFormData.userthumbnailurl}
                  onChange={(e) => setUserFormData({ ...userFormData, userthumbnailurl: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setVisible(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default UserProfile;