const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
    email:{
        type: String,
        required:true,
        unique: true,
        lowercase: true
    },
    passwordHash:{
        type: String,
        required:true
    },
    imageUrl: {type: String, required:true},
    plan: {
        type: String,
        required: true,
        enum: ["starter", "pro", "executive"],
        default: "starter" 
    },
    industries: {
        type: [String], // Better type safety for ["MERN", "DevOps"]
        default: []
    },
    failedLoginAttempts: {type: Number, default: 0},
    
    lockUntil: { type: Date }

},{ 
    // This automatically creates 'createdAt' and 'updatedAt' 
    timestamps: true 
})

const User = mongoose.model('User', userSchema);
module.exports = User;