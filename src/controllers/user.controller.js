import { asyncHandler } from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponce } from "../utils/apiResponce.js"
import { response } from "express"


const registerUser = asyncHandler( async (req, res) => {
    // get user detail from frontend
    // validation -- not empty
    // check if user already exist: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object -- create entry in db
    // remove password and refreshtoken field from response
    // check fro user creation
    // return response

    const { fullname, email, username, password } = req.body
    console.log("email: ", email);

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError("All fields are required", 400)
    }

    const existedUser = User.findOne({
        $or: [
            {username}, {email}
        ]
    })

    if(existedUser) {
        throw new apiError("User already exist", 409)
    }

    const avatarLocslPath = req.files?.avatar [0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocslPath) {
        throw new apiError("Please upload avatar", 400)
    }


    const avatar = await uploadOnCloudinary(avatarLocslPath) 

    const coverImage = await uploadOnCloudinary(coverImageLocalPath) 

    if(!avatar) {
        throw new apiError("Please upload avatar", 400)
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        username: username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new apiError("User not created", 500)
    }


    return res.status(201).json(
        new apiResponce(200, createdUser, "user registered successfully")
    )
})

export { registerUser }