# API Documentation

Base URL: `http://localhost:3000`
Interactive docs: `http://localhost:3000/api/docs`

---

## Auth

### POST `/auth/register`
Регистрация нового пользователя. Токен не требуется.

**Тело запроса:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "alice123",
  "role": "user"
}
```

**Ответ 201:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "user"
  }
}
```

| Код | Причина |
|-----|---------|
| 201 | Пользователь создан |
| 400 | Не заполнены обязательные поля |
| 409 | Email уже занят |

---

### POST `/auth/login`
Логин пользователя. Токен не требуется.

**Тело запроса:**
```json
{
  "email": "alice@example.com",
  "password": "alice123"
}
```

**Ответ 200:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin"
  }
}
```

| Код | Причина |
|-----|---------|
| 200 | Успешный логин |
| 400 | Не заполнены поля |
| 401 | Неверный email или пароль |

---

### GET `/auth/me`
Данные текущего пользователя. Требует токен.

**Заголовок:**
```
Authorization: Bearer <token>
```

**Ответ 200:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

| Код | Причина |
|-----|---------|
| 200 | Данные пользователя |
| 401 | Токен отсутствует или истёк |
| 403 | Токен недействителен |
| 404 | Пользователь не найден |

---

## Users
> Все роуты требуют `Authorization: Bearer <token>`

| Метод | Роут | Описание |
|-------|------|----------|
| GET | `/api/users` | Список всех пользователей с ключами и продуктами |
| GET | `/api/users/:id` | Пользователь по ID |
| POST | `/api/users` | Создать пользователя |
| PUT | `/api/users/:id` | Обновить имя пользователя |
| DELETE | `/api/users/:id` | Удалить пользователя (каскадно удаляет ключи и продукты) |

---

## Products
> Все роуты требуют `Authorization: Bearer <token>`

| Метод | Роут | Описание |
|-------|------|----------|
| GET | `/api/products` | Список всех продуктов |
| GET | `/api/products/:id` | Продукт по ID |
| POST | `/api/products` | Создать продукт |
| PUT | `/api/products/:id` | Обновить продукт |
| DELETE | `/api/products/:id` | Удалить продукт |

**Создание продукта:**
```json
{
  "type": "Electronics",
  "name": "MacBook Pro",
  "ssn": "SN-999-2024"
}
```

Доступные типы: `Electronics` `Furniture` `Clothing` `Food` `Other`

> `userId` подставляется автоматически из токена

---

## Keys

| Метод | Роут | Auth | Описание |
|-------|------|:----:|----------|
| POST | `/api/keys/generate` | ❌ | Создать API ключ для пользователя |
| GET | `/api/keys` | ✅ | Список всех ключей |
| DELETE | `/api/keys/:id` | ✅ | Удалить ключ |

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Не заполнены обязательные поля |
| 401 | Токен отсутствует или истёк |
| 403 | Токен недействителен |
| 404 | Ресурс не найден |
| 409 | Конфликт — email или SSN уже занят |
| 500 | Внутренняя ошибка сервера |