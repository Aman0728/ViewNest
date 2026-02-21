import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    temp,
    togglePublishStatus,
    updateVideo,
    getChannelVideos,
    updateViewCount,
} from "../controllers/video.controller.js"
import { verifyJWT } from '../middlewires/auth.middleware.js';
import { upload } from '../middlewires/multer.middleware.js';
const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        verifyJWT,
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);
router.route("/random/r").get(temp)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

router.route("/c/:channelId").get(getChannelVideos)

router.route("/views/:videoId").post(updateViewCount)


export default router