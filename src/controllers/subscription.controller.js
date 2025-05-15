import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;
    // console.log(req.params)
    const channelId  = req.params.channelId;
    // console.log(subscriberId)
    // console.log(channelId)

    if (subscriberId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself.");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: new mongoose.Types.ObjectId(channelId)
    });

    let message = "";
    // console.log(existingSubscription)

    if (existingSubscription) {
        // Unsubscribe
        await Subscription.deleteOne({ _id: existingSubscription._id });
        message = "Unsubscribed successfully.";
    } 
    else {
        // Subscribe
        const subscription = await Subscription.create({
            subscriber: subscriberId,
            channel: new mongoose.Types.ObjectId(channelId)
        });
        console.log(subscription)
        if(!subscription){
            throw new ApiError(400,"could not subscribe the channel")
        }
        message = "Subscribed successfully.";
    }

    return res.status(200).json(new ApiResponse(200, null , message));
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriber = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup:{
               from: "users",
               localField: "subscriber",
               foreignField: "_id",
               as: "subscriberDetails" 
            }
        },
        {
            $unwind:"$subscriberDetails"
        },
        {
            $project: {
                subscriberId: "$subscriberDetails._id",
                fullName: "$subscriberDetails.fullname",
                avatar:"$subscriberDetails.fullname"
            }
        }
    ])
    console.log(subscriber)
    return res.json(
        new ApiResponse(201, subscriber, "Subscriber fetched SuccessFully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const  subscriberId  = req.user._id
    const channels = await Subscription.aggregate([
        {
            $match: {subscriber: new mongoose.Types.ObjectId(subscriberId)}
        },
        {
            $lookup:{
                from: "users",
                localField:"channel",
                foreignField: "_id",
                as: "channelDetail"
            }
        },{
            $unwind: "$channelDetail"
        },
        {
            $project:{
                channelId: "$channelDetail._id",
                username: "$channelDetail.username",
                avatar: "$channelDetail.avatar"
            }
        }
    ])
    console.log(channels)
    return res.status(201)
    .json(new ApiResponse(201, channels, "ChannelSubscribed fetched SuccessFully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}