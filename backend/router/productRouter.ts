import {Router} from "express"
import { protect } from "../controllers/auth.js"

 
import { productController } from "../controllers/productController.js"
const router = Router()
router.get("/api/products", productController.getAllProducts);
router.get("/api/products/:id", productController.getProductById);
router.post("/api/products", protect, productController.createProduct);
router.put("/api/products/:id", protect, productController.updateProduct);
router.delete("/api/products/:id", protect, productController.deleteProduct);
 

export default router