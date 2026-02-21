import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const alreadyLiked = await Like.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);
  console.log("Called", alreadyLiked);
  if (alreadyLiked.length > 0) {
    const deleteLike = await Like.findOneAndDelete({
      _id: alreadyLiked[0]._id,
    });
    if (!deleteLike)
      throw new ApiError(400, "Unable to toggle the like status");
    return res
      .status(200)
      .json(
        new ApiResponse(200, deleteLike, "Like togggled(removed) successfully"),
      );
  }
  const liked = await Like.create({
    likedBy: req.user._id,
    video: videoId,
  });
  const addedfield = await Comment.updateMany({}, [
    { $set: { tweet: null } },
  ],{ updatePipeline: true });
  if (!liked) throw new ApiError(400, "Unable to like the video");
  return res
    .status(200)
    .json(new ApiResponse(200, liked, "Tweet liked successfully"));
  // TODO: toggle like on video
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const alreadyLiked = await Like.aggregate([
    {
      $match: {
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);
  console.log("Already: ", alreadyLiked);
  if (alreadyLiked.length > 0) {
    const deleteLike = await Like.findOneAndDelete({
      _id: alreadyLiked[0]._id,
    });
    if (!deleteLike)
      throw new ApiError(400, "Unable to toggle the like status");
    return res
      .status(200)
      .json(
        new ApiResponse(200, deleteLike, "Like togggled(removed) successfully"),
      );
  }
  const liked = await Like.create({
    likedBy: req.user._id,
    comment: commentId,
  });
  if (!liked) throw new ApiError(400, "Unable to like the video");
  console.log(liked);
  return res
    .status(200)
    .json(new ApiResponse(200, liked, "Tweet liked successfully"));
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const alreadyLiked = await Like.aggregate([
    {
      $match: {
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);
  if (alreadyLiked.length > 0) {
    const deleteLike = await Like.findOneAndDelete({
      _id: alreadyLiked[0]._id,
    });
    if (!deleteLike)
      throw new ApiError(400, "Unable to toggle the like status");
    return res
      .status(200)
      .json(
        new ApiResponse(200, deleteLike, "Like togggled(removed) successfully"),
      );
  }
  const liked = await Like.create({
    likedBy: req.user._id,
    tweet: tweetId,
  });
  if (!liked) throw new ApiError(400, "Unable to like the video");
  return res
    .status(200)
    .json(new ApiResponse(200, liked, "Tweet liked successfully"));
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const liked = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "$video",
        foreignField: "$_id",
        as: "video",
      },
    },
  ]);
  return res.status(200).json(200, liked, "Liked videos fetched successfully");
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
