const generateTokens = require("../utils/generateToken");
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");

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
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: "Invalid Credentials" });

        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({ 
                success: false, 
                message: "Account restricted! Try again in a few minutes." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);  
        
        if (!isMatch) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            
            if (user.failedLoginAttempts >= 3) {
                user.lockUntil = Date.now() + 15 * 60 * 1000;  
                user.failedLoginAttempts = 0;  
            }
            
            await user.save();  
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        const { accessToken, refreshToken } = generateTokens(user);
        console.log(refreshToken)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                success: true,
                message: "User Logged in Successfully",
                accessToken,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    plan: user.plan
                }
            });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};
const refreshTokenController = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
            }

            //Finding the user in the database to Ensures user still exists and isn't locked
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (user.lockUntil && user.lockUntil > Date.now()) {
                return res.status(403).json({ success: false, message: "Account is restricted" });
            }

            // NEW Access Token 
            const { accessToken } = generateTokens(user);

            return res.status(200).json({
                success: true,
                accessToken
            });
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

module.exports = {registerUser, loginUser, refreshTokenController}