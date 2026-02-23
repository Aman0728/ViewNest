import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribe = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(req.user._id),
                channel: new mongoose.Types.ObjectId(channelId)
            }
        }
    ])
    if(subscribe.length === 0) {
        const subscribed = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        return res.status(200)
        .json(new ApiResponse(200, true, "Channel subscribed successfully"))
    }
    const unsubscribed = await Subscription.findByIdAndDelete(subscribe[0]._id)
    return res.status(200)
    .json(new ApiResponse(200, false, "Channel unsubscribed successfully"));
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users", 
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: {path: "$subscriberDetails"}
        },
        {
            $project: {
                _id: 1,
                userId: "$subscriberDetails._id",
                username: "$subscriberDetails.username",
                avatar: "$subscriberDetails.avatar"
            }
        }
    ])
    console.log(subscribers)
    if(!subscribers) throw new ApiError(400, "Unable to fetch subscribers");
    return res.status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers detail fetched successfully"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannels"
            }
        },
        {
            $unwind: {path: "$subscribedChannels"}
        },
        {
            $project: {
                _id: 1,
                userId: "$subscribedChannels._id",
                username: "$subscribedChannels.username",
                avatar: "$subscribedChannels.avatar"
            }
        }
    ])
    console.log("JOPPPP", channels)
    if(!channels) throw new ApiError(400, "Unable to fetch subscribed channels");
    return res.status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}