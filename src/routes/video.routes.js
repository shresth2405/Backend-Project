import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus, increaseViews, getAllVideo } from "../controllers/video.controller.js";

const router = Router()

router.use(verifyJWT);

router.route("/publish").patch(
    upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbNail",
        maxCount: 1
    }
]),publishAVideo);

router.route("/").get(getAllVideo)

router.route("/:videoId").get(getVideoById)
router.route("/update/:videoId").put(updateVideo);
router.route("/delete/:videoId").delete(deleteVideo)
router.route("/toggleStatus/:videoId").put(togglePublishStatus)
router.route("/increaseViews/:videoId").put(increaseViews)

export default router