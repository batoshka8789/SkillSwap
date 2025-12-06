const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Match = require('../models/Match');
const User = require('../models/User');

// GET /api/matches/find - Поиск совпадений (пользователей для обмена навыками)
router.get('/find', auth, async (req, res) => {
  try {
    // Получаем всех пользователей кроме текущего
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('username avatar bio')
      .limit(20);

    res.json({
      matches: users.map(user => ({
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio
      }))
    });
  } catch (error) {
    console.error('Ошибка поиска совпадений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/matches/create - Создание нового match
router.post('/create', auth, async (req, res) => {
  try {
    const { user2_id } = req.body;

    if (!user2_id) {
      return res.status(400).json({ error: 'ID пользователя обязателен' });
    }

    // Проверяем, существует ли уже match
    const existingMatch = await Match.findOne({
      $or: [
        { user1_id: req.userId, user2_id },
        { user1_id: user2_id, user2_id: req.userId }
      ]
    });

    if (existingMatch) {
      return res.status(400).json({ error: 'Match уже существует' });
    }

    const match = new Match({
      user1_id: req.userId,
      user2_id,
      status: 'active'
    });

    await match.save();

    res.status(201).json({
      message: 'Match создан',
      match: {
        id: match._id,
        user1_id: match.user1_id,
        user2_id: match.user2_id,
        status: match.status
      }
    });
  } catch (error) {
    console.error('Ошибка создания match:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/matches/list - Получение всех matches текущего пользователя
router.get('/list', auth, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        { user1_id: req.userId },
        { user2_id: req.userId }
      ]
    })
      .populate('user1_id', 'username avatar')
      .populate('user2_id', 'username avatar')
      .sort('-created_at');

    res.json({
      matches: matches.map(match => ({
        id: match._id,
        user1: match.user1_id,
        user2: match.user2_id,
        status: match.status,
        created_at: match.created_at
      }))
    });
  } catch (error) {
    console.error('Ошибка получения matches:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
