const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URL;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI или MONGO_URL не установлены в переменных окружения');
    }
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB подключена успешно');
    console.log('URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Скрываем пароль в логах
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error.message);
    // Не выходим из процесса в production, чтобы Railway не крашил
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
