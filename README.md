# Express Drizzle API

> REST API с JWT авторизацией, Swagger документацией и SQLite через Drizzle ORM

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Drizzle_ORM-003B57?logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D?logo=swagger&logoColor=black)

---

## Быстрый старт
### 1. Клонировать репозиторий
```bash
git clone https://github.com/wisteryyy/Express-Swagger.git
cd Express-Swagger
```

### 2. Установить зависимости
```bash
npm install
```

### 3. Создать файл `.env`
Создайте файл `.env` в корне проекта:

```env
PORT=3000
DATABASE_URL=./dev.db
JWT_SECRET=your-secret-key
```

### 4. Применить схему базы данных
```bash
npm run db:push
```

### 5. Заполнить базу тестовыми данными
```bash
npm run seed
```

После этого в базе появятся два тестовых пользователя:

| Имя   | Email                  | Пароль   | Роль  |
|-------|------------------------|----------|-------|
| Alice | alice@example.com      | alice123 | admin |
| Bob   | bob@example.com        | bob123   | user  |

### 6. Запустить сервер
```bash
npm run dev
```

Сервер: **http://localhost:3000**
Swagger UI: **http://localhost:3000/api/docs**

---

**Шаги для работы в Swagger:**

1. `POST /auth/login` → **Try it out** → введите email и пароль
2. Скопируйте `token` из ответа
3. Нажмите **Authorize 🔒** вверху страницы → вставьте токен

---

## Структура проекта

```
src/
├── config/
│   ├── jwt.ts          # Настройки JWT
│   └── swagger.ts      # Настройки Swagger
├── db/
│   ├── index.ts        # Подключение к БД
│   └── schema.ts       # Схема таблиц (users, products, keys)
├── controllers/
│   └── auth.ts         # Логика register / login / me
├── utils/
│   └── jwt.ts          # Генерация и верификация токенов
├── middleware/
│   └── auth.ts         # JWT middleware
├── routes/
│   ├── auth.ts         # /auth/*
│   ├── users.ts        # /api/users/*
│   ├── products.ts     # /api/products/*
│   └── keys.ts         # /api/keys/*
├── seeders/
│   └── seed.ts         # Тестовые данные
└── index.ts            # Точка входа

docs/
└── API.md              # Документация эндпоинтов
```

---

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск с hot reload |
| `npm run build` | Сборка TypeScript → JavaScript |
| `npm run start` | Запуск собранного проекта |
| `npm run db:push` | Применить схему БД |
| `npm run db:studio` | Drizzle Studio — визуальный просмотр БД |
| `npm run seed` | Заполнить БД тестовыми данными |

---

## 📖 Документация

- Интерактивная: [Swagger UI](http://localhost:3000/api/docs)
- Текстовая: [docs/API.md](./docs/API.md)

---