const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

const {

reportIncident,

getAllIncidents,

updateStatus,

deleteIncident

}=require("../controllers/incidentController");

router.post("/report", protect, reportIncident);

router.get("/", protect, getAllIncidents);

router.put("/:id", protect, updateStatus);

router.delete("/:id", protect, deleteIncident);

module.exports=router;