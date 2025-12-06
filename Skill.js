const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill_name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['начинающий', 'средний', 'продвинутый', 'эксперт'],
    default: 'начинающий'
  },
  is_offering: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Skill', skillSchema);
