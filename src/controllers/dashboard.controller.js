import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user._id;
    const subscriberCount = await Subscription.countDocuments({channel: channelId})
    console.log("count:",subscriberCount)
    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id: null,
                totalVideos: {$sum: 1},
                totalView: {$sum: "$views"}
            }
        }
    ])
    console.log("views:",totalViews)

    const videoId = await Video.find({owner: new mongoose.Types.ObjectId(channelId)})

    const likeCount = await Like.countDocuments({
        video : {$in: videoId._id}
    })

    const stats = {
        totalViews: totalViews,
        subscriberCount: subscriberCount,
        likeCount: likeCount
    }
    return res.status(201)
    .json(new ApiResponse(201, stats, "All stats have been gathered"))
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const user = req.user?._id

    const videos = await Video.find(
        {owner: new mongoose.Types.ObjectId(user)}
    )
   return res.status(201)
    .json(new ApiResponse(201, videos, "Video fetched successfully"))

})

export {
    getChannelStats, 
    getChannelVideos
    }