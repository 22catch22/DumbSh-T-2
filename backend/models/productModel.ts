import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
productname: { type: String, required: true },
description: { type: String, required: true },
price: { type: Number, required: true },
category: { type: String, required: true },
numberinstock: { type: Number, required: true },
unitssold: { type: Number, required: true, default: 0 },
imageUrl: { type: String, required: true },
sellername: { type: String, required: true },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now },


});

const Product = mongoose.model("Product", ProductSchema);
export default Product;


