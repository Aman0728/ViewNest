import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getChannelInfo,
  getUserChannelProfile,
  getWatchHistory,
  deleteFromHistory
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
// router.route("/refresh-token").post(refreshAccessToken)

export default router;
