import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import{Tweet} from "../models/tweets.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user?._id;
    const existingLike= await Like.findOne({
        likedBy:userId,
        video: videoId
    })
    let message = ""
    console.log("phle se like",existingLike)
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        message = "Video unliked successfully"
    }
    else{
        const like = await Like.create({
            likedBy:userId,
            video: videoId
        })
        if(!like){
            throw new ApiError(400, "video cannot be liked")
        }
        message = "Video Liked Successfully"
    }
    return res.status(201).json(new ApiResponse(201, null, message));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user?._id;
    const existingLike= await Like.findOne({
        likedBy:userId,
        comment: mongoose.Types.ObjectId(commentId)
    })
    let message;
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        message= "Comment unliked successfully"
    }
    else{
        const like = await Like.create({
            likedBy:userId,
            comment : mongoose.Types.ObjectId(commentId)
        })
        if(!like){
            throw new ApiError(400, "comment cannot be liked")
        }
        message= "Comment liked successfully"
    }
    return res.status(201).json(new ApiResponse(201, message));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    // console.log(tweetId)
    const userId = req.user?._id;
    const existingLike= await Like.findOne({
        likedBy:userId,
        tweet: new mongoose.Types.ObjectId(tweetId)
    })
    // console.log(existingLike)
    let message;
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        message = "Tweet unliked sucessfully"
    }
    else{
        const like = await Like.create({
            likedBy:userId,
            tweet: new mongoose.Types.ObjectId(tweetId)
        })

        if(!like){
            throw new ApiError(400, "tweet cannot be liked")
        }
        message = "Tweet liked sucessfully"
    }
    return res.status(201).json(new ApiResponse(201, message));

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    console.log(userId)
    const video = await Like.aggregate([
        {
            $match:{
                likedBy: userId
            }
        },{
            $lookup:{
                from :"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideos",
            }
        },
        {
            $unwind: "$likedVideos"
        },{
            $lookup:{
                from: "users",
                localField: "likedVideos.owner",
                foreignField: "_id",
                as: "likedVideos.ownerDetails"
            }
        },{
            $unwind: "$likedVideos.ownerDetails"
        }
    ])
    console.log(video)

    return res
    .status(201)
    .json(
        new ApiResponse(201, video, "videos fetched successfully")
    )
})

export const getAlltheLikes = asyncHandler( async (req, res)=>{
    const userId = req.user?._id;
    console.log(userId)
    const like = await Like.findOne({
        likedBy: userId
    })
    // console.log(like)
    return res.status(201)
    .json(new ApiResponse(201, like, "Likes fetched Successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}