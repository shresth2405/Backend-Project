import { Router } from "express";
import { loginUser, registerUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImg",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)
//secured route
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-Token").post(refreshAccessToken)

export default router
