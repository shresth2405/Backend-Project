
import { getAlltheLikes, getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").put(toggleVideoLike)
router.route("/comment/:commentId").put(toggleCommentLike)
router.route("/tweets/:tweetId").put(toggleTweetLike)
router.route("/videos").get(getLikedVideos)
router.route("/").get(getAlltheLikes)


export default router