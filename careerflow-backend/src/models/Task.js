const mongoose = require("mongoose")

const taskSchema = mongoose.Schema({
    
    jobId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required:true
    },
    title: {
        type:String,
        required:true
    },
    isDone: {type: Boolean, required:true, default:false},
    dueDate: {type: Date },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{
    timestamps: true
})

const Task = mongoose.model("Task", taskSchema )
module.exports=Task;