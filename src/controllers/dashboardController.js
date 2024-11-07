const Event = require("../models/events");
const User = require("../models/user");
const Product = require("../models/products");
const News = require("../models/news");
const Promotion = require("../models/promotions");
const Payment = require("../models/payment");
const Requirements = require("../models/requirements");
const responseHandler = require("../helpers/responseHandler");

// Count the total number of users
exports.countUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({
            status: { $in: ['active', 'suspended', 'inactive', 'notice'] }
        });

        return responseHandler(res, 200, `Total number of users` ,userCount);

    }

    catch (err) {
        return responseHandler(res, 500, `Error getting total number of users: ${err.message}`);
    }
};

// Count the total number of active users
exports.countActiveUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({
            status: { $in: ['active', 'notice'] }
        });

        return responseHandler(res, 200, `Total number of active users` ,userCount);

    }

    catch (err) {
        return responseHandler(res, 500, `Error getting total number of active users: ${err.message}`);
    }
};

// Count the total number of active premium users
exports.countActivePremiumUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({
            status: { $in: ['active', 'notice'] },
            subscription: 'premium'
        });

        return responseHandler(res, 200, `Total number of active users` ,userCount);

    }

    catch (err) {
        return responseHandler(res, 500, `Error getting total number of active premium users: ${err.message}`);
    }
};

// Count the total number of suspended users
exports.countSuspendedUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({
            status: { $in: ['suspended'] }
        });

        return responseHandler(res, 200, `Total number of suspended users` ,userCount);
    }

    catch (err) {
        return responseHandler(res, 500, `Error getting total number of suspended users: ${err.message}`);
    }
};

// Get the total revenu of a month
exports.getMonthlyRevenue = async (req, res) => {

    try {
        const { month, year} = req.params;

        // Start and end of the month
        const startDate = new Date(year, month - 1, 1); // Month is 0-based in JavaScript
        const endDate = new Date(year, month, 0); // The last day of the month

        // Aggregation to calculate total combined revenue for the month
        const totalRevenueData = await Payment.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lt: endDate }, // Filter by the date field (the date on the bill)
                    status: { $in: ['accepted', 'expiring', 'expired'] }, // Only count valid payments
                }
            },
            {
                $group: {
                    _id: null, // No grouping, just sum all records
                    totalRevenue: { $sum: '$amount' } // Sum the 'amount' field
                }
            }
        ]);

        // Extract the total revenue from the result
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;
        return responseHandler(res, 200, `Total combined revenue for the month` ,userCount);

    } 
    
    catch (err) {
        return responseHandler(res, 500, `Error calculating total revenue for the month: ${err.message}`);
    }
};

// Get the total revenu of a month in individual category
exports.getMonthlyRevenueIndividual = async (req, res) => {

    try {
        const { month, year, category } = req.params;

        // Start and end of the month
        const startDate = new Date(year, month - 1, 1); // Month is 0-based in JavaScript
        const endDate = new Date(year, month, 0); // The last day of the month

        // Aggregation to calculate total combined revenue for the month
        const totalRevenueData = await Payment.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lt: endDate }, // Filter by the date field (the date on the bill)
                    status: { $in: ['accepted', 'expiring', 'expired'] }, // Only count valid payments
                    category: category  // Filter by category (either 'app' or 'membership')
                }
            },
            {
                $group: {
                    _id: null, // No grouping, just sum all records
                    totalRevenue: { $sum: '$amount' } // Sum the 'amount' field
                }
            }
        ]);

        // Extract the total revenue from the result
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;
        return responseHandler(res, 200, `Total combined revenue for the month` ,userCount);

    } 
    
    catch (err) {
        return responseHandler(res, 500, `Error calculating total revenue for the month: ${err.message}`);
    }
};

// Get the total number of products
exports.getNumberOfProducts = async (req, res) => {
    try {
        const products = await Product.countDocuments({
            status: 'accepted'
        });
        return responseHandler(res, 200, `Total number of products`, products);
    }

    catch (err) {
        return responseHandler(res, 500, `Error counting products: ${err.message}`);
    }
};

// Get the total number of requirements
exports.getNumberOfRequirements = async (req, res) => {
    try {
        const requirements = await Requirements.countDocuments({
            status: 'approved'
        });

        return responseHandler(res, 200, `Total number of requirements`, requirements);
    }

    catch (err){
        return responseHandler(res, 500, `Error counting requirements: ${err.message}`);
    }
}

// Get the total number of events
exports.getNumberOfEvents = async (req, res) => {
    try {
        const events = await Event.countDocuments({
            status: { $in: ['upcoming', 'postponded', 'live'] }
        });
        return responseHandler(res, 200, `Total number of events`, events);
    }

    catch (err){
        return responseHandler(res, 500, `Error counting events: ${err.message}`);
    }
}

// Get the total number of news
exports.getNumberOfNews = async (req, res) => {
    try {
        const news = await News.countDocuments({
            published : true
        });
        return responseHandler(res, 200, `Total number of news`, news);
    }

    catch (err){
        return responseHandler(res, 500, `Error counting news: ${err.message}`);
    }
}

// Get total number of promotions
exports.getNumberOfPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.countDocuments({
            status: true
        });
        return responseHandler(res, 200, `Total number of promotions`, promotions);
    }

    catch (err){
        return responseHandler(res, 500, `Error counting promotions: ${err.message}`);
    }
}