import User from "../models/userModel.js"
import Express from "express"
import Mongoose from "mongoose"
import Product from "../models/productModel.js"


export const userController = {

    getAllUsers: async (req: Express.Request, res: Express.Response) => {
        try {
            const users = await User.find();
            if (!users || users.length === 0) {
                return res.status(404).json({ message: "No users found. Well That sucks..." });
            }
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch users", error });
        }
    },
    
    getUserById: async (req: Express.Request, res: Express.Response)=>{
     try{
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
        return res.status(404).json({ message: "User not found. Well That sucks..." });
    }
    return res.status(200).json(user)


     }
     catch(error){
        res.status(500).json({ message: "Failed to fetch user", error });
     }

    },

   deleteUser:async(req:Express.Request,res:Express.Response)=>{
    try{
       const user = await User.findByIdAndDelete(req.params.id);
       if (!user) {
           return res.status(404).json({ message: "User not found. Well That sucks..." });
       }
       return res.status(200).json(user);
    }
    catch(error){
       res.status(500).json({ message: "Failed to delete user", error });
    }
   },
 
    updateUser: async (req: Express.Request, res: Express.Response) => {
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ message: "THE USER WAS NOT FOUND! OH WHERE OH WHERE COULD HE BE?!!!" });
            }
            
            return res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: "Failed to update user", error });
        }
    },

addReview: async (req: Express.Request, res: Express.Response) => {
   try{
const userId = req.params.id;
const { productId, rating, comment } = req.body;
 if (!productId || !rating || !comment)
 {
    return res.status(400).json({ message: "Product ID, rating, and comment are required" });
 }

 const product = await Product.findById(productId);
 if (!product) {
    return res.status(404).json({ message: "Product not found" });
 }
 const user = await User.findById(userId);
 if (!user) {
    return res.status(404).json({ message: "User not found" });
 }
 const newReview = {
product:productId,
username: user.username, 
userthumbnailurl: user.userthumbnailurl,
rating: Number(rating),
comment,
createdAt: new Date(),

 }
await Product.findByIdAndUpdate(productId, { $push: { reviews: newReview } });
return res.status(201).json(newReview);

   }
   catch(error){
      res.status(500).json({ message: "Failed to add review", error });
   }


   },

 deleteReview: async (req: Express.Request, res: Express.Response) => {
   try{
      const { productId, reviewId, userId } = req.params;
      const product = await Product.findById(productId);
      const user = await User.findById(userId);
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }
      if (!product) {
         return res.status(404).json({ message: "Product not found" });
      }
    
 
 product.reviews = product.reviews.filter(
  id => id.toString() !== reviewId
);
user.userreviews = user.userreviews.filter(
  id => id.toString() !== reviewId
);

await product.save();
await user.save();
      return res.status(200).json({ message: "Review deleted successfully" });
   }
   catch(error){
      res.status(500).json({ message: "Failed to delete review", error });
   }
 },


};