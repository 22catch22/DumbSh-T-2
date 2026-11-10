import express from "express";
import mongoose from "mongoose";
import productRoutes from "./router/productRouter.js";
import userRoutes from "./router/userRouter.js";
import sellerRoutes from "./router/sellerRouter.js";
import cors from "cors";
import cookiemewantcookie from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;



app.use(cors());
app.use(cookiemewantcookie());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. God is in his heaven, all's right with the world.`);

});
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:3000/DumbSh!t")
  .then(() => console.log ('MONGO RUNNING. MONGO LOVE CANDY!!!'))
  .catch((err) => console.error("MongoDB connection error:", err,"Third Impact is upon us!"));

// Import and use routes here
 
app.use(productRoutes);
app.use(userRoutes);
app.use(sellerRoutes);

