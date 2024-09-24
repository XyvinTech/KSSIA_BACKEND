const responseHandler = require("../helpers/responseHandler");
const Report = require("../models/report");
const { report } = require("../routes/user");
const {
    createReport
} = require("../validation");

exports.createReport = async (req, res) => {
    try {
        const {
            error
        } = createReport.validate(req.body, {
            abortEarly: true,
        });
        if (error) {
            return responseHandler(res, 400, `Invalid input: ${error.message}`);
        }
        req.body.reportBy = req.userId;
        const newReport = await Report.create(req.body);
        if (newReport) {
            return responseHandler(res, 201, "Report created successfully", newReport);
        }
    } catch (error) {
        return responseHandler(res, 500, `Internal Server Error ${error.message}`);
    }
};

exports.getReports = async (req, res) => {

    const {
        pageNo = 1, limit = 10, search
    } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {};
    const totalCount = await Report.countDocuments(filter);
    const data = await Report.find(filter)
        .skip(skipCount)
        .limit(limit)
        .sort({
            createdAt: -1,
            _id: 1
        })
        .lean();
    return responseHandler(res, 200, "Reports found successfull..!", data, totalCount);

};

exports.deleteReports = async (req, res) => {

    const reportId = req.params.reportid;

    const report = await Report.findByIdAndDelete(reportId);
    if(!report){
        return responseHandler(res, 404, "Report not found");
    }

    return responseHandler(res, 200, "Report deleted successfull..!");

};