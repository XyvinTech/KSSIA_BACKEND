const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {
  PORT,
  API_VERSION
} = process.env;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KSSIA Back-End API',
      version: '1.0.0',
      description: 'KSSIA back-end API with Swagger documentation',
    },
    tags: [{
        name: 'User',
        description: 'Operations related to users'
      },
      {
        name: 'Admin',
        description: 'Administrative operations'
      },
      {
        name: 'Products',
        description: 'Operations related to products'
      },
      {
        name: 'Events',
        description: 'Operations related to events'
      },
      {
        name: 'News',
        description: 'News related operations'
      },
      {
        name: 'Promotions',
        description: 'Operations related to promotions'
      },
      {
        name: 'Notifications',
        description: 'Notification related operations'
      },
      {
        name: 'Payments',
        description: 'Operations related to payments'
      },
    ],
    servers: [
      // {
      //   url: `https://example.com/api/v1`,
      // },
      {
        url: `http://43.205.89.79/api/${API_VERSION}`,
      },
      {
        url: `http://localhost:${PORT}/api/${API_VERSION}`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'object',
              properties: {
                first_name: {
                  type: 'string',
                  example: 'John',
                },
                middle_name: {
                  type: 'string',
                  example: 'Doe',
                },
                last_name: {
                  type: 'string',
                  example: 'Smith',
                },
              },
              required: ['first_name', 'last_name'],
            },
            membership_id: {
              type: 'string',
              example: 'MEM12345',
            },
            blood_group: {
              type: 'string',
              example: 'O+',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
            },
            profile_picture: {
              type: 'string',
              format: 'uri',
              example: 'http://example.com/profile.jpg',
            },
            phone_numbers: {
              type: 'object',
              properties: {
                personal: {
                  type: 'number',
                  example: 1234567890,
                },
                landline: {
                  type: 'number',
                  example: 9876543210,
                },
                company_phone_number: {
                  type: 'number',
                },
                whatsapp_number: {
                  type: 'number',
                },
                whatsapp_business_number: {
                  type: 'number',
                },
              },
              required: ['personal'],
            },
            otp: {
              type: 'number',
              description: 'One Time Password',
            },
            designation: {
              type: 'string',
              example: 'Software Engineer',
            },
            company_name: {
              type: 'string',
              example: 'TechCorp',
            },
            company_address: {
              type: 'string',
            },
            company_logo: {
              type: 'string',
              format: 'uri',
            },
            company_email: {
              type: 'string',
              format: 'email',
              example: 'contact@techcorp.com',
            },
            business_category: {
              type: 'string',
              example: 'IT Services',
            },
            sub_category: {
              type: 'string',
              example: 'Software Development',
            },
            bio: {
              type: 'string',
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                },
                city: {
                  type: 'string',
                },
                state: {
                  type: 'string',
                },
                zip: {
                  type: 'string',
                },
              },
            },
            social_media: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  platform: {
                    type: 'string',
                  },
                  url: {
                    type: 'string',
                    format: 'uri',
                  },
                },
              },
            },
            websites: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'TechCorp Website',
                  },
                  url: {
                    type: 'string',
                    format: 'uri',
                    example: 'http://techcorp.com',
                  },
                },
              },
            },
            video: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  url: {
                    type: 'string',
                    format: 'uri',
                  },
                },
              },
            },
            awards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                  },
                  name: {
                    type: 'string',
                  },
                  authority_name: {
                    type: 'string',
                  },
                },
              },
            },
            certificates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  url: {
                    type: 'string',
                    format: 'uri',
                  },
                },
              },
            },
            brochure: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  url: {
                    type: 'string',
                    format: 'uri',
                  },
                },
              },
            },
            is_active: {
              type: 'boolean',
              example: true,
            },
            is_deleted: {
              type: 'boolean',
              example: false,
            },
            selectedTheme: {
              type: 'string',
              default: 'white',
            },
          },
          required: [
            'name',
            'membership_id',
            'phone_numbers',
          ],
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'membership_id', 'email', 'phone_numbers'],
          properties: {
            name: {
              type: 'object',
              properties: {
                first_name: {
                  type: 'string',
                  example: 'John'
                },
                middle_name: {
                  type: 'string',
                  example: 'Doe'
                },
                last_name: {
                  type: 'string',
                  example: 'Smith'
                },
              },
              required: ['first_name', 'last_name'],
            },
            membership_id: {
              type: 'string',
              example: 'MEM12345'
            },
            blood_group: {
              type: 'string',
              example: 'O+'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            profile_picture: {
              type: 'string',
              format: 'uri',
              example: 'http://example.com/profile.jpg'
            },
            phone_numbers: {
              type: 'object',
              properties: {
                personal: {
                  type: 'number',
                  example: 1234567890
                },
                landline: {
                  type: 'number',
                  example: 9876543210
                },
                company_phone_number: {
                  type: 'number'
                },
                whatsapp_number: {
                  type: 'number'
                },
                whatsapp_business_number: {
                  type: 'number'
                },
              },
              required: ['personal'],
            },
            designation: {
              type: 'string',
              example: 'Software Engineer'
            },
            company_name: {
              type: 'string',
              example: 'TechCorp'
            },
            company_email: {
              type: 'string',
              format: 'email',
              example: 'contact@techcorp.com'
            },
            business_category: {
              type: 'string',
              example: 'IT Services'
            },
            sub_category: {
              type: 'string',
              example: 'Software Development'
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  example: '123 Tech Road'
                },
                city: {
                  type: 'string',
                  example: 'Tech City'
                },
                state: {
                  type: 'string',
                  example: 'Tech State'
                },
                zip: {
                  type: 'string',
                  example: '12345'
                },
              },
            },
            websites: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'TechCorp Website'
                  },
                  url: {
                    type: 'string',
                    format: 'uri',
                    example: 'http://techcorp.com'
                  },
                },
              },
            },
            is_active: {
              type: 'boolean',
              example: true
            },
            is_deleted: {
              type: 'boolean',
              example: false
            },
          },
        },
        EditUserRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'object',
              properties: {
                first_name: {
                  type: 'string'
                },
                middle_name: {
                  type: 'string'
                },
                last_name: {
                  type: 'string'
                },
              },
            },
            blood_group: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            profile_picture: {
              type: 'string',
              format: 'uri'
            },
            phone_numbers: {
              type: 'object',
              properties: {
                personal: {
                  type: 'number'
                },
                landline: {
                  type: 'number'
                },
                company_phone_number: {
                  type: 'number'
                },
                whatsapp_number: {
                  type: 'number'
                },
                whatsapp_business_number: {
                  type: 'number'
                },
              },
            },
            otp: {
              type: 'number'
            },
            designation: {
              type: 'string'
            },
            company_name: {
              type: 'string'
            },
            company_address: {
              type: 'string'
            },
            company_logo: {
              type: 'string',
              format: 'uri'
            },
            company_email: {
              type: 'string',
              format: 'email'
            },
            business_category: {
              type: 'string'
            },
            sub_category: {
              type: 'string'
            },
            bio: {
              type: 'string'
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string'
                },
                city: {
                  type: 'string'
                },
                state: {
                  type: 'string'
                },
                zip: {
                  type: 'string'
                },
              },
            },
            social_media: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  platform: {
                    type: 'string'
                  },
                  url: {
                    type: 'string',
                    format: 'uri'
                  },
                },
              },
            },
            websites: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  url: {
                    type: 'string',
                    format: 'uri'
                  },
                },
              },
            },
            video: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  url: {
                    type: 'string',
                    format: 'uri'
                  },
                },
              },
            },
            awards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  url: {
                    type: 'string',
                    format: 'uri'
                  },
                  authority_name: {
                    type: 'string'
                  }
                },
              },
            },
            certificates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  url: {
                    type: 'string',
                    format: 'uri'
                  },
                },
              },
            },
            brochure: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  url: {
                    type: 'string',
                    format: 'uri'
                  },
                },
              },
            },
            product: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string'
                  },
                  seller_id: {
                    type: 'string'
                  },
                  name: {
                    type: 'string'
                  },
                  image: {
                    type: 'string',
                    format: 'uri'
                  },
                  price: {
                    type: 'number'
                  },
                  offer_price: {
                    type: 'number'
                  },
                  description: {
                    type: 'string'
                  },
                  moq: {
                    type: 'integer'
                  },
                  units: {
                    type: 'string'
                  },
                  status: {
                    type: 'string'
                  },
                  tags: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              }
            },
            is_active: {
              type: 'boolean'
            },
            is_deleted: {
              type: 'boolean'
            },
            selectedTheme: {
              type: 'string',
              default: 'white'
            }
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID',
            },
            seller_id: {
              type: 'string',
              description: 'Seller ID',
            },
            name: {
              type: 'string',
              example: 'Product Name',
            },
            image: {
              type: 'string',
              format: 'uri',
              example: 'http://example.com/product.jpg',
            },
            price: {
              type: 'number',
              format: 'float',
              example: 19.99,
            },
            offer_price: {
              type: 'number',
              format: 'float',
              example: 15.99,
            },
            description: {
              type: 'string',
              example: 'Product description here',
            },
            moq: {
              type: 'number',
              example: 10,
            },
            units: {
              type: 'string',
              example: 'units',
            },
            status: {
              type: 'string',
              example: 'available',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        Event: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Event ID',
            },
            type: {
              type: 'string',
              description: 'Type of the event',
              example: 'Webinar',
            },
            name: {
              type: 'string',
              description: 'Name of the event',
              example: 'Annual Tech Conference',
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'URL of the event image',
              example: 'http://example.com/event.jpg',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date of the event',
              example: '2024-08-15',
            },
            time: {
              type: 'string',
              format: 'date-time',
              description: 'Time of the event',
              example: '2024-08-15T14:00:00Z',
            },
            platform: {
              type: 'string',
              description: 'Platform where the event will be hosted',
              example: 'Zoom',
            },
            meeting_link: {
              type: 'string',
              format: 'uri',
              description: 'Link to the meeting',
              example: 'http://example.com/meeting',
            },
            organiser_name: {
              type: 'string',
              description: 'Name of the event organiser',
              example: 'John Doe',
            },
            organiser_company_name: {
              type: 'string',
              description: 'Company name of the event organiser',
              example: 'TechCorp',
            },
            guest_image: {
              type: 'string',
              format: 'uri',
              description: 'URL of the guest image',
              example: 'http://example.com/guest.jpg',
            },
            organiser_role: {
              type: 'string',
              description: 'Role of the organiser',
              example: 'Event Coordinator',
            },
            speakers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  speaker_name: {
                    type: 'string',
                    description: 'Name of the speaker',
                    example: 'Alice Smith',
                  },
                  speaker_designation: {
                    type: 'string',
                    description: 'Designation of the speaker',
                    example: 'Lead Developer',
                  },
                  speaker_image: {
                    type: 'string',
                    format: 'uri',
                    description: 'URL of the speaker image',
                    example: 'http://example.com/speaker.jpg',
                  },
                  speaker_role: {
                    type: 'string',
                    description: 'Role of the speaker',
                    example: 'Keynote Speaker',
                  },
                },
              },
            },
            activate: {
              type: 'boolean',
              description: 'Whether the event is activated',
              example: true,
            },
          },
          required: [
            'name',
            'organiser_name',
            'organiser_company_name',
            'organiser_role',
          ],
        },
        News: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'News article ID',
            },
            category: {
              type: 'string',
              description: 'Category of the news article',
            },
            title: {
              type: 'string',
              description: 'Title of the news article',
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'URL of the news article image',
            },
            content: {
              type: 'string',
              description: 'Content of the news article',
            },
          },
        },
        Promotion: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Promotion ID'
            },
            type: {
              type: 'string',
              enum: ['banner', 'video', 'poster', 'notice'],
              description: 'Type of the promotion'
            },
            banner_image_url: {
              type: 'string',
              format: 'uri',
              description: 'URL of the banner image (required if type is "banner")'
            },
            upload_video: {
              type: 'string',
              format: 'uri',
              description: 'URL of the uploaded video (required if type is "video")'
            },
            yt_link: {
              type: 'string',
              description: 'YouTube link (required if type is "video")'
            },
            video_title: {
              type: 'string',
              description: 'Title of the video (required if type is "video")'
            },
            poster_image_url: {
              type: 'string',
              format: 'uri',
              description: 'URL of the poster image (required if type is "poster")'
            },
            notice_title: {
              type: 'string',
              description: 'Title of the notice (required if type is "notice")'
            },
            notice_description: {
              type: 'string',
              description: 'Description of the notice (required if type is "notice")'
            },
            notice_link: {
              type: 'string',
              description: 'Link associated with the notice (required if type is "notice")'
            },
            status: {
              type: 'boolean',
              description: 'Status of the promotion'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Start date of the promotion'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'End date of the promotion'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
      },
    },
    security: [{
      BearerAuth: [],
    }, ],
  },
  apis: ['./src/middlewares/swagger/paths/*.js'], // Path to your API routes
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
};