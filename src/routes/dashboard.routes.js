import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getChannelStats)
router.route("/video").get(getChannelVideos)


export default router