const ComplaintModel = require("../Model/Complaint");

const addComplaint = async (req, res) => {
    try {
      const data = await ComplaintModel.create(req.body);
      res.status(201).json({ message: "Complaint added successfully", data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // const getComplaintsByStatus = 
  const deleteComplaintById =  async (req, res) => {
    try {
      const data = await ComplaintModel.findByIdAndDelete({ _id: req.params.id });
      res.status(200).json({
        message: "complaint deleted successfully successfully",
      });
    } catch (err) {
      res.status(200).json({
        message: "complaints cannot be fetched",
      });
    }
  }

  const updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      const updatedComplaint = await ComplaintModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!updatedComplaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
  
      res.status(200).json({
        message: "Complaint status updated successfully",
        data: updatedComplaint,
      });
    } catch (err) {
      res.status(500).json({
        message: "Failed to update complaint status",
        error: err.message,
      });
    }
  }

module.exports = {
    addComplaint,
    // getComplaintsByStatus,
    deleteComplaintById,
    updateComplaintStatus

}