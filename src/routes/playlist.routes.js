import { verifyJWT } from "../middlewares/auth.middleware";
import { Router } from "express";
import { createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller";

const router = Router();

router.use(verifyJWT)

router.route("/createPlaylist").post(createPlaylist);
router.route("/").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId/videos/:videoId").post(getPlaylistById);
router.route("delete/:playlistId/videos/:videoId").delete(removeVideoFromPlaylist);
router.route("delete/:playlistId").delete(deletePlaylist);
router.route("update/:playlistId").put(updatePlaylist);

export default router