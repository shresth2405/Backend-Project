import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT)

router.route("/createPlaylist").post(createPlaylist);
router.route("/").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/add/:playlistId/:videoId").post(addVideoToPlaylist);
router.route("/delete/:playlistId/:videoId").delete(removeVideoFromPlaylist);
router.route("/delete/:playlistId").delete(deletePlaylist);
router.route("/update/:playlistId").put(updatePlaylist);

export default router