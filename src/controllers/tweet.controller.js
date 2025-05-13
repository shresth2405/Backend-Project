import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const content = req.query
    const owner = req.user?.id
    const tweet = await Tweet.create({
        content: content,
        owner: owner
    })
    if(!tweet){
        throw new ApiError(400,"Tweet cannot be made");
    }
    return new ApiResponse(201, "Tweet created successfully")
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user= user.req?._id;
    const tweet = await Tweet.aggregate([
        {
            $match:{owner: new mongoose.Types.ObjectId(user)}
        },
        {
            $lookup:{
                from: "users",
                localfield: "owner",
                foreignfield: "_id",
                as: "userTweet"
            }
        },{
            $unwind: "$userTweet"
        },
       
    ])
    return new ApiResponse(201, tweet, "Tweets Fetched Successfully")
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const user = req.user?._id
    const {tweetId, content} = req.query
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400, "Tweet cannot be fetched")
    }
    tweet.content= content
    await Tweet.save({validateBeforeSave: false})
    return new ApiResponse(201, "Tweet updated successfully")

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const user = req.user?._id
    const {tweetId} = req.query
    await Tweet.findByIdAndDelete(tweetId);

    return new ApiResponse(201, "Tweet deleted successfully");
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}