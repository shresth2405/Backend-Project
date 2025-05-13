
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();
router.use(verifyJWT);

router.route("/").put(toggleVideoLike)
router.route("/comment").put(toggleCommentLike)
router.route("/tweet").put(toggleTweetLike)
router.route("/videos").get(getLikedVideos)

export default router