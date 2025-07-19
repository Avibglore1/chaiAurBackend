import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import dotenv from 'dotenv'
import { User } from '../models/USER.MODEL.js';
dotenv.config();

const verifyJWT = asyncHandler(async(req,_,next)=>{
    try {
        const authHeader = req.header('Authorization');
        const headerToken = authHeader?.startsWith('Bearer ')?authHeader.split(' ')[1]:null;
        const token=req.cookies?.accessToken || headerToken;
        if(!token) throw new ApiError(401,'Unauthorised request');

        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

        if(!user) throw new ApiError(401,'Invalid Access Token');
        req.user = user;
        console.log('middleware auth verification done');
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || 'Invalid Acess Token')
    }
})

export default verifyJWT