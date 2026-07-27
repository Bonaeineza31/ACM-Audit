import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    default: 'user', // admin, auditor, etc.
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
