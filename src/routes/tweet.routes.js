import { verifyJWT } from "../middlewares/auth.middleware";
import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller";

const router = Router();
router.use(verifyJWT)

router.route("/").get(getUserTweets)
router.route("/create").post(createTweet)
router.route("/update").put(updateTweet)
router.route("/delete").delete(deleteTweet)


export default router