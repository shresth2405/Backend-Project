import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();
router.use(verifyJWT);

router.route("/toggle").put(toggleSubscription)
router.route("/subscriber").get(getUserChannelSubscribers)
router.route("/channels").get(getSubscribedChannels)

export default router