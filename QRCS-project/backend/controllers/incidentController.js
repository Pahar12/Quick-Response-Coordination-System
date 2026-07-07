const Incident = require("../models/Incident");
const Team = require("../models/Team");
const Notification = require("../models/Notification");

// Report Emergency
exports.reportIncident = async (req, res) => {
    try {
        // Initial timeline event
        const timelineEvent = {
            status: "Reported",
            updatedBy: "Citizen",
            timestamp: new Date()
        };
        
        let incidentData = { ...req.body, status: "Reported", timeline: [timelineEvent] };
        
        // 1. Create the incident
        let incident = await Incident.create(incidentData);

        // 2. Rule-Based Auto-Dispatch
        const availableTeam = await Team.findOne({ 
            category: incident.emergencyType, 
            status: "Available" 
        });

        if (availableTeam) {
            // Assign team
            incident.assignedTeam = availableTeam._id;
            incident.status = "Assigned";
            incident.timeline.push({
                status: "Assigned",
                updatedBy: "System (Auto-Dispatch)",
                timestamp: new Date()
            });
            await incident.save();

            // Update team status
            availableTeam.status = "Busy";
            availableTeam.currentIncident = incident._id;
            await availableTeam.save();

            // Create notification for citizen
            await Notification.create({
                user: incident.reportedBy,
                message: `Your emergency report has been assigned to ${availableTeam.teamName}.`,
                relatedIncident: incident._id
            });
        }

        // Emit Socket event — populate assignedTeam for UI
        const populatedIncident = await Incident.findById(incident._id).populate('assignedTeam', 'teamName');
        if (req.io) {
            req.io.emit("incidentCreated", populatedIncident);
            if (availableTeam) {
                req.io.emit("incidentAssigned", populatedIncident);
                req.io.emit("notification", { userId: incident.reportedBy, message: "Team assigned" });
            }
        }

        res.status(201).json({
            success: true,
            message: availableTeam ? `Emergency assigned to ${availableTeam.teamName}` : "Emergency Report Submitted (Pending Assignment)",
            incident: populatedIncident
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get All Incidents
exports.getAllIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find()
            .populate('assignedTeam', 'teamName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: incidents.length,
            incidents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Status
exports.updateStatus = async (req, res) => {
    try {
        const { status, updatedBy } = req.body;
        
        let incident = await Incident.findById(req.params.id);
        
        if (!incident) {
            return res.status(404).json({ success: false, message: "Incident not found" });
        }

        incident.status = status;
        incident.timeline.push({
            status,
            updatedBy: updatedBy || "System",
            timestamp: new Date()
        });

        await incident.save();

        // If incident is resolved or closed, free up the team
        if (status === "Resolved" || status === "Closed") {
            if (incident.assignedTeam) {
                const team = await Team.findById(incident.assignedTeam);
                if (team) {
                    team.status = "Available";
                    team.currentIncident = null;
                    await team.save();
                }
            }
        }

        // Generate a notification for the citizen
        if (["Accepted", "On The Way", "Resolved"].includes(status)) {
            await Notification.create({
                user: incident.reportedBy,
                message: `Your emergency incident status has been updated to: ${status}.`,
                relatedIncident: incident._id
            });
        }

        // Populate assignedTeam before emitting to clients
        const populatedIncident = await Incident.findById(incident._id).populate('assignedTeam', 'teamName');

        if (req.io) {
            req.io.emit("incidentUpdated", populatedIncident);
            req.io.emit("notification", { userId: incident.reportedBy, message: `Status changed to ${status}` });
        }

        res.status(200).json({
            success: true,
            message: "Status Updated",
            incident: populatedIncident
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Incident
exports.deleteIncident = async(req,res)=>{
    try{
        const incident = await Incident.findByIdAndDelete(req.params.id);
        if (incident && incident.assignedTeam) {
            const team = await Team.findById(incident.assignedTeam);
            if (team && team.currentIncident?.toString() === incident._id.toString()) {
                team.status = "Available";
                team.currentIncident = null;
                await team.save();
            }
        }

        if (req.io) {
            req.io.emit("incidentDeleted", req.params.id);
        }

        res.status(200).json({
            success:true,
            message:"Incident Deleted"
        });
    } catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};