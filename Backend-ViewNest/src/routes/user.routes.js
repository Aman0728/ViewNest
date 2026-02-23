import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getChannelInfo,
  getUserChannelProfile,
  getWatchHistory,
  deleteFromHistory,
  updatePassword,
  updateAvatar,
  updateCoverImage,
  updateDetails,
} from "../controllers/user.controller.js#";

import { upload } from "../middlewires/multer.middleware.js";
import { verifyJWT } from "../middlewires/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/:channelId").get(verifyJWT, getChannelInfo);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch/history").get(verifyJWT, getWatchHistory)
router.route("/watch/history/:videoId").delete(verifyJWT, deleteFromHistory)
router.route("/update-password").post(verifyJWT, updatePassword)
router.route("/full-Name").patch(verifyJWT, updateDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateAvatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"), updateCoverImage)
// router.route("/refresh-token").post(refreshAccessToken)

export default router;
