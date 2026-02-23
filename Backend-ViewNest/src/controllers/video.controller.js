import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import {Playlist} from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  //TODO: get all videos based on query, sort, pagination
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log(channelId)
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    // {
    //     $project: {
    //         _id: 1,
    //         thumbnail: 1
    //     }
    // }
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

//Temp controller
const temp = asyncHandler(async (req, res) => {
  const random = await Video.aggregate([
    { $match: { isPublished: true } },
    { $sample: { size: 10 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: "$owner" },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        "owner.avatar": 1,
        "owner.fullName": 1,
        views: 1
      }
    }
  ])
  return res
    .status(200)
    .json(new ApiResponse(200, random, "Random videos fetched"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  console.log(req.user);
  const videoLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!video.url) throw new ApiError(400, "Unable to upload the video");
  const createdVideo = await Video.create({
    title,
    description,
    owner: req.user._id,
    duration: video.duration,
    videoFile: video.url,
    isPublished: true,
    thumbnail: thumbnail.url,
  });
  if (!createdVideo) throw new ApiError(400, "Unable to create the video");
  return res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "Video published successfully"));

  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // console.log(videoId)
  // const newvideo = await Video.findById(videoId)
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
        isPublished: true
      },
    },
    {
      $lookup: {
        from: "likes",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$video", new mongoose.Types.ObjectId(videoId)] },
                  {
                    $eq: [
                      "$likedBy",
                      new mongoose.Types.ObjectId(req.user._id),
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "isLiked",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "liked",
      },
    },
    {
      $addFields: {
        isLiked: { $gt: [{ $size: "$isLiked" }, 0] },
        totalLikeCount: { $size: "$liked" },
      },
    },
    {
      $project: {
        liked: 0,
      },
    },
  ]);
  if (!video) throw new ApiError(400, "Unable to fetch the video");
  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const thumbnail = req.file?.path;
  const { title, description } = req.body;
  let updatedVideo;
  if ([title, description, thumbnail].some((e) => e?.trim === "")) {
    throw new ApiError(400, "All the fields are required");
  }
  const uploadThumbnail = await uploadOnCloudinary(thumbnail);
  if(!uploadThumbnail?.url){
    updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: { title, description, },
      },
      { new: true, runValidators: false },
    );
  }else {
    const existingVideo = await Video.findById(videoId);
    if(!existingVideo) throw new ApiError(400, "Unable to find the video");
    await deleteFromCloudinary(existingVideo.thumbnail, "image")
    updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: { title, description, thumbnail: uploadThumbnail.url },
      },
      { new: true, runValidators: false },
    );

  }
  if (!updatedVideo) throw new ApiError(400, "Unable to update the video");
  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video updated successfully"));
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "Unable to find the video");
  const deletedVideoFromCloudinary = await deleteFromCloudinary(video.videoFile, "video")
  const deletedThumbnailFromCloudinary = await deleteFromCloudinary(video.thumbnail, "image")
  console.log(deletedVideoFromCloudinary, deletedThumbnailFromCloudinary)
  if(!deletedVideoFromCloudinary || !deletedThumbnailFromCloudinary) {
    throw new ApiError(400, "Unable to delete the video from cloudinary");
  }
    await Playlist.updateMany(
    { "videos._id": videoId },
    {
      $pull: {
        videos: { _id: videoId }
      }
    }
  );
  const deleted = await Video.findByIdAndDelete(videoId);
  if (!deleted) throw new ApiError(400, "Unable to delete the video");
  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Video deleted successfully"));
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  video.isPublished = !video.isPublished;
  await video.save();
  if (!video) throw new ApiError(400, "Unable to toggle the publish status");
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled successfully"));
});

const updateViewCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  console.log(videoId)
  const video = await Video.findById(videoId);
  video.views++;
  await video.save();
  const history = await User.findById(req.user._id);
  const newHistory = history.watchHistory.filter(e => e.toString() !== videoId);
  newHistory.push(videoId)
    history.watchHistory = newHistory
    await history.save();
  const newUser = await User.findById(req.user._id);
  console.log(newUser.watchHistory);
  return res
    .status(200)
    .json(new ApiResponse(200, video.views, "Views updated"));
});

const searchVideos = asyncHandler(async (req, res) => {
  const { query } = req.params;
  console.log(query)
  // const videos = await Video.find({ $text: { $search: query }, isPublished: true }).sort({ score: { $meta: "textScore" } })
  //                           .populate("owner", "fullName avatar");
  const videos = await Video.find(
    {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
      isPublished: true,
    },
  ).populate("owner", "fullName avatar");
  console.log(videos)
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Search results fetched successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  temp,
  getChannelVideos,
  updateViewCount,
  searchVideos,
};
