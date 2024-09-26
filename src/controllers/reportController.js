const responseHandler = require("../helpers/responseHandler");
const Report = require("../models/report");
const {
    report
} = require("../routes/user");
const {
    createReport
} = require("../validation");

const User = require("../models/user");
const Product = require("../models/products");
const Messages = require("../models/messages");
const Requirements = require("../models/requirements");

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
        .populate({
            path: "reportBy",
            select: "name company_name phone_numbers"
        })
        .skip(skipCount)
        .limit(limit)
        .sort({
            createdAt: -1,
            _id: 1
        })
        .lean();

    const reportData = await Promise.all(data.map(async (element) => {
        let reportedElement;

        const reportedItemId = element.reportedItemId;

        switch (element.reportType) {
            case "product":
                reportedElement = await Product.findById(reportedItemId);
                break;
            case "requirement":
                reportedElement = await Requirements.findById(reportedItemId);
                break;
            case "user":
                reportedElement = await User.findById(reportedItemId);
                break;
            case "chat":
                reportedElement = await Messages.findById(reportedItemId);
                break;
            default:
                reportedElement = null; // Handle unknown report types
        }

        return {
            ...element,
            reportedElement: reportedElement
        };
    }));

    return responseHandler(res, 200, "Reports found successfull..!", reportData, totalCount);

};

exports.deleteReports = async (req, res) => {

    const reportId = req.params.reportid;

    const report = await Report.findByIdAndDelete(reportId);
    if (!report) {
        return responseHandler(res, 404, "Report not found");
    }

    return responseHandler(res, 200, "Report deleted successfull..!");

};

exports.getReportById = async (req, res) => {
    const { reportID } = req.params;

    try {
        const data = await Report.findById(reportID)
            .populate({
                path: "reportBy",
                select: "name company_name phone_numbers"
            });

        if (!data) {
            return responseHandler(res, 404, "Report not found.");
        }

        // Handle reported element based on report type
        let reportedElement;
        const reportedItemId = data.reportedItemId;

        switch (data.reportType) {
            case "product":
                reportedElement = await Product.findById(reportedItemId);
                break;
            case "requirement":
                reportedElement = await Requirements.findById(reportedItemId);
                break;
            case "user":
                reportedElement = await User.findById(reportedItemId);
                break;
            case "chat":
                reportedElement = await Messages.findById(reportedItemId);
                break;
            default:
                reportedElement = null; // Handle unknown report types
        }

        // Return the report data with the reported element
        const reportData = {
            ...data.toObject(), // Convert Mongoose document to plain object
            reportedElement: reportedElement
        };

        return responseHandler(res, 200, "Report found successfully!", reportData);
    } catch (error) {
        console.error(error); // Log the error for debugging
        return responseHandler(res, 500, "An error occurred while fetching the report.");
    }
};