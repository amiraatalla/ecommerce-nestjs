const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

User.pre('findOneAndUpdate', async function (next) {
  try {
    const user = await User.findOne({ email: 'ayaalaa010920@gmail.com' });
    if (!user) {
      await User.create({
        email: 'amira.reda@pharaohsoft.com',
        password: '$2a$10$X5zdctP746BLpBCcNFmyAO.O5uiCZtM.GaytSpARMmW7oXsHpvFuG',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        active: true,
        phoneNumber: '+201000000',
        profilePicture : 'https://cauris.s3.eu-west-3.amazonaws.com//assets/9ba256e4-27a2-438d-b4d7-ed006e6821db.jpeg',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.log(error);
  }
  next();
});

module.exports = User;