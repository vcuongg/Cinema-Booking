# ProjectMMA

Monorepo cho dự án full-stack với:

- `apps/backend`: Node.js + Express + MongoDB
- `apps/mobile`: React Native với Expo

## Cấu trúc thư mục

```text
ProjectMMA/
├─ apps/
│  ├─ backend/
│  │  └─ src/
│  │     ├─ app.js
│  │     ├─ server.js
│  │     ├─ controllers/
│  │     ├─ models/
│  │     └─ routes/
│  └─ mobile/
│     ├─ App.js
│     └─ src/
│        ├─ components/
│        ├─ screens/
│        └─ services/
├─ package.json
└─ README.md
```

## Cách chạy dự án

### 1. Cài dependencies

Ở thư mục gốc:

```bash
npm install
```

### 2. Cấu hình backend

Tạo file `apps/backend/.env` từ mẫu bên dưới:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectmma
NODE_ENV=development
```

Nếu dùng MongoDB Atlas, thay `MONGODB_URI` bằng connection string của bạn.

### 3. Chạy backend

```bash
npm run dev:backend
```

API mặc định chạy ở `http://localhost:5000`.

### 4. Chạy mobile

```bash
npm run dev:mobile
```

Expo sẽ mở Dev Server để chạy trên emulator hoặc điện thoại.

## API backend

Backend hiện có resource `movies`.

- `GET /api/movies` lấy danh sách movie
- `GET /api/movies/:id` lấy chi tiết movie
- `POST /api/movies` tạo movie mới
- `PATCH /api/movies/:id` cập nhật movie
- `DELETE /api/movies/:id` xóa movie

## Mẫu dữ liệu movie

Movie đang dùng các field sau:

- `title`
- `description`
- `duration`
- `genre`
- `director`
- `actors`
- `posterUrl`
- `trailerUrl`
- `releaseDate`
- `status`
- `rating`
- `priceFrom`
- `isFeatured`

Ví dụ JSON:

```json
{
  "title": "The Lion King",
  "description": "Simba, a young lion prince, flees his kingdom after the murder of his father.",
  "duration": 88,
  "genre": ["Animation", "Adventure", "Drama"],
  "director": "Roger Allers, Rob Minkoff",
  "actors": [
    "Matthew Broderick",
    "James Earl Jones",
    "Jeremy Irons",
    "Nathan Lane"
  ],
  "posterUrl": "https://image.tmdb.org/t/p/w500/2bXbqYdUdNVa8VIWXVfclP2ICtJ.jpg",
  "trailerUrl": "https://www.youtube.com/watch?v=4sj1MT05lAA",
  "releaseDate": "1994-06-15T00:00:00.000Z",
  "status": "now_showing",
  "rating": 8.5,
  "priceFrom": 10.99,
  "isFeatured": true
}
```

## Gợi ý cách làm việc nhóm

- Backend: chia theo `models`, `controllers`, `routes` để mỗi người xử lý một phần.
- Mobile: chia theo `screens`, `components`, `services` để tách UI và API.
- Không commit file `.env`.
- Nếu cần chia sẻ code chung sau này, có thể tạo thêm `packages/shared`.

## Luồng làm việc nhanh

1. Clone repo.
2. Chạy `npm install` ở root.
3. Tạo `apps/backend/.env`.
4. Chạy `npm run dev:backend` và `npm run dev:mobile`.
5. Mỗi người làm feature theo folder riêng rồi push lên GitHub.
