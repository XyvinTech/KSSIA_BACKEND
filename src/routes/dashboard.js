const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const asyncHandler = require("../utils/asyncHandler");
const authVerify = require("../middlewares/authVerify");
const dashboardRoute = express.Router();

dashboardRoute.use(authVerify);

dashboardRoute.route('/users/total').get(asyncHandler(dashboardController.countUsers));
dashboardRoute.route('/users/total/active').get(asyncHandler(dashboardController.countActiveUsers));
dashboardRoute.route('/users/total/suspended').get(asyncHandler(dashboardController.countSuspendedUsers));
dashboardRoute.route('/users/total/premium').get(asyncHandler(dashboardController.countActivePremiumUsers));

dashboardRoute.route('/revenue/total/:year/:month').get(asyncHandler(dashboardController.getMonthlyRevenue));
dashboardRoute.route('/revenue/total/:year/:month/:category').get(asyncHandler(dashboardController.getMonthlyRevenueIndividual));

dashboardRoute.route('/products/total').get(asyncHandler(dashboardController.getNumberOfProducts));
dashboardRoute.route('/requirements/total').get(asyncHandler(dashboardController.getNumberOfRequirements));

dashboardRoute.route('/events/total').get(asyncHandler(dashboardController.getNumberOfEvents));
dashboardRoute.route('/news/total').get(asyncHandler(dashboardController.getNumberOfNews));
dashboardRoute.route('/promotions/total').get(asyncHandler(dashboardController.getNumberOfPromotions));

module.exports = dashboardRoute;