 
import mongoose from "mongoose";


const CartSchema = new mongoose.Schema({
cartItems: [],
totalprice: { type: Number, required: true },
}, { timestamps: true });

const Cart = mongoose.model("Cart", CartSchema);
export { Cart };


const PurchaseSchema = new mongoose.Schema({
productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
productname: { type: String, required: true },
thumbnailUrl:{type:String},
sellerName: { type: String, required: true },
price: { type: Number, required: true },
quantity:{type:Number, required: true},
purchaseAt: { type: Date, default: Date.now },
});

const Purchase = mongoose.model("Purchase", PurchaseSchema);
export { Purchase };




const ReviewSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
username: { type: String, required: true },
thumbnailUrl: { type: String },
comment: { type: String, required: true },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now },
 
});

const Review = mongoose.model("Review", ReviewSchema);
export { Review };





const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    emailaddress: { type: String, required: true },
    password: { type: String, required: true },
    userthumbnailurl: { type: String },
    userreviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Purchase" }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cart" }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;