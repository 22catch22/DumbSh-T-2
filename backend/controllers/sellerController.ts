import SellerModel from "../models/sellerModel.js";
import Express from "express";
import Mongoose from "mongoose";

export const sellerController = {

    getAllSellers: async (req: Express.Request, res: Express.Response) => {
        try {
            const sellers = await SellerModel.find().select('-password');
            res.status(200).json(sellers);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch sellers", error });
        }
    },
    
    getSeller: async (request: Express.Request, response: Express.Response) => {
        try {
            const id = request.params.id;
            const seller = await SellerModel.findById(id).select('-password');
            
            if (!seller) {
                return response.status(404).json({ message: "Seller not found" });
            }
            
             
            return response.status(200).json({ seller });
        } catch (error) {
            console.error("Error fetching profile", error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    deleteSeller: async (req: Express.Request, res: Express.Response) => {
        try {
            await SellerModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: "Seller deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Failed to delete seller", error });
        }
    },
 
    updateSeller: async (req: Express.Request, res: Express.Response) => {
        try {
            const updatedSeller = await SellerModel.findByIdAndUpdate(
                req.params.id, 
                req.body, 
                { new: true }
            ).select('-password');
            
            return res.status(200).json(updatedSeller);
        } catch (error) {
            res.status(500).json({ message: "Failed to update seller", error });
        }
    },
};