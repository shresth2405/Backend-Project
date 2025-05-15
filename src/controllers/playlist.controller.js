import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const playlist = await Playlist.create({
        name:name,
        description: description,
        owner: req.user?._id, 
    })
    if(!playlist){
        throw new ApiError(400,"Playlist cannot be created")
    }
    return res.status(201).json(new ApiResponse(201, playlist ,"Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const playlist = await Playlist.find({owner: new mongoose.Types.ObjectId(userId)});
    if(!playlist){
        throw new ApiError(400,"Playlist not found")
    }
    return res.status(201).json(new ApiResponse(201, playlist, "PLaylist fetched successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400, "Playlist cannot be fetched successfully");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(201, playlist, "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    // console.log(playlistId, videoId)
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);
    if(!video || !playlist){
        throw new ApiError(400, "Video Or PLaylist is missing")
    }
    console.log(video, playlist)
    const isAlreadyInPlaylist = playlist.videos.includes(video._id);
    if (isAlreadyInPlaylist) {
        throw new ApiError(400, "Video already exists in playlist");
    }
    playlist.videos.push(video);
    await playlist.save({validateBeforeSave: false});
    return res
    .status(201)
    .json(
        new ApiResponse(201,"Video added Successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);
    playlist.videos.filter(Video=>Video._id!=video._id);
    await playlist.save({validateBeforeSave:false})
    return res
    .status(201)
    .json(
        new ApiResponse(201,"Video removed Successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    await Playlist.findByIdAndDelete(playlistId);
    return res.status(201).json(new ApiResponse(201,"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    const playlist = await Playlist.findByIdAndUpdate((playlistId),{
        $set:{
            name:name,
            description: description
        }
    })
    return res.status(201).json(new ApiResponse(201, playlist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}