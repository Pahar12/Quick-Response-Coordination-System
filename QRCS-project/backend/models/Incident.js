const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    location:{
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String, required: true }
    },

    emergencyType:{
        type:String,
        enum:[
            "Accident",
            "Medical",
            "Fire",
            "Crime",
            "Flood",
            "Earthquake",
            "Other"
        ],
        required:true
    },

    status:{
        type:String,
        enum:[
            "Reported",
            "Assigned",
            "Accepted",
            "On The Way",
            "Resolved",
            "Closed"
        ],
        default:"Reported"
    },

    reportedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    assignedTeam:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team",
        default:null
    },
    
    timeline: [{
        status: String,
        updatedBy: String,
        timestamp: { type: Date, default: Date.now }
    }]

},
{
    timestamps:true
});

module.exports = mongoose.model("Incident",incidentSchema);