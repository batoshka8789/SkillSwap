require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Match = require('./models/Match');

// Проверка обязательных переменных окружения
if (!process.env.JWT_SECRET) {
  console.error('ОШИБКА: JWT_SECRET не установлен!');
  console.error('Добавьте переменную JWT_SECRET в Railway Variables');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Подключение к базе данных
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Для раздачи HTML файлов

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/messages', require('./routes/messages'));

// Хранилище активных подключений пользователей
const connectedUsers = new Map(); // userId -> socketId

// Socket.IO middleware для аутентификации
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Токен не предоставлен'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Недействительный токен'));
  }
});

// Socket.IO логика
io.on('connection', (socket) => {
  console.log(`Пользователь подключен: ${socket.userId}`);
  
  // Сохраняем соединение пользователя
  connectedUsers.set(socket.userId, socket.id);

  // Оповещаем пользователя о успешном подключении
  socket.emit('connected', { userId: socket.userId });

  // Обработка отправки сообщения
  socket.on('sendMessage', async (data) => {
    try {
      const { match_id, text, receiver_id } = data;

      if (!match_id || !text || !receiver_id) {
        socket.emit('error', { message: 'Недостаточно данных для отправки сообщения' });
        return;
      }

      // Проверяем, что match существует и пользователь является участником
      const match = await Match.findOne({
        _id: match_id,
        $or: [
          { user1_id: socket.userId },
          { user2_id: socket.userId }
        ]
      });

      if (!match) {
        socket.emit('error', { message: 'Match не найден' });
        return;
      }

      // Сохраняем сообщение в базу данных
      const message = new Message({
        match_id,
        sender_id: socket.userId,
        text
      });

      await message.save();
      await message.populate('sender_id', 'username avatar');

      const messageData = {
        id: message._id,
        match_id: message.match_id,
        sender: message.sender_id,
        text: message.text,
        timestamp: message.timestamp,
        is_read: false
      };

      // Отправляем сообщение получателю, если он онлайн
      const receiverSocketId = connectedUsers.get(receiver_id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', messageData);
      }

      // Подтверждаем отправителю
      socket.emit('messageSent', messageData);

    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      socket.emit('error', { message: 'Ошибка отправки сообщения' });
    }
  });

  // Обработка набора текста (опционально)
  socket.on('typing', (data) => {
    const { receiver_id, match_id } = data;
    const receiverSocketId = connectedUsers.get(receiver_id);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', {
        match_id,
        userId: socket.userId
      });
    }
  });

  // Обработка прекращения набора текста
  socket.on('stopTyping', (data) => {
    const { receiver_id, match_id } = data;
    const receiverSocketId = connectedUsers.get(receiver_id);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userStoppedTyping', {
        match_id,
        userId: socket.userId
      });
    }
  });

  // Обработка отключения
  socket.on('disconnect', () => {
    console.log(`Пользователь отключен: ${socket.userId}`);
    connectedUsers.delete(socket.userId);
  });
});

// Базовый маршрут
app.get('/api', (req, res) => {
  res.json({ message: 'SkillSwap API работает' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, закрываем сервер...');
  server.close(() => {
    console.log('HTTP сервер закрыт');
    process.exit(0);
  });
});

module.exports = { app, server, io };
