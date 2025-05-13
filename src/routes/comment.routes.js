import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments)
router.route("/add/:videoId").get(addComment)
router.route("/update/:commentId").put(updateComment)
router.route("/delete/:commentId").delete(deleteComment)

export default router