import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like, Likes} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user._id;
    const subscriberCount = await Subscription.countDocuments({channel: user})
    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                id: null,
                totalVideos: {$sum: 1},
                totalView: {$sum: "$views"}
            }
        }
    ])

    const videoId = await Video.find({owner: mongoose.Types.ObjectId(channelId)})

    const likeCount = Like.countDocuments({
        video : {$in: videoId}
    })

    const stats = {
        totalViews: totalViews,
        subscriberCount: subscriberCount,
        likeCount: likeCount
    }
    return new ApiResponse(201, stats, "All stats have been achieved")
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const user = req.user?._id

    const videos = await Video.find(
        {owner: mongoose.Types.ObjectId(user)}
    )
    return new ApiResponse(201, videos, "Videos fetched successfully")

})

export {
    getChannelStats, 
    getChannelVideos
    }