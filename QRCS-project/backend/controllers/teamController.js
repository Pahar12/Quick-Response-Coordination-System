const Team = require("../models/Team");

exports.createTeam = async (req, res) => {
    try {
        const team = await Team.create(req.body);
        res.status(201).json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find().populate({
            path: "currentIncident",
            populate: { path: "assignedTeam", select: "teamName" }
        });
        res.status(200).json({ success: true, count: teams.length, teams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).populate({
            path: "currentIncident",
            populate: { path: "assignedTeam", select: "teamName" }
        });
        if (!team) return res.status(404).json({ success: false, message: "Team not found" });
        res.status(200).json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!team) return res.status(404).json({ success: false, message: "Team not found" });
        res.status(200).json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Team deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
