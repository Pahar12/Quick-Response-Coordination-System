const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:[true,"Name is required"],
        trim:true
    },

    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,"Please enter a valid email"]
    },

    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:6,
        select:false
    },

    phone:{
        type:String,
        default:""
    },

    role:{
        type:String,
        enum:["Citizen","Responder","Admin"],
        default:"Citizen"
    },
    
    resetPasswordToken: String,
    resetPasswordExpire: Date

},
{
    timestamps:true
});

// Generate password reset token
const crypto = require('crypto');

userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports=mongoose.model("User",userSchema);