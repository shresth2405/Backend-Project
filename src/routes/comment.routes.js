import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments)
router.route("/add/:videoId").post(addComment)
router.route("/update/:commentId").put(updateComment)
router.route("/delete/:commentId").delete(deleteComment)

export default router