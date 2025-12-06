const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Match = require('../models/Match');

// POST /api/messages/send - Отправка сообщения
router.post('/send', auth, async (req, res) => {
  try {
    const { match_id, text } = req.body;

    if (!match_id || !text) {
      return res.status(400).json({ error: 'match_id и text обязательны' });
    }

    // Проверяем, что match существует и пользователь является участником
    const match = await Match.findOne({
      _id: match_id,
      $or: [
        { user1_id: req.userId },
        { user2_id: req.userId }
      ]
    });

    if (!match) {
      return res.status(404).json({ error: 'Match не найден или вы не являетесь участником' });
    }

    const message = new Message({
      match_id,
      sender_id: req.userId,
      text
    });

    await message.save();

    // Populate sender информацию
    await message.populate('sender_id', 'username avatar');

    res.status(201).json({
      message: 'Сообщение отправлено',
      data: {
        id: message._id,
        match_id: message.match_id,
        sender: message.sender_id,
        text: message.text,
        timestamp: message.timestamp,
        is_read: message.is_read
      }
    });
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/messages/history - Получение истории сообщений
router.get('/history', auth, async (req, res) => {
  try {
    const { match_id } = req.query;

    if (!match_id) {
      return res.status(400).json({ error: 'match_id обязателен' });
    }

    // Проверяем, что пользователь является участником match
    const match = await Match.findOne({
      _id: match_id,
      $or: [
        { user1_id: req.userId },
        { user2_id: req.userId }
      ]
    });

    if (!match) {
      return res.status(404).json({ error: 'Match не найден' });
    }

    const messages = await Message.find({ match_id })
      .populate('sender_id', 'username avatar')
      .sort('timestamp');

    // Отмечаем сообщения как прочитанные
    await Message.updateMany(
      {
        match_id,
        sender_id: { $ne: req.userId },
        is_read: false
      },
      { is_read: true }
    );

    res.json({
      messages: messages.map(msg => ({
        id: msg._id,
        sender: msg.sender_id,
        text: msg.text,
        timestamp: msg.timestamp,
        is_read: msg.is_read
      }))
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/messages/unread - Получение количества непрочитанных сообщений
router.get('/unread', auth, async (req, res) => {
  try {
    // Получаем все matches пользователя
    const matches = await Match.find({
      $or: [
        { user1_id: req.userId },
        { user2_id: req.userId }
      ]
    });

    const matchIds = matches.map(m => m._id);

    const unreadCount = await Message.countDocuments({
      match_id: { $in: matchIds },
      sender_id: { $ne: req.userId },
      is_read: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Ошибка получения непрочитанных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
