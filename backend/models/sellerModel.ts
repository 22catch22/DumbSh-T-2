import mongoose from "mongoose";


const SellerSchema = new mongoose.Schema({  
sellername: { type: String, required: true },
emailaddress: { type: String, required: true },
password: { type: String, required: true },
sellerthumbnailurl: { type: String },
productsforsale: { type: Array },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now },
});

const Seller = mongoose.model("Seller", SellerSchema);
export default Seller;
