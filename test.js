const mongoose = require('mongoose');
const User = require('./src/models/user'); // Adjust the path to where your User model is located

// Connect to MongoDB
mongoose.connect('mongodb+srv://user:pass@falcon.vgl0ddx.mongodb.net/?retryWrites=true&w=majority&appName=Falcon')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

const createTestData = async () => {
  try {
    const newUser = new User({
      name: {
        first_name: 'John',
        middle_name: 'A.',
        last_name: 'Doe',
      },
      membership_id: 'MEM123456',
      blood_group: 'O+',
      email: 'john.doe@example.com',
      profile_picture: 'https://example.com/profile.jpg',
      phone_numbers: {
        personal: 9876543210,
        landline: 1234567890,
        company_phone_number: 1122334455,
        whatsapp_number: 2233445566,
        whatsapp_business_number: 3344556677
      },
      otp: 123456,
      designation: 'Software Engineer',
      company_name: 'Tech Solutions Inc.',
      company_email: 'contact@techsolutions.com',
      business_category: 'IT',
      sub_category: 'Software Development',
      bio: 'Experienced software engineer specializing in web applications.',
      address: {
        street: '123 Elm Street',
        city: 'Springfield',
        state: 'IL',
        zip: '62704'
      },
      social_media: [
        { platform: 'Instagram', url: 'https://instagram.com/johndoe' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' }
      ],
      websites: [
        { name: 'Personal Blog', url: 'https://johndoe.com' }
      ],
      video: [
        { name: 'Introduction Video', url: 'https://youtube.com/watch?v=example' }
      ],
      awards: [
        { name: 'Best Developer', url: 'https://example.com/award' }
      ],
      certificates: [
        { name: 'Certified Web Developer', url: 'https://example.com/certificate' }
      ],
      brochure: [
        { name: 'Company Brochure', url: 'https://example.com/brochure' }
      ],
      is_active: true,
      is_deleted: false
    });

    // Save the new user
    const result = await newUser.save();
    console.log('Test data created successfully:', result);
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

createTestData();
