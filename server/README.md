# Electronics Shop API

Node.js + Express + MongoDB (Mongoose), JWT, REST JSON.

## Настройка

1. Скопируйте `.env.example` в `.env` и заполните `MONGODB_URI`, `JWT_SECRET`, при необходимости `ADMIN_API_KEY`.
2. В Atlas: Network Access — разрешите IP (или `0.0.0.0/0` для разработки).
3. Установка и запуск:

```bash
cd server
npm install
npm run dev
```

Сервер: `http://localhost:4000`, проверка: `GET http://localhost:4000/api/health`.

## Заполнение каталога

Из корня монорепозитория (нужен `tsx` — ставится при `npm install` в корне):

```bash
npm run seed:db
```

Скрипт читает `src/data/mockData.ts` и вставляет товары в MongoDB (обновляет существующие по `id`).

## Эндпоинты

| Метод | Путь | Описание |
|--------|------|----------|
| POST | `/api/auth/register` | Регистрация `{ email, password, name, phone }` → `{ token, user }` |
| POST | `/api/auth/login` | Вход → `{ token, user }` |
| GET | `/api/auth/me` | Профиль, заголовок `Authorization: Bearer <token>` |
| PATCH | `/api/auth/me` | `{ name?, phone?, newPassword? }` |
| GET | `/api/products` | Список товаров |
| GET | `/api/products/:id` | Один товар |
| POST | `/api/orders` | Создать заказ (тело как у фронта). Опционально JWT — привязка к пользователю и баллы |
| GET | `/api/orders/my` | Заказы текущего пользователя (JWT) |
| POST | `/api/admin/products` | Создать товар, заголовок `X-Admin-Key` |
| PATCH | `/api/admin/products/:id` | Обновить |
| DELETE | `/api/admin/products/:id` | Удалить |

Фронт: задайте `VITE_API_URL=http://localhost:4000` в `.env` в корне проекта.
