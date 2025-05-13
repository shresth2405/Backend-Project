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
    const existingLike= Like.findOne({
        likedBy:userId,
        video: videoId
    })
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully"));
    }
    const like = await Like.create({
        likedBy:userId,
        video: videoId
    })
    if(!like){
        throw new ApiError(400, "video cannot be liked")
    }
    return res.status(201).json(new ApiResponse(201, null, "Video liked successfully"));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user?._id;
    const existingLike= Like.findOne({
        likedBy:userId,
        comment: commentId
    })
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked successfully"));
    }
    const like = await Like.create({
        likedBy:userId,
        comment :commentId
    })
    if(!like){
        throw new ApiError(400, "comment cannot be liked")
    }
    return res.status(201).json(new ApiResponse(201, null, "Comment liked successfully"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id;
    const existingLike= Like.findOne({
        owner:userId,
        tweet: tweetId
    })
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, null, "tweet unliked successfully"));
    }
    const like = await Like.create({
        likedBy:userId,
        tweet: tweetId
    })
    if(!like){
        throw new ApiError(400, "tweet cannot be liked")
    }
    return res.status(201).json(new ApiResponse(201, null, "tweet liked successfully"));

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const video = Like.aggregate([
        {
            $match:{
                owner: mongoose.Types.ObjectId(userId)
            }
        },{
            $lookup:{
                from :"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideos",
                pipeline:[
                    {
                        $lookup:{
                            from : "users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])
    if(!video){
        throw new ApiError(400, "Videos cannot be fetched successfully")
    }
    return res
    .status(201)
    .json(
        new ApiResponse(201, video, "videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}