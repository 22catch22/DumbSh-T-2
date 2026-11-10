import Router from "express"
import { authController } from "../controllers/AuthController.js"

const router = Router()

import { userController } from "../controllers/userController.js"

router.get("/api/users", userController.getAllUsers)
router.get("/api/users/:id", userController.getUserById)

router.put("/api/users/:id", userController.updateUser)
    
router.delete("/api/users/:id",  userController.deleteUser)
router.post("/api/users/:id/reviews", userController.addReview)
router.delete("/api/users/:userId/products/:productId/reviews/:reviewId", userController.deleteReview)
/*Protected Routes*/
router.post("/api/auth/register", authController.registerUser)
router.post("/api/auth/login", authController.loginUser)





export default router