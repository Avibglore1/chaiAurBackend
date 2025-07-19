import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/USER.MODEL.js";
import uploadOnCloudinary from './../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken = async (userId) =>{
try {
  const user=await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave: true});
  return {accessToken,refreshToken}
} catch (error) {
  
}
}

export const registerUser = asyncHandler(async (req,res)=>{
   // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName,email,username,password} = req.body;
    if([fullName,email,password,username].some((field)=>(field??"").trim()==='')){
        throw new ApiError(400,'All fields are required')
    }

    const existingUser = await User.findOne({
      $or: [{username},{email}]
    });
    if(existingUser) throw new ApiError(409,'User already Exist')
      
      
    const avatarLocalPath = req.files && req.files.avatar && req.files.avatar[0]?.path;
    const coverImageLocalPath = req.files && req.files.coverImage && req.files.coverImage[0]?.path;

    if(!avatarLocalPath) throw new ApiError(400,'Avatar file is required')

      const avatar = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)    
      

     const user= await User.create({
        fullName,
        avatar:avatar?.url || '',
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()
     })  
     
     const createdUser = await User.findById(user._id).select("-password -refreshToken");

     if(!createdUser) throw new ApiError(500,'Something went wrong while registering user');

     return res.status(201).json(
      new ApiResponse(201,createdUser,'User registered successfully')
     )
})

export const loginUser = asyncHandler(async (req,res)=>{
  // req.body->data
  // username/email
  // password check
  // generate access and refreshToken
  // 
  const{email,username,password} = req.body;
  if(!(username || email)) throw new ApiError(400,'username or email is required');

  const user=await User.findOne(
    {
      $or: [{username},{email}]
    }
  )
  if(!user) throw new ApiError(404,'User not found');

  const isValidPassword = await user.isPasswordCorrect(password);
  if(!isValidPassword) throw new ApiError(401,'Invalid user credential');

  const {accessToken,refreshToken} =await generateAccessTokenAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .cookie('accessToken', accessToken, options)
  .cookie('refreshToken', refreshToken, options)
  .json(
    new ApiResponse(200,{user:loggedInUser},'User loggedIn Successfully')
  )
})

export const logoutUser = asyncHandler(async(req,res)=>{
  // remove refreshToken from Db
  // remove cookies from client browser
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken: 1
      }
    },
    {
      new:true
    }
  )
  
  const options={
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .clearCookie('accessToken',options)
  .clearCookie('refreshToken',options)
  .json(new ApiResponse(200,{},'User logged out'))
})

export const refreshAccessToken = asyncHandler(async(req,res)=>{
  // compare refreshtoken user is having vs at database:
  // generate new access and refresh token:
  // send the response with cookie
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if(!incomingRefreshToken) throw new ApiError(401,'Unauthorized Access');

  const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decodedToken._id);
  if(!user) throw new ApiError(401,'Invalid refresh token');

  if(incomingRefreshToken!==user.refreshToken) throw new ApiError(401,'Refresh token is expired');

  const {accessToken,refreshToken} =await  generateAccessTokenAndRefreshToken(user._id)
  const options= {
    httpOnly: true,
    secure: true
  }

  res.status(200)
  .cookie('accessToken', accessToken, options)
  .cookie('refreshToken', refreshToken, options)
  .json(
    new ApiResponse(200,{accessToken:accessToken,refreshToken:refreshToken},'Access token refreshed')
  )
})

export const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword} = req.body;

  const user=await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if(!isPasswordCorrect) throw new ApiError(400,'Invalid Old Password');

  user.password = newPassword;

  await user.save();

  return res.status(200)
  .json(new ApiResponse(200,{}, 'Password changed succesfully'))
})

export const getCurrentUser = asyncHandler(async(req,res)=>{
  return res.status(200)
  .json(new ApiResponse(200,req.user,'current user fetched successfully'))
})

export const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullName,email} = req.body;

  if(!fullName || !email) throw new ApiError(400,'All fields are required');

  const user=User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,email
      }
    },
      {
        new:true
      },
  ).select('-password');

  return res.status(200)
  .json(new ApiResponse(200,user,'Account details updated successfully'))
})

export const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path;

  if(!avatarLocalPath) throw new ApiError(400,'Avatar file required');

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if(!avatar.url) throw new ApiError(400,'Error while uploading server');

  const user = await User.findByIdAndUpdate(
    req.user?._id,{
       $set:{
        avatar: avatar.url
      }
    },
      {
        new: true
      }
    
  ).select('-password')

  return res.status(200)
  .json(new ApiResponse(200,user, 'Avatar image updated successfully'))
})

export const updateCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path;

  if(!coverImageLocalPath) throw new ApiError(400,'Cover Image file is required');

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!coverImage.url) throw new ApiError(400,'Error while uploading by server');

  const user = await User.findByIdAndUpdate(
    req.user?._id,{
       $set:{
        coverImage: coverImage.url
      }
    },
      {
        new: true
      }
    
  ).select('-password')

  return res.status(200)
  .json(new ApiResponse(200,user, 'Cover image updated successfully'))
})

export const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username} = req.params;
  if(!username?.trim()) throw new ApiError(400,'username is missing');

  const channel = await User.aggregate([
    {
      $match:{
        username: username?.toLowerCase()
      }
    },{
      $lookup:{
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers'
      }
    },{
      $lookup:{
        from:'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo'
      }
    },{
      $addFields:{
        subscribersCount:{
          $size:'$subscribers'
        },
        channelSubscribedToCount:{
          $size:'$subscribedTo'
        },
        isSubscribed:{
          $cond:{
            if:{$in: [req.user?._id,'$subscribers.subscriber']},
            then: true,
            else: false
          }
        }
      }
    },{
      $project:{
        fullName:1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])

  if(!channel?.length) throw new ApiError(404,'channel does not exist');

  return res.status(200)
  .json(new ApiResponse(200,channel[0],'User channel fetched successfully'))
})

export const getWatchHistory = asyncHandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },{
      $lookup:{
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline:[
          {
            $lookup:{
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first: '$owner'
              }
            }
          }
        ]
      }
    }
  ])

  return res.status(200)
  .json(new ApiResponse(200,user[0].watchHistory,'Watch history fetched successfully'))
})


