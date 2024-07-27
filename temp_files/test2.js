const mongoose = require('mongoose');
const User = require('./models/user'); // Adjust the path to where your User model is located

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/KSSIA', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

const deleteUserByPhoneNumber = async (phoneNumber) => {
  try {
    const result = await User.deleteOne({ 'phone_numbers.personal': phoneNumber });
    if (result.deletedCount > 0) {
      console.log('User deleted successfully');
    } else {
      console.log('No user found with that phone number.');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Replace with the actual personal phone number
deleteUserByPhoneNumber(9876543210);
