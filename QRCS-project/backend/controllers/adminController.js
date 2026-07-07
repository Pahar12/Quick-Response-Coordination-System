const User = require("../models/User");
const Incident = require("../models/Incident");

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIncidents = await Incident.countDocuments();
    const pending = await Incident.countDocuments({ status: "Pending" });
    const inProgress = await Incident.countDocuments({ status: "In Progress" });
    const resolved = await Incident.countDocuments({ status: "Resolved" });

    const recentIncidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Return all users for the User Management tab
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("-password");

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalIncidents,
        pending,
        inProgress,
        resolved,
        recentIncidents,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};