const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },
    type:{
        type:String,
        enum:["Ambulance", "Firetruck", "Police Car", "Rescue Team", "Other"],
        required:true
    },
    status:{
        type:String,
        enum:["Available", "Dispatched", "Maintenance"],
        default:"Available"
    },
    currentLocation:{
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    assignedIncident:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Incident",
        default: null
    }
},
{
    timestamps:true
});

module.exports = mongoose.model("Resource", resourceSchema);
