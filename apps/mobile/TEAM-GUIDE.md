# Hướng dẫn chia việc FE cho nhóm

## Mục tiêu

Giữ `src/app` chỉ cho route/layout, còn toàn bộ màn hình và logic nghiệp vụ đưa vào `src/features` để cả nhóm làm song song mà ít đụng nhau nhất.

## Cấu trúc đề xuất

```text
src/
├─ app/
│  ├─ _layout.tsx
│  ├─ index.tsx
│  └─ explore.tsx
├─ features/
│  ├─ auth/
│  │  ├─ screens/
│  │  └─ components/
│  ├─ home/
│  │  └─ screens/
│  ├─ profile/
│  │  └─ screens/
│  ├─ showtimes/
│  │  └─ screens/
│  ├─ seat-selection/
│  │  └─ screens/
│  ├─ payment/
│  │  └─ screens/
│  ├─ tickets/
│  │  └─ screens/
│  └─ admin/
│     ├─ dashboard/
│     ├─ movies/
│     ├─ cinemas/
│     ├─ rooms/
│     ├─ showtimes/
│     ├─ bookings/
│     └─ users/
└─ shared/
   ├─ components/
   ├─ services/
   ├─ types/
   ├─ hooks/
   └─ constants/
```

## Phân công cho 5 người

### Người 1

- `login`
- `register`
- `home`
- `movie detail`

Nên làm trong:

- `src/features/auth`
- `src/features/home`

### Người 2

- `profile`
- `showtime`
- `seat selection`

Nên làm trong:

- `src/features/profile`
- `src/features/showtimes`
- `src/features/seat-selection`

### Người 3

- `payment`
- `my ticket`

Nên làm trong:

- `src/features/payment`
- `src/features/tickets`

### Người 4

- admin dashboard
- admin movie management
- admin cinema management
- admin room management

Nên làm trong:

- `src/features/admin/dashboard`
- `src/features/admin/movies`
- `src/features/admin/cinemas`
- `src/features/admin/rooms`

### Người 5

- admin showtime management
- admin booking management
- admin user management
- các màn admin phụ trợ khác

Nên làm trong:

- `src/features/admin/showtimes`
- `src/features/admin/bookings`
- `src/features/admin/users`

## Quy ước làm việc

- Chỉ một người được sửa `src/app/_layout.tsx` và cấu trúc route.
- Mỗi màn hình chỉ thuộc về một feature duy nhất.
- Component dùng lại nhiều nơi thì chuyển vào `src/shared/components`.
- API call dùng lại thì đặt vào `src/shared/services`.
- Type dùng chung thì đặt vào `src/shared/types`.
- Không để logic nghiệp vụ trong `src/app`.
- Không để 2 người cùng sửa một file màn hình lớn.
- Tên file nên thống nhất theo `*.screen.tsx` hoặc `*.tsx` cho component.

## Cách làm an toàn cho nhóm

1. Chốt danh sách API backend trước khi code màn hình.
2. Mỗi người tạo riêng component trong folder của mình.
3. Nếu cần tái sử dụng, đưa lên `shared` thay vì copy-paste.
4. Cuối ngày chỉ merge phần đã hoàn thành trong feature của mình.
5. Nếu route mới cần thêm, báo người phụ trách `src/app` để tránh xung đột.

## Gợi ý 16 màn hình

- Auth: login, register
- Home: home, movie detail
- User: profile, showtime, seat selection, payment, my ticket
- Admin: dashboard, movie management, cinema management, room management, showtime management, booking management, user management

## Nguyên tắc cho admin

Các màn admin nên chia theo domain, không chia theo file lẻ, để người 4 và người 5 không đạp nhau.

- Người 4 giữ phần `movies`, `cinemas`, `rooms`
- Người 5 giữ phần `showtimes`, `bookings`, `users`

## Map từng màn sang route

Quy ước chung:

- Route chỉ đặt trong `src/app`
- UI và logic của từng màn đặt trong `src/features`
- Mỗi màn có 1 file screen riêng

| Màn hình                       | Route đề xuất                                    | File feature                                                       | Người phụ trách |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------ | --------------- |
| Login                          | `src/app/(auth)/login.tsx`                       | `src/features/auth/screens/LoginScreen.tsx`                        | Người 1         |
| Register                       | `src/app/(auth)/register.tsx`                    | `src/features/auth/screens/RegisterScreen.tsx`                     | Người 1         |
| Home                           | `src/app/(tabs)/index.tsx`                       | `src/features/home/screens/HomeScreen.tsx`                         | Người 1         |
| Movie detail                   | `src/app/movie/[id].tsx`                         | `src/features/home/screens/MovieDetailScreen.tsx`                  | Người 1         |
| Profile                        | `src/app/(user)/profile.tsx`                     | `src/features/profile/screens/ProfileScreen.tsx`                   | Người 2         |
| Showtime                       | `src/app/(user)/showtimes/[movieId].tsx`         | `src/features/showtimes/screens/ShowtimesScreen.tsx`               | Người 2         |
| Seat selection                 | `src/app/(user)/seat-selection/[showtimeId].tsx` | `src/features/seat-selection/screens/SeatSelectionScreen.tsx`      | Người 2         |
| Payment                        | `src/app/(user)/payment.tsx`                     | `src/features/payment/screens/PaymentScreen.tsx`                   | Người 3         |
| My ticket                      | `src/app/(user)/my-ticket.tsx`                   | `src/features/tickets/screens/MyTicketScreen.tsx`                  | Người 3         |
| Admin dashboard                | `src/app/(admin)/dashboard.tsx`                  | `src/features/admin/dashboard/screens/AdminDashboardScreen.tsx`    | Người 4         |
| Admin movie management         | `src/app/(admin)/movies.tsx`                     | `src/features/admin/movies/screens/AdminMovieListScreen.tsx`       | Người 4         |
| Admin cinema management        | `src/app/(admin)/cinemas.tsx`                    | `src/features/admin/cinemas/screens/AdminCinemaListScreen.tsx`     | Người 4         |
| Admin room management          | `src/app/(admin)/rooms.tsx`                      | `src/features/admin/rooms/screens/AdminRoomListScreen.tsx`         | Người 4         |
| Admin showtime management      | `src/app/(admin)/showtimes.tsx`                  | `src/features/admin/showtimes/screens/AdminShowtimeListScreen.tsx` | Người 5         |
| Admin booking management       | `src/app/(admin)/bookings.tsx`                   | `src/features/admin/bookings/screens/AdminBookingListScreen.tsx`   | Người 5         |
| Admin user management          | `src/app/(admin)/users.tsx`                      | `src/features/admin/users/screens/AdminUserListScreen.tsx`         | Người 5         |
| Admin reports hoặc màn phụ trợ | `src/app/(admin)/reports.tsx` nếu có             | `src/features/admin/...`                                           | Người 5         |

## Cách đặt file thực tế

Khi bắt đầu code, nên tạo đúng theo cấu trúc này:

```text
src/
├─ app/
│  ├─ (auth)/login.tsx
│  ├─ (auth)/register.tsx
│  ├─ (tabs)/index.tsx
│  ├─ movie/[id].tsx
│  ├─ (user)/profile.tsx
│  ├─ (user)/showtimes/[movieId].tsx
│  ├─ (user)/seat-selection/[showtimeId].tsx
│  ├─ (user)/payment.tsx
│  ├─ (user)/my-ticket.tsx
│  └─ (admin)/...
└─ features/
   ├─ auth/screens/
   ├─ home/screens/
   ├─ profile/screens/
   ├─ showtimes/screens/
   ├─ seat-selection/screens/
   ├─ payment/screens/
   ├─ tickets/screens/
   └─ admin/*/screens/
```

## Lưu ý cuối

Khi bắt đầu code thật, nên tạo thêm file `index.ts` trong từng feature để export gọn và giữ cấu trúc import thống nhất.
