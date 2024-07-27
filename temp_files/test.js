const mongoose = require('mongoose');
const User = require('./models/user'); // Adjust the path to where your User model is located

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/KSSIA', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

const createTestData = async () => {
  try {
    // const roleId = new mongoose.Types.ObjectId('64c1a3c88d93e04b240b8f2e'); // Replace with actual Role ObjectId
    // const productId = new mongoose.Types.ObjectId('64c1a3c88d93e04b240b8f2f'); // Replace with actual Products ObjectId

    const newUser = new User({
      first_name: 'John',
      middle_name: 'D.',
      last_name: 'Doe',
      membership_id: 'MEM123456',
      blood_group: 'O+',
      email: 'john.doe@example.com',
      profile_picture: 'https://example.com/profile.jpg',
      phone_numbers: {
        personal: 9876543210,
        landline: 1234567890
      },
      password: 'securepassword123',
      designation: 'Software Engineer',
      company_name: 'Tech Solutions Inc.',
      bio: 'Experienced software engineer specializing in web applications.',
    //   role: roleId,
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
    //   products: productId,
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
