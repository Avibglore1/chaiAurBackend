import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/USER.MODEL.js";
import uploadOnCloudinary from './../utils/cloudinary.js'

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
      $set:{
        refreshToken: undefined
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




