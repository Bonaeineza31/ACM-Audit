import mongoose from 'mongoose';

const magicLinkSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token_hash: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Optionally, you can add an index so expired tokens delete automatically
// magicLinkSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const MagicLink = mongoose.model('MagicLink', magicLinkSchema);
export default MagicLink;
