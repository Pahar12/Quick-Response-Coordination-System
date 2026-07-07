const Resource = require("../models/Resource");

// Add new resource
exports.addResource = async (req, res) => {
    try {
        const resource = await Resource.create(req.body);
        if (req.io) {
            req.io.emit("newResource", resource);
        }
        res.status(201).json({ success: true, resource });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all resources
exports.getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: resources.length, resources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update resource status/location
exports.updateResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (req.io) {
            req.io.emit("updateResource", resource);
        }
        res.status(200).json({ success: true, message: "Resource Updated", resource });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete resource
exports.deleteResource = async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        if (req.io) {
            req.io.emit("deleteResource", req.params.id);
        }
        res.status(200).json({ success: true, message: "Resource Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
