import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import {renameSync, unlinkSync} from "fs"

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email,userId) => {
    return jwt.sign({email,userId},process.env.JWT_KEY,{expiresIn:maxAge});
}

export const signup = async(request,response,next) => {
    try{
        const {email,password} = request.body;
        if(!email || !password){
            return response.status(400).json({error:"Email and Password are required"});
        }
        const user = await User.create({email,password});
        response.cookie("jwt",createToken(email,user.id),{
            maxAge,
            secure: true,
            sameSite: "None",
        });
        return response.status(201).json({
            user:{
                id:user.id,
                email:user.email,
                profileSetup:user.profileSetup,
            },
        });
    }catch(error){
        console.log({error});
        return response.status(500).json({error:"Internal Server error"});
    }
};

export const login = async(request,response,next) => {
    try{
        const {email,password} = request.body;
        if(!email || !password){
            return response.status(400).json({error:"Email and Password are required"});
        }
        const user = await User.findOne({email});
        if(!user){
            return response.status(404).json({error:"User not found"});
        }
        const auth = await compare(password,user.password);
        if(!auth){
            return response.status(401).json({error:"Invalid Password"});
        }

        response.cookie("jwt",createToken(email,user.id),{
            maxAge,
            secure: true,
            sameSite: "None",
        });
        return response.status(200).json({
            id:user.id,
            email:user.email,
            profileSetup:user.profileSetup,
            firstName:user.firstName,
            lastName:user.lastName,
            image:user.image,
            color:user.color,
            skills:user.skills,
    });
    }catch(error){
        console.log({error});
        return response.status(500).json({error:"Internal Server error"});
    }
};

export const getUserInfo = async(request,response,next) => {
    try{
        const userData = await User.findById(request.userId);
        if(!userData){
            return response.status(404).json({error:"User not found"});
        }
        return response.status(200).json({
            id:userData.id,
            email:userData.email,
            profileSetup:userData.profileSetup,
            firstName:userData.firstName,
            lastName:userData.lastName,
            image:userData.image,
            color:userData.color,
            skills:userData.skills,
    });
    }catch(error){
        console.log({error});
        return response.status(500).json({error:"Internal Server error"});
    }
};

export const updateProfile = async(request,response,next) => {
    try{
        const {userId} = request;
        const {firstName,lastName,skills,color} = request.body;
            const skillsArray = skills ? skills.split(',') : skills;
        if(!firstName || !lastName || !skills){
            return response.status(400).send("All fields are required");
        }

        const userData = await User.findByIdAndUpdate(userId,{
            firstName,lastName,skills: skillsArray,color,profileSetup:true
        },{new:true,runValidators:true});

        return response.status(200).json({
                id:userData.id,
                email:userData.email,
                profileSetup:userData.profileSetup,
                firstName:userData.firstName,
                lastName:userData.lastName,
                image:userData.image,
                color:userData.color,
                skills:userData.skills,
        });
    }catch(error){
        console.log({error});
        return response.status(500).json({error:"Internal Server error"});
    }
};

export const addProfileImage = async(request,response,next) => {
    try{
        if(!request.file){
            return response.status(400).send("File is Required")
        }

        const date = Date.now();
        let fileName = "uploads/profiles/" + date + request.file.originalname
        renameSync(request.file.path,fileName)

        const updatedUser = await User.findByIdAndUpdate(
            request.userId,
            {image:fileName},
            {new:true , runValidators:true}
        )
        return response.status(200).json({
                image: updatedUser.image,
        });
    }catch(error){
        console.log({error});
        return response.status(500).json({error:"Internal Server error"});
    }
};

export const removeProfileImage = async(request,response,next) => {
    try{
        const {userId} = request;
        const user = await User.findById(userId);

        if(!user){
            return response.status(404).json({error:"User not found"});
        }
        if(user.image){
            unlinkSync(user.image);
        }
        user.image = null;
        await user.save();

        return response.status(200).send("Image removed successfully");
    }catch(error){
        console.log({error});
        return response.status(500).json({error:"Internal Server error"});
    }
};

export const logout = async(request,response,next) => {
    try{
        response.cookie("jwt","",{maxAge:1,secure:true,sameSite:"None"});
        return response.status(200).send("Logout Successful");
    }catch(error){
        console.log({error});
        return response.status(500).json({error:"Internal Server error"});
    }
};
