const reportModel = require("../Model/Report");


const getReportByMailAndID = async (req, res) => {
    const mail = req.params.mail;
    const uniqueId = req.params.id;
    const report = await reportModel.findOne({
      $and: [{ uniqueId: uniqueId }, { email: mail.toLowerCase() }],
    });
    res.send(report.sentiment_scores);
  }

  const getReportForDownload = async (req, res) => {
    try {
      const { uniqueId, email } = req.body;
      const report = await reportModel.findOne({
        $and: [{ uniqueId: uniqueId }, { email: email.toLowerCase() }],
      });
      if (report == null) {
        console.log("report not found");
        return res.status(200).json({ data: "Report not found" });
      }
  
      res.status(200).json({ data: report });
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(404).json({ data: "Internal server error" });
    }
  }

  const deleteAllReports =  async (req, res) => {
    reportModel
      .deleteMany({})
      .then(() => {
        console.log("All records deleted successfully");
        res.status(200).json({
          message: "all records deleted",
        });
      })
      .catch((error) => {
        console.error("Error deleting records:", error);
      });
  }

  const deleteReportById =  async (req, res) => {
    try {
      const report = await reportModel.findOneAndDelete({
        uniqueId: req.params.id,
      });
      res.status(201).json({
        message: "data deleted successfully",
        data: report,
      });
    } catch (err) {
      res.json({
        message: err,
      });
    }
  }

  const getAllReport = async (req, res) => {
    try {
      const reports = await reportModel.find({});
      res.status(200).json({
        message: "data fetched successfully",
        data: reports,
      });
    } catch (Err) {
      res.status(401).json({
        message: "Data cannot be fetched",
      });
    }
  }
module.exports = {
    getReportByMailAndID,
    getReportForDownload,
    deleteAllReports,
    deleteReportById,
    getAllReport
}