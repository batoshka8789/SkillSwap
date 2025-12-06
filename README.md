<div align="center">

# SkillSwap PRO

### Платформа для обмена навыками в реальном времени

**Real-time чат · REST API · JWT аутентификация**

</div>

---

## Содержание

- [О проекте](#о-проекте)
- [Технологический стек](#технологический-стек)
- [Быстрый запуск](#быстрый-запуск)
- [Деплой на Render.com](#деплой-на-rendercom)
- [Структура проекта](#структура-проекта)
- [Основные возможности](#основные-возможности)
- [Решение проблем](#решение-проблем)

---

## О проекте

**SkillSwap PRO** — современное веб-приложение для обмена навыками между пользователями. Платформа позволяет находить людей с нужными навыками, общаться в реальном времени и договариваться об обмене знаниями.

### Ключевые особенности

- **Безопасная аутентификация** с JWT токенами и bcrypt хешированием
- **Real-time чат** через WebSocket (Socket.io)
- **Умный поиск** навыков и пользователей
- **Профили с аватарками** через URL
- **Система матчинга** для поиска партнёров по обмену
- **Адаптивный интерфейс** с современным дизайном

---

## Технологический стек

<div align="center">

| Компонент | Технология | Версия |
|:---------:|:----------:|:------:|
| **Backend Runtime** | Node.js | 14+ |
| **Web Framework** | Express.js | 4.18.2 |
| **Real-time** | Socket.io | 4.6.1 |
| **Database** | MongoDB | 5.0+ |
| **ODM** | Mongoose | 8.0.3 |
| **Authentication** | JWT + bcryptjs | 9.0.2 + 2.4.3 |
| **Frontend** | Vanilla JavaScript | ES6+ |
| **Styling** | Custom CSS3 | Flexbox/Grid |

</div>

### Зависимости

```json
{
  "dependencies": {
    "express": "^4.18.2",       // HTTP сервер и маршрутизация
    "socket.io": "^4.6.1",      // WebSocket для real-time чата
    "mongoose": "^8.0.3",       // MongoDB ODM
    "jsonwebtoken": "^9.0.2",   // JWT токены
    "bcryptjs": "^2.4.3",       // Хеширование паролей
    "cors": "^2.8.5",           // CORS middleware
    "dotenv": "^16.3.1"         // Переменные окружения
  }
}
```

---

## Быстрый запуск

> **Запустите приложение за 4 простых шага**

### Шаг 1: Клонирование репозитория

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd skillswap-pro
```

### Шаг 2: Установка зависимостей

Перед установкой убедитесь, что у вас установлены:
- **Node.js** версии 14 или выше ([скачать](https://nodejs.org/))
- **npm** версии 6 или выше (устанавливается вместе с Node.js)

Проверьте установку:

```bash
node --version   # Должно быть >= 14.x
npm --version    # Должно быть >= 6.x
```

Установите все необходимые пакеты:

```bash
npm install
```

**Что устанавливается:**
- `express` — веб-сервер
- `socket.io` — WebSocket для real-time чата
- `mongoose` — работа с MongoDB
- `jsonwebtoken` — JWT аутентификация
- `bcryptjs` — хеширование паролей
- `cors` — поддержка CORS
- `dotenv` — переменные окружения
- `nodemon` (dev) — автоперезагрузка при разработке

Установка займёт 1-2 минуты в зависимости от скорости интернета.

### Шаг 3: Настройка базы данных MongoDB

MongoDB требуется для хранения пользователей, навыков и сообщений.

<details>
<summary><b>Вариант А: Локальная установка (для постоянной работы)</b></summary>

<br>

**macOS:**

```bash
# Установка через Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Запуск MongoDB как сервиса
brew services start mongodb-community@7.0

# Проверка что MongoDB запущен
brew services list | grep mongodb
```

**Ubuntu/Debian:**

```bash
# Установка MongoDB
sudo apt-get update
sudo apt-get install -y mongodb

# Запуск сервиса
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Проверка статуса
sudo systemctl status mongodb
```

**Windows:**

1. Скачайте установщик: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Запустите установку с опцией "Install as Service"
3. MongoDB запустится автоматически

**Проверка подключения:**

```bash
# Подключитесь к MongoDB
mongosh

# Вы должны увидеть приглашение MongoDB:
# test>

# Выход из MongoDB shell
exit
```

</details>

<details>
<summary><b>Вариант Б: Docker (рекомендуется для разработки)</b></summary>

<br>

**Требования:** установленный Docker ([скачать Docker Desktop](https://www.docker.com/products/docker-desktop/))

```bash
# Запуск MongoDB в контейнере
docker run -d \
  --name skillswap-mongo \
  -p 27017:27017 \
  -v skillswap-data:/data/db \
  mongo:7.0

# Проверка что контейнер запущен
docker ps | grep skillswap-mongo

# Вывод логов (опционально)
docker logs skillswap-mongo

# Остановка MongoDB (когда нужно)
docker stop skillswap-mongo

# Повторный запуск MongoDB
docker start skillswap-mongo
```

**Преимущества Docker:**
- Не засоряет систему
- Легко удалить и переустановить
- Изолированная среда
- Одна команда для запуска

</details>

### Шаг 4: Настройка переменных окружения

Создайте файл `.env` в **корневой папке проекта**:

```bash
# Создание файла .env
touch .env
```

Откройте файл `.env` в любом текстовом редакторе и добавьте:

```env
# Подключение к MongoDB
MONGODB_URI=mongodb://localhost:27017/skillswap

# Секретный ключ для JWT (ОБЯЗАТЕЛЬНО измените!)
JWT_SECRET=измените_этот_ключ_на_случайную_строку_минимум_32_символа

# Порт сервера (по умолчанию 3000)
PORT=3000
```

> **Важно:** Для продакшена используйте надёжный случайный ключ в `JWT_SECRET`! 
> Можно сгенерировать здесь: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Шаг 5: Запуск приложения

Теперь всё готово для запуска!

```bash
# Production режим
npm start

# Или режим разработки с автоперезагрузкой
npm run dev
```

**Вы должны увидеть:**

```
Сервер запущен на порту 3000
MongoDB подключена успешно
```

### Шаг 6: Открытие в браузере

Откройте браузер и перейдите по адресу:

```
http://localhost:3000
```

**Поздравляем!** Приложение успешно запущено!

---

## Первый запуск: Что дальше?

После открытия приложения в браузере:

1. **Зарегистрируйтесь** — создайте новый аккаунт (username, email, password)
2. **Заполните профиль** — добавьте биографию и аватарку (URL изображения)
3. **Добавьте навыки** — укажите свои навыки и уровень владения
4. **Найдите пользователей** — перейдите на вкладку "Пользователи"
5. **Начните чат** — нажмите "Написать" и общайтесь в реальном времени

---

## Проверка работы системы

### Тест Real-time чата

Для проверки работы WebSocket чата:

1. Откройте приложение в **обычном окне браузера** — зарегистрируйте пользователя `user1`
2. Откройте приложение в **режиме инкогнито** — зарегистрируйте пользователя `user2`
3. В обычном окне найдите `user2` и напишите сообщение
4. В окне инкогнито вы должны **мгновенно** получить это сообщение

Если сообщение пришло мгновенно — WebSocket работает корректно!

### Проверка MongoDB

```bash
# Подключитесь к MongoDB
mongosh

# Посмотрите список баз данных
show dbs

# Вы должны увидеть базу данных "skillswap"
# Переключитесь на неё
use skillswap

# Посмотрите коллекции
show collections

# Должны быть: users, skills, matches, messages, swaprequests

# Посмотрите пользователей
db.users.find()

# Выход
exit
```

---

## Остановка приложения

```bash
# В терминале где запущен сервер нажмите:
Ctrl + C

# Для полной остановки MongoDB (если использовали Docker):
docker stop skillswap-mongo

# Для полной остановки MongoDB (если установлен локально):
# macOS
brew services stop mongodb-community

# Linux
sudo systemctl stop mongodb
```

# Development с hot-reload
```
npm run dev
```

Откройте браузер: **http://localhost:3000**

---

## Структура проекта

```
skillswap-pro/
│
├── server.js                 # Главный файл сервера с WebSocket
├── index.html                # Frontend SPA приложение
├── package.json              # Зависимости и скрипты
├── .env                      # Переменные окружения (не в Git!)
├── .gitignore                # Игнорируемые файлы
├── start.sh                  # Bash-скрипт для запуска
│
├── config/
│   └── database.js            # Подключение к   MongoDB
│
├── models/                   # Mongoose схемы и модели
│   ├── User.js                  # Пользователь (username, email, password)
│   ├── Skill.js                 # Навык (название, уровень, владелец)
│   ├── Match.js                 # Связь между пользователями
│   ├── Message.js               # Сообщения чата
│   └── SwapRequest.js           # Запросы на обмен навыками
│
├── routes/                   # API маршруты
│   ├── auth.js                  # Регистрация и авторизация
│   ├── users.js                 # Управление профилем
│   ├── skills.js                # CRUD навыков
│   ├── matches.js               # Поиск и создание связей
│   └── messages.js              # Отправка и получение сообщений
│
└── middleware/
    └── auth.js                  # JWT проверка токена
```

### Описание ключевых файлов

| Файл | Назначение |
|:-----|:-----------|
| **server.js** | Express сервер + Socket.io WebSocket сервер, инициализация всех маршрутов |
| **index.html** | SPA с Vanilla JavaScript, Socket.io client, управление состоянием через localStorage |
| **config/database.js** | Mongoose подключение к MongoDB с обработкой ошибок |
| **models/** | Mongoose схемы с валидацией, индексами и связями между коллекциями |
| **routes/** | REST API endpoints с валидацией входных данных и обработкой ошибок |
| **middleware/auth.js** | JWT middleware для защищённых маршрутов, проверка токена из заголовка Authorization |

---

## Основные возможности

<table>
<tr>
<td width="50%">

### Управление профилем

- **Регистрация и вход**  
  Email + пароль с JWT токенами
  
- **Редактирование профиля**  
  Имя, биография, аватарка
  
- **Аватарки через URL**  
  Поддержка любых изображений
  
- **Приватные данные**  
  Email и пароль защищены

</td>
<td width="50%">

### Навыки

- **Добавление навыков**  
  Название + уровень (начинающий → эксперт)
  
- **Поиск навыков**  
  Поиск по названию в реальном времени
  
- **Управление списком**  
  Удаление своих навыков
  
- **Отображение владельца**  
  Видно, кто владеет навыком

</td>
</tr>
<tr>
<td width="50%">

### Чат

- **Real-time сообщения**  
  WebSocket через Socket.io
  
- **История чата**  
  Хранение в MongoDB
  
- **Выбор собеседника**  
  Из списка пользователей
  
- **Аватарки в чате**  
  32x32px рядом с сообщениями
  
- **Уведомления**  
  Toast-сообщения о новых чатах

</td>
<td width="50%">

### Поиск пользователей

- **Список всех пользователей**  
  С аватарками и биографией
  
- **Быстрый переход в чат**  
  Одна кнопка "Написать"
  
- **Матчинг система**  
  Автоматическое создание связей
  
- **Онлайн индикатор**  
  WebSocket подключение

</td>
</tr>
</table>

---

## Решение проблем

<details>
<summary><b>MongoDB не запускается</b></summary>

<br>

**Проверка статуса:**

```bash
# macOS
brew services list | grep mongodb

# Linux
systemctl status mongodb

# Docker
docker ps -a | grep mongo
```

**Переустановка через Docker:**

```bash
# Удалить старый контейнер
docker rm -f skillswap-mongo

# Запустить новый
docker run -d \
  --name skillswap-mongo \
  -p 27017:27017 \
  -v skillswap-data:/data/db \
  mongo:latest
```

</details>

<details>
<summary><b>Порт 3000 занят</b></summary>

<br>

```bash
# Найти процесс
lsof -i :3000          # macOS/Linux
netstat -an | findstr :3000  # Windows

# Освободить порт
kill -9 <PID>          # macOS/Linux
taskkill /F /PID <PID> # Windows

# Или изменить порт в .env
PORT=3001
```

</details>

<details>
<summary><b>Ошибка JWT_SECRET not defined</b></summary>

<br>

Создайте файл `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_super_secret_key_change_this
PORT=3000
```

</details>

<details>
<summary><b>CORS ошибки в браузере</b></summary>

<br>

Убедитесь, что в `server.js` правильно настроен CORS:

```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

</details>

<details>
<summary><b>WebSocket не подключается</b></summary>

<br>

**Проверьте:**

1. Сервер запущен: `http://localhost:3000`
2. В консоли браузера нет ошибок
3. Socket.io client загружен: `/socket.io/socket.io.js`

**Тест подключения:**

```javascript
// В консоли браузера
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('authToken') }
});
socket.on('connected', (data) => console.log('Connected:', data));
```

</details>

<details>
<summary><b>npm install зависает</b></summary>

<br>

```bash
# Очистка кеша
npm cache clean --force

# Удаление node_modules
rm -rf node_modules package-lock.json

# Переустановка
npm install

# Или используйте yarn/pnpm
yarn install
# или
pnpm install
```

</details>

---

<div align="center">

## Системные требования

| Компонент | Минимум | Рекомендуется |
|:---------:|:-------:|:-------------:|
| **Node.js** | 14.x | 18.x+ |
| **npm** | 6.x | 8.x+ |
| **MongoDB** | 4.4+ | 5.0+ |
| **RAM** | 512 MB | 1 GB+ |
| **Диск** | 200 MB | 500 MB+ |

</div>

---

<div align="center">

**[⬆ Вернуться наверх](#skillswap-pro)**

</div>