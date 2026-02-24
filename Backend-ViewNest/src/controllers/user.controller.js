import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Unable to generate access Token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { fullName, username, email, password } = req.body;
  if ([fullName, username, email, password].some((e) => e.trim() === "")) {
    throw new ApiError.json(400, "All fields are required");
  }

  const existeduser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existeduser) throw new ApiError(402, "User already exists");

  const avatarLocalPath = req.files?.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path;

  if (!avatarLocalPath) throw new ApiError(401, "Avatar is required");
  let coverImage = "";
  if (coverImageLocalPath)
    coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) throw new ApiError(500, "failed to upload Avatar Image");

  const user = await User.create({
    fullName,
    username,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage.url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) throw new ApiError(400, "User not created");

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username) throw new ApiError(400, "User don't exist");

  const user = await User.findOne({ username });
  if (!user) throw new ApiError(400, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid Password");

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id,
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!loggedInUser) throw new ApiError(400, "User not found");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookie.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      proccess.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedRefreshToken._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");
    if (user.refreshToken !== decodedRefreshToken)
      throw new ApiError(401, "Refresh token expired");
    const { newRefreshToken, accessToken } = await generateAccessRefreshToken(
      user._id,
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(500, "Unable to refresh Access Token");
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid password");
  if (!newPassword) throw new ApiError(400, "Enter the new Password");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateDetails = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  if (!fullName) throw new ApiError(400, "All fields are required");
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
      },
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url)
    throw new ApiResponse(400, "Failed to upload the avatar image");
  const user = await User.findOneAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;
  if (!coverImageLocalPath) throw new ApiError(400, "Avatar file is required");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url)
    throw new ApiResponse(400, "Failed to upload the avatar image");
  const user = await User.findOneAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username.trim()) throw new ApiError(400, "user does not exist");
  console.log(username);
  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $in: [
            new mongoose.Types.ObjectId(req.user._id),
            "$subscribers.subscriber",
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Data fetched successfully"));
});
const getChannelInfo = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log(channelId);
  // if(!username.trim()) throw new ApiError(400, "user does not exist");

  const channel = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [
                new mongoose.Types.ObjectId(req.user._id),
                "$subscribers.subscriber",
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Data fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: { path: "$video" },
    },
    // {
    //   $lookup: {
    //     from: "users",
    //     localField: "owner",
    //     foreignField: "_id",
    //     as: "owner",
    //   },
    // },
    // {
    //   $unwind: { path: "$owner" },
    // },
    {
      $project: {
        password: 0,
        username: 0,
        refreshToken: 0,
        coverImage: 0,
        email: 0,
        watchHistory: 0,
        _id: 0,
      },
    },
  ]);
  console.log(user);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "History fetched successfully"));
});

const deleteFromHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = await User.findById(req.user._id);
  const history = user.watchHistory.filter((e) => e.toString() !== videoId);
  user.watchHistory = history;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, history, "Video removed from history"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
  getCurrentUser,
  updateDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  getChannelInfo,
  deleteFromHistory,
};
