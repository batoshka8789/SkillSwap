const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Skill = require('../models/Skill');

// POST /api/skills/add - Добавление навыка
router.post('/add', auth, async (req, res) => {
  try {
    const { skill_name, level, is_offering } = req.body;

    if (!skill_name) {
      return res.status(400).json({ error: 'Название навыка обязательно' });
    }

    const skill = new Skill({
      user_id: req.userId,
      skill_name,
      level: level || 'начинающий',
      is_offering: is_offering !== undefined ? is_offering : true
    });

    await skill.save();

    res.status(201).json({
      message: 'Навык успешно добавлен',
      skill: {
        id: skill._id,
        skill_name: skill.skill_name,
        level: skill.level,
        is_offering: skill.is_offering
      }
    });
  } catch (error) {
    console.error('Ошибка добавления навыка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/skills/list - Получение навыков пользователя
router.get('/list', auth, async (req, res) => {
  try {
    const userId = req.query.userId || req.userId;
    
    const skills = await Skill.find({ user_id: userId })
      .populate('user_id', 'username avatar')
      .sort('-createdAt');

    res.json({
      skills: skills.map(skill => ({
        id: skill._id,
        skill_name: skill.skill_name,
        level: skill.level,
        is_offering: skill.is_offering,
        user: skill.user_id
      }))
    });
  } catch (error) {
    console.error('Ошибка получения навыков:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/skills/search - Поиск пользователей по навыкам
router.get('/search', auth, async (req, res) => {
  try {
    const { skill_name } = req.query;

    if (!skill_name) {
      return res.status(400).json({ error: 'Укажите название навыка для поиска' });
    }

    const skills = await Skill.find({
      skill_name: { $regex: skill_name, $options: 'i' },
      is_offering: true,
      user_id: { $ne: req.userId } // Исключаем текущего пользователя
    })
      .populate('user_id', 'username avatar bio')
      .sort('-createdAt')
      .limit(20);

    res.json({
      results: skills.map(skill => ({
        id: skill._id,
        skill_name: skill.skill_name,
        level: skill.level,
        user: skill.user_id
      }))
    });
  } catch (error) {
    console.error('Ошибка поиска навыков:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/skills/:id - Удаление навыка
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findOne({
      _id: req.params.id,
      user_id: req.userId
    });

    if (!skill) {
      return res.status(404).json({ error: 'Навык не найден' });
    }

    await skill.deleteOne();

    res.json({ message: 'Навык успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления навыка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
