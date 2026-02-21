import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    getTweet,
} from "../controllers/tweet.controller.js"
import { verifyJWT } from '../middlewires/auth.middleware.js';

const router = Router();
router.use(verifyJWT); 

router.route("/").post(createTweet);
router.route("/user/:channelId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet).get(getTweet);

export default router