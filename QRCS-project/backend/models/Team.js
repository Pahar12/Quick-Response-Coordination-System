const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: [
            "Accident",
            "Medical",
            "Fire",
            "Crime",
            "Flood",
            "Earthquake",
            "Other"
        ],
        required: true
    },
    organization: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Available", "Busy", "Offline"],
        default: "Available"
    },
    members: {
        type: String
    },
    currentIncident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Incident",
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Team", teamSchema);
