import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const content = req.query.content
    const owner = req.user?.id
    const tweet = await Tweet.create({
        content: content.toString(),
        owner: owner
    })
    if(!tweet){
        throw new ApiError(400,"Tweet cannot be made");
    }
    return res.status(201)
    .json(new ApiResponse(201,tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userid= req.user?._id;
    const tweet = await Tweet.aggregate([
        {
            $match:{owner: new mongoose.Types.ObjectId(userid)}
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userTweet"
            }
        },{
            $unwind: "$userTweet"
        },
       
    ])
    return res.status(201)
    .json(new ApiResponse(201,tweet, "Tweet fetched successfully"))
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
    await tweet.save({validateBeforeSave: false})
    return res.status(201)
    .json(new ApiResponse(201,tweet, "Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const user = req.user?._id
    const {tweetId} = req.params
    await Tweet.findByIdAndDelete(tweetId);

    return res.status(201)
    .json(new ApiResponse(201, "Tweet deleted successfully"))
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}