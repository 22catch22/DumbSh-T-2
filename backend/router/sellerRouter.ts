import {Router} from "express"
import { authController } from "../controllers/AuthController.js"


import { sellerController } from "../controllers/sellerController.js"

 

const router = Router()
 
router.get("/api/sellers", sellerController.getAllSellers);
router.get("/api/sellers/:id", sellerController.getSeller);

router.put("/api/sellers/:id", sellerController.updateSeller);
router.delete("/api/sellers/:id", sellerController.deleteSeller);

/*Protected Routes*/
router.post("/api/auth/register", authController.registerSeller);
router.post("/api/auth/login", authController.loginSeller);


export default router