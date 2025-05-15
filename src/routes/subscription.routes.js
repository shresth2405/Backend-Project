import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/:channelId").put(toggleSubscription)
router.route("/subscriber/:channelId").get(getUserChannelSubscribers)
router.route("/channels").get(getSubscribedChannels)

export default router