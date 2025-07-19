import { Router } from "express";
import {
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails,
    updateCoverImage,
    updateUserAvatar
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.mw.js";
import verifyJWT from "../middlewares/jwtAuth.js";

const router = Router();
router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT,logoutUser);

router.route('/refreshToken').post(refreshAccessToken);

router.route('/changePassword').post(verifyJWT,changeCurrentPassword);
router.route('/currentUser').get(verifyJWT,getCurrentUser);
router.route('/updateAccount').post(verifyJWT,updateAccountDetails);

router.route('/avatar').patch(verifyJWT,upload.single('avatar'),updateUserAvatar);
router.route('/coverImage').patch(verifyJWT,upload.single('coverImage'),updateCoverImage);

router.route('/channel/:username').get(verifyJWT,getUserChannelProfile);
router.route('/history').get(verifyJWT,getWatchHistory)
export default router
