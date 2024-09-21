const responseHandler = require("../helpers/responseHandler");
const Report = require("../models/report");

exports.createReport = async (req, res) => {
    req.body.reportBy = req.userId;
    const newReport = await Report.create(req.body);
    if (newReport) {
        return responseHandler(res, 201, "Report created successfully", newReport);
    }
};

exports.getReports = async (req, res) => {

    const { pageNo = 1, limit = 10, search } = req.query;
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