import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  // const {page = 1, limit = 10} = req.query
  const { lastCreatedAt, limit = 10 } = req.query;
  const { videoId } = req.params;
  const matchStage = {
    video: new mongoose.Types.ObjectId(videoId),
  };
  
  if (lastCreatedAt) {
    matchStage.createdAt = {
      $lt: new Date(lastCreatedAt),
    };
  }

  const userId = req.user._id;

  const comments = await Comment.aggregate([
    { $match: matchStage },

    { $sort: { createdAt: -1 } }, // newest first
    { $limit: parseInt(limit) },

    // ✅ check if user liked
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$comment", "$$commentId"] },
                  { $eq: ["$likedBy", new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
        ],
        as: "liked",
      },
    },
    {
      $addFields: {
        isLiked: { $gt: [{ $size: "$liked" }, 0] },
      },
    },

    // ✅ total like count
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$comment", "$$commentId"],
              },
            },
          },
          { $count: "count" },
        ],
        as: "likeCount",
      },
    },
    {
      $addFields: {
        totalLike: {
          $ifNull: [{ $arrayElemAt: ["$likeCount.count", 0] }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    {
      $unwind: {path: "$owner"}
    },

    {
      $project: {
        liked: 0,
        likeCount: 0,
      },
    },
  ]);

  {
    //     const comments = await Comment.aggregate([
    //   { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    //   {
    //     $lookup: {
    //       from: "likes",
    //       let: { commentId: "$_id" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $eq: ["$comment", "$$commentId"] },
    //                 { $eq: ["$user", new mongoose.Types.ObjectId(userId)] }
    //               ]
    //             }
    //           }
    //         }
    //       ],
    //       as: "liked"
    //     }
    //   },
    //   {
    //     $addFields: {
    //       isLiked: { $gt: [{ $size: "$liked" }, 0] }
    //     }
    //   }
    // ]);
    //     return res.status(200)
    //     .json(new ApiResponse(200, comments, "Comments fetched successfully"))
  }
  return res.status(200)
  .json(new ApiResponse(200, {comments, 
    nextCursor: comments.length
    ? comments[comments.length - 1].createdAt
    : null
  },"Comments fetched successfully"))
});

const getTweetComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  // const {page = 1, limit = 10} = req.query
  const { lastCreatedAt, limit = 10 } = req.query;
  const { tweetId } = req.params;
  const matchStage = {
    tweet: new mongoose.Types.ObjectId(tweetId),
  };
  
  if (lastCreatedAt) {
    matchStage.createdAt = {
      $lt: new Date(lastCreatedAt),
    };
  }

  const userId = req.user._id;

  const comments = await Comment.aggregate([
    { $match: matchStage },

    { $sort: { createdAt: -1 } }, // newest first
    { $limit: parseInt(limit) },

    // ✅ check if user liked
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$comment", "$$commentId"] },
                  { $eq: ["$likedBy", new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
        ],
        as: "liked",
      },
    },
    {
      $addFields: {
        isLiked: { $gt: [{ $size: "$liked" }, 0] },
      },
    },

    // ✅ total like count
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$comment", "$$commentId"],
              },
            },
          },
          { $count: "count" },
        ],
        as: "likeCount",
      },
    },
    {
      $addFields: {
        totalLike: {
          $ifNull: [{ $arrayElemAt: ["$likeCount.count", 0] }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    {
      $unwind: {path: "$owner"}
    },

    {
      $project: {
        liked: 0,
        likeCount: 0,
      },
    },
  ]);
  return res.status(200)
  .json(new ApiResponse(200, {comments, 
    nextCursor: comments.length
    ? comments[comments.length - 1].createdAt
    : null
  },"Comments fetched successfully"))
});

const addVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const newComment = await Comment.create({
    video: videoId,
    content,
    owner: req.user._id,
  });
  if (!newComment) throw new ApiError(400, "Unable to post comment");
  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment posted successfully"));
  // TODO: add a comment to a video
});

const addTweetComment = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const newComment = await Comment.create({
    tweet: tweetId,
    content,
    owner: req.user._id,
  });
  if (!newComment) throw new ApiError(400, "Unable to post comment");
  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment posted successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(400, "Comment does not exist");
  if (comment.onwer != req.user._id)
    throw new ApiError(400, "Unauthorized Access");
  const updatedComment = await Comment.findByIdAndUpdate(
    { id: comment._id },
    { content },
  );
  if (!updatedComment) throw new ApiError(400, "Unable to update the comment");
  return res
    .status(200)
    .json(20, updateComment, "Comment updated successfully");
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(400, "Comment does not exist");
  if (!comment.owner.equals(req.user._id))
    throw new ApiError(400, "Unauthorized Access");
  const deletedComment = await Comment.findByIdAndDelete(comment._id);
  if (!deletedComment) throw new ApiError(400, "Unable to delete the comment");
  return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment deleted successfully"));
  // TODO: delete a comment
});

export { getVideoComments,getTweetComments, addVideoComment,addTweetComment, updateComment, deleteComment };
