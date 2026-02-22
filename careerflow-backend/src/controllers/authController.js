const generateTokens = require("../utils/generateToken");
const User = require("../models/User")
const bcrypt = require('bcryptjs')


const registerUser = async (req, res)=>{
    try{
        const {name, email, password, plan, industries, imageUrl} = req.body;
        const isExist = await User.findOne({email})
        if(isExist) return res.status(400).json({success:"failed", message: "user email already exists"});
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const newUser = new User({
            name,
            email,
            passwordHash: hash,
            plan,
            industries,
            imageUrl
        })
        
        const savedUser = await newUser.save()
        const { accessToken, refreshToken } = generateTokens(savedUser);
        const cookieOptions = {
            httpOnly: true,     
            secure: process.env.NODE_ENV === "production",  
            sameSite: "strict",  
            maxAge: 7 * 24 * 60 * 60 * 1000  
        };
        return res
            .status(201)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                success: true,
                message: "User Created Successfully",
                accessToken,  
                data: {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                    plan: savedUser.plan
                }
            });

    }catch(err){
        return res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
}

const loginUser = async (req, res) => {
    
};

module.exports = {registerUser, loginUser}