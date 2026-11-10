import Product from "../models/productModel.js"
import Express from "express"
import Mongoose from "mongoose"
 


export const productController = {

    getAllProducts: async (req: Express.Request, res: Express.Response) => {
        try {
            const products = await Product.find();
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch products...and success", error });
        }
    },
    
    getProductById: async (req: Express.Request, res: Express.Response)=>{
     try{
    const product = await Product.findById(req.params.id)
    return res.status(200).json(product)
     }
     catch(error){
        res.status(500).json({ message: "Sorry pal, but we couldn't fetch the product", error });
     }

    },


    createProduct: async (req: Express.Request, res: Express.Response) => {
    try{
       const newProduct = await Product.create(req.body);
    console.log("Product Created: ", newProduct, " Dear Lord, What have you done?!");
       return res.status(201).json(newProduct);
   
    }
    catch(error){
       res.status(500).json({ message: "Failed to create product", error });
    }
    },


   deleteProduct:async(req:Express.Request,res:Express.Response)=>{
    try{
       const product = await Product.findByIdAndDelete(req.params.id);
       console.log("Product Deleted. You Monster.")
       return res.status(200).json(product);
   
    }
    catch(error){
       res.status(500).json({ message: "Failed to delete product", error });
    }
   },
 
    updateProduct: async (req: Express.Request, res: Express.Response) => {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(updatedProduct);
        } catch (error) {
            res.status(500).json({ message: "Failed to update product", error });
        }
    },
};