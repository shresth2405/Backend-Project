import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, getUserchannelProfile, getWatchHistory, changePassword, changeAvatar } from "../controllers/user.controller.js"
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
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-Token").post(refreshAccessToken)
router.route("/c/:username").get(getUserchannelProfile)
router.route("/getWatchHistory").get(verifyJWT, getWatchHistory)
router.route("/changepassword").post(verifyJWT, changePassword);
router.route("/changeavatar").patch(verifyJWT, upload.single("newAvatarpath"), changeAvatar);


export default router
