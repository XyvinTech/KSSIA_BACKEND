const Joi = require("joi");

// User arrays Schema validation
const phoneSchema = Joi.object({
  personal: Joi.string(),
  landline: Joi.string().allow(""),
  company_phone_number: Joi.string().allow(""),
  whatsapp_number: Joi.string().allow(""),
  whatsapp_business_number: Joi.string().allow(""),
});

const schemaUrl = Joi.object({
  platform: Joi.string().allow(""),
  url: Joi.string().allow(""),
});

const otherSchema = Joi.object({
  name: Joi.string().allow(""),
  url: Joi.string().allow(""),
  authority_name: Joi.string().allow(""),
  visibility: Joi.boolean(),
});

const productsSchema = Joi.object({
  seller_id: Joi.string().required(),
  _id: Joi.string(),
  name: Joi.string().required(),
  image: Joi.string(),
  price: Joi.number().min(0).required(),
  offer_price: Joi.number().min(0),
  description: Joi.string(),
  date: Joi.date(),
  units: Joi.string(),
  moq: Joi.number().min(0),
  status: Joi.string(),
  category: Joi.string(),
  subcategory: Joi.array().items(),
});

exports.CreateUserSchema = Joi.object({
  abbreviation: Joi.string().required(),
  name: Joi.string().required(),
  membership_id: Joi.string().required(),
  blood_group: Joi.string(),
  email: Joi.string().email(),
  profile_picture: Joi.string().uri().allow(""),
  bio: Joi.string().allow(""),
  phone_numbers: phoneSchema.required(),
  designation: Joi.string().allow(""),
  company_name: Joi.string().allow(""),
  company_email: Joi.string().email().allow(""),
  company_address: Joi.string().allow(""),
  company_logo: Joi.string().uri().allow(""),
  business_category: Joi.string(),
  sub_category: Joi.string(),
  address: Joi.string(),
  websites: Joi.array().items(otherSchema).allow(""),
  status: Joi.string(),
  is_active: Joi.boolean().default(true),
  is_deleted: Joi.boolean().default(false),
});

// Edit user function validation

exports.EditUserSchema = Joi.object({
  abbreviation: Joi.string(),
  name: Joi.string(),
  membership_id: Joi.string(),
  blood_group: Joi.string().allow(""),
  email: Joi.string().email(),
  profile_picture: Joi.string().uri().allow(""),
  phone_numbers: phoneSchema,
  designation: Joi.string().allow(""),
  company_name: Joi.string().allow(""),
  company_email: Joi.string().email().allow(""),
  company_address: Joi.string().allow(""),
  company_logo: Joi.string().uri().allow(""),
  business_category: Joi.string().allow(""),
  sub_category: Joi.string().allow(""),
  // business_category: Joi.string(),
  // sub_category: Joi.string(),
  bio: Joi.string().allow(""),
  address: Joi.string().allow(""),
  social_media: Joi.array().items(schemaUrl).allow(""),
  websites: Joi.array().items(otherSchema).allow(""),
  video: Joi.array().items(otherSchema).allow(""),
  awards: Joi.array().items(otherSchema).allow(""),
  certificates: Joi.array().items(otherSchema).allow(""),
  brochure: Joi.array().items(otherSchema).allow(""),
  products: Joi.array().items(productsSchema).allow(""),
  status: Joi.string().allow(""),
  is_active: Joi.boolean().default(true),
  is_deleted: Joi.boolean().default(false),
  selectedTheme: Joi.string(),
});

exports.productsSchemaval = productsSchema;
// Create Admin validation schema
exports.CreateAdminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().required(),
  status: Joi.string(),
  is_active: Joi.boolean().default(true),
  is_deleted: Joi.boolean().default(false),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now),
});

// Edit Admin validation schema
exports.EditAdminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).optional(),
  role: Joi.string().required(),
  status: Joi.string(),
  is_active: Joi.boolean().default(true),
  is_deleted: Joi.boolean().default(false),
  updatedAt: Joi.date().default(Date.now),
});

// events array validation
const speakerSchema = Joi.object({
  speaker_name: Joi.string().required(),
  speaker_designation: Joi.string().required(),
  speaker_image: Joi.string().allow(""),
  speaker_role: Joi.string().required(),
  _id: Joi.string(),
});

exports.CreateEventsSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  image: Joi.string(),
  description: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  startTime: Joi.date(),
  endTime: Joi.date(),
  venue: Joi.string(),
  platform: Joi.string(),
  meeting_link: Joi.string(),
  organiser_name: Joi.string().required(),
  organiser_company_name: Joi.string().required(),
  guest_image: Joi.string(),
  organiser_role: Joi.string().required(),
  speakers: Joi.array().items(speakerSchema),
  activate: Joi.boolean(),
  status: Joi.string(),
});

exports.EditEventsSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string(),
  image: Joi.string(),
  description: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  startTime: Joi.date(),
  endTime: Joi.date(),
  venue: Joi.string(),
  platform: Joi.string(),
  meeting_link: Joi.string(),
  organiser_name: Joi.string(),
  organiser_company_name: Joi.string(),
  guest_image: Joi.string(),
  organiser_role: Joi.string(),
  speakers: Joi.array().items(speakerSchema),
  activate: Joi.boolean(),
  status: Joi.string(),
});

// notificationSchema validation

exports.emailNotificationSchema = Joi.object({
  to: Joi.array().items(Joi.string()).required(),
  subject: Joi.string().min(1).max(255).required(),
  content: Joi.string(),
  media_url: Joi.string().allow(""),
  link_url: Joi.string().allow(""),
});

exports.inAppNotificationSchema = Joi.object({
  to: Joi.array().items(Joi.string()).required(),
  subject: Joi.string().min(1).max(255).required(),
  content: Joi.string(),
  media_url: Joi.string().allow(""),
  link_url: Joi.string().allow(""),
  file_url: Joi.string().allow(""),
  readBy: Joi.array().items(Joi.string().hex().length(24)).default([]),
});

exports.NewsSchema = Joi.object({
  category: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().optional(),
  image: Joi.string(),
  published: Joi.boolean().default(false), // Add published field with a default value
  pdf: Joi.string(),
});

exports.EditNewsSchema = Joi.object({
  category: Joi.string(),
  title: Joi.string(),
  content: Joi.string(),
  image: Joi.string(),
  published: Joi.boolean().default(false), // Add published field with a default value
  pdf: Joi.string(),
});

exports.EditPromotionSchema = Joi.object({
  type: Joi.string().valid("banner", "video", "poster", "notice").required(),
  banner_image_url: Joi.string(),
  upload_video: Joi.string(),
  file_url: Joi.string(),
  yt_link: Joi.string(),
  video_title: Joi.string(),
  poster_image_url: Joi.string(),
  poster_title: Joi.string(),
  notice_title: Joi.string(),
  notice_description: Joi.string(),
  status: Joi.boolean().default(false),
  startDate: Joi.date(),
  endDate: Joi.date(),
  notice_link: Joi.string(),
});

exports.PaymentSchema = Joi.object({
  user: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  category: Joi.string().required().valid("app", "membership"),
  parentSub: Joi.string().required(),
  receipt: Joi.string(),
  status: Joi.string()
});

exports.UserPaymentSchema = Joi.object({
  category: Joi.string().required().valid("app", "membership"),
  receipt: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  parentSub: Joi.string().required(),
});

exports.ReviewSchema = Joi.object({
  reviewer: Joi.string().hex().length(24).required(),
  content: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
});

exports.RequirementsSchema = Joi.object({
  author: Joi.string(),
  content: Joi.string().required(),
  status: Joi.string()
    .valid("pending", "approved", "rejected", "reported")
    .default("pending"),
  image: Joi.string(),
  reason: Joi.string(),
});

exports.createReport = Joi.object({
  content: Joi.string().required(),
  reportTo: Joi.array(),
  reportType: Joi.string().required(),
  reportedItemId: Joi.string().required(),
});

exports.createRoleSchema = Joi.object({
  roleName: Joi.string().required(),
  description: Joi.string(),
  permissions: Joi.array(),
  status: Joi.boolean(),
});

exports.editRoleSchema = Joi.object({
  roleName: Joi.string(),
  description: Joi.string(),
  permissions: Joi.array(),
  status: Joi.boolean(),
});

exports.createParentSubSchema = Joi.object({
  academicYear: Joi.string().required(),
  expiryDate: Joi.date().required(),
});

exports.editParentSubSchema = Joi.object({
  academicYear: Joi.string(),
  expiryDate: Joi.date(),
});

exports.createEnquirySchema = Joi.object({
  user: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  message: Joi.string().required(),
});
