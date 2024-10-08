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
        pageNo = 1, limit = 10, search = ''
    } = req.query;
    const skipCount = parseInt(limit) * (pageNo - 1);
    
    try {
        // Aggregation pipeline
        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'reportBy',
                    foreignField: '_id',
                    as: 'reportByDetails'
                }
            },
            {
                $unwind: '$reportByDetails'
            },
            {
                $facet: {
                    userReports: [
                        { $match: { reportType: 'user' } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'reportedItemId',
                                foreignField: '_id',
                                as: 'reportedElement'
                            }
                        },
                        { $unwind: { path: '$reportedElement', preserveNullAndEmptyArrays: true } }
                    ],
                    productReports: [
                        { $match: { reportType: 'product' } },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'reportedItemId',
                                foreignField: '_id',
                                as: 'reportedElement'
                            }
                        },
                        { $unwind: { path: '$reportedElement', preserveNullAndEmptyArrays: true } }
                    ],
                    messageReports: [
                        { $match: { reportType: 'chat' } },
                        {
                            $lookup: {
                                from: 'messages',
                                localField: 'reportedItemId',
                                foreignField: '_id',
                                as: 'reportedElement'
                            }
                        },
                        { $unwind: { path: '$reportedElement', preserveNullAndEmptyArrays: true } }
                    ],
                    requirementReports: [
                        { $match: { reportType: 'requirement' } },
                        {
                            $lookup: {
                                from: 'requirements',
                                localField: 'reportedItemId',
                                foreignField: '_id',
                                as: 'reportedElement'
                            }
                        },
                        { $unwind: { path: '$reportedElement', preserveNullAndEmptyArrays: true } }
                    ]
                }
            },
            {
                $project: {
                    reports: {
                        $concatArrays: ['$userReports', '$productReports', '$messageReports', '$requirementReports']
                    }
                }
            },
            {
                $unwind: '$reports'
            },
            {
                $replaceRoot: { newRoot: '$reports' }
            },
            {
                $match: {
                    $or: [
                        { 'reportByDetails.name.first_name': { $regex: search, $options: 'i' } },
                        { 'reportByDetails.name.middle_name': { $regex: search, $options: 'i' } },
                        { 'reportByDetails.name.last_name': { $regex: search, $options: 'i' } },
                        { 'reportByDetails.company_name': { $regex: search, $options: 'i' } },
                        { 'reportByDetails.phone_numbers.personal': { $regex: search, $options: 'i' } },
                        { 'reportedElement.name': { $regex: search, $options: 'i' } },
                        { 'reportedElement.company_name': { $regex: search, $options: 'i' } },
                        { 'reportedElement.description': { $regex: search, $options: 'i' } },
                        { 'reportedElement.tags': { $regex: search, $options: 'i' } },
                        { 'reportedElement.content': { $regex: search, $options: 'i' } },
                        { 'reportedElement.subject': { $regex: search, $options: 'i' } }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 } // Sort reports by creation date (descending)
            },
            {
                $facet: {
                    data: [
                        { $skip: skipCount }, // Pagination: skip documents
                        { $limit: parseInt(limit) } // Pagination: limit the number of documents
                    ],
                    totalCount: [
                        { $count: 'count' } // Get the total count of matching documents
                    ]
                }
            },
            {
                $project: {
                    reports: {
                        content: '$reports.content',
                        reportBy: '$reports.reportBy',
                        reportType: '$reports.reportType',
                        reportedItemId: '$reports.reportedItemId',
                        createdAt: '$reports.createdAt',
                        updatedAt: '$reports.updatedAt',
                        reportByDetails: {
                            _id: '$reports.reportByDetails._id',
                            full_name: {
                                $concat: [
                                    { $ifNull: ['$reports.reportByDetails.name.first_name', ''] },
                                    ' ',
                                    { $ifNull: ['$reports.reportByDetails.name.middle_name', ''] },
                                    ' ',
                                    { $ifNull: ['$reports.reportByDetails.name.last_name', ''] }
                                ]
                            }
                        }
                    }
                }
            }
        ];

        // Execute the aggregation pipeline
        const result = await Report.aggregate(pipeline);
        const reportData = result[0].data || [];
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

        // Fetch reported items in parallel for each report
        const reportDetails = await Promise.all(
            reportData.map(async (element) => {
                let reportedElement = null;
                const reportedItemId = element.reportedItemId;

                switch (element.reportType) {
                    case 'product':
                        reportedElement = await Product.findById(reportedItemId).lean();
                        break;
                    case 'requirement':
                        reportedElement = await Requirements.findById(reportedItemId).lean();
                        break;
                    case 'user':
                        reportedElement = await User.findById(reportedItemId).lean();
                        break;
                    case 'chat':
                        reportedElement = await Messages.findById(reportedItemId).lean();
                        break;
                    default:
                        reportedElement = null;
                }

                return {
                    ...element,
                    reportedElement
                };
            })
        );

        // Send response with paginated data
        return responseHandler(res, 200, 'Reports retrieved successfully!', reportDetails, totalCount);
    } catch (error) {
        console.error(error); // Log the error for debugging
        return responseHandler(res, 500, 'Error fetching reports', null, null);
    }
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
    const { reportid } = req.params;

    try {
        const data = await Report.findById(reportid)
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