const generateTokens = require("../utils/generateToken");
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
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
// GET current logged-in user profile
const getMe = async (req, res) => {
    try {
        // 'protect' middleware get from req.user 
        const user = await User.findById(req.user.id);
        
        if (user) {
            res.status(200).json({
                success: true,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    industries: user.industries,
                    imageUrl: user.imageUrl,
                    plan: user.plan
                }
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// UPDATE user profile
const updateMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // Only update fields that are provided in the request body
            user.name = req.body.name || user.name;
            user.industries = req.body.industries || user.industries;
            user.imageUrl = req.body.imageUrl || user.imageUrl;

            const updatedUser = await user.save();

            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    industries: updatedUser.industries,
                    imageUrl: updatedUser.imageUrl
                }
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};
// Forgot Password Controller
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // reset token create (randomBytes generate a random token and convert to hex string)
        const resetToken = crypto.randomBytes(20).toString('hex');

        // token hash and save to database (security purpose)
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

        await user.save();

        // reset URL create
        const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;

        res.status(200).json({
            success: true,
            message: "Token generated successfully",
            resetUrl: resetUrl // In production, you would send this URL via email to the user instead of returning it in the response
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};
// ২. Reset Password Controller
const resetPassword = async (req, res) => {
    try {
        // token hash and database থেকে user খুঁজে বের করা
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() } // Ensure token is not expired
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // নতুন password hash করে database এ save করা
        const salt = bcrypt.genSaltSync(10);
        user.passwordHash = bcrypt.hashSync(req.body.password, salt);
        
        // token এবং expiration date reset করা
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password reset successful" });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

module.exports = {registerUser, loginUser, refreshTokenController, getMe, updateMe, forgotPassword, resetPassword}