# Backend Microblog API

## 📌 Төслийн тайлбар

Энэхүү API нь блог платформ хөгжүүлэлтийн backend систем бөгөөд нийтлэл удирдах, сэтгэгдэл, лайк, хэрэглэгчийн удирдлага, аюулгүй байдал зэрэг үндсэн функцуудыг агуулсан систем билээ.

## 🛠️ Ашигласан технологиуд

- **Node.js & Express.js**: Сервер талын хөгжүүлэлт
- **TypeScript**: Typesafe хөгжүүлэлт
- **Prisma ORM**: Өгөгдлийн сангийн харилцаа
- **PostgreSQL**: Өгөгдлийн сан
- **JWT**: Хэрэглэгчийн нэвтрэлт ба токен
- **bcrypt**: Нууц үг шифрлэлт
- **Nodemailer**: Имэйл илгээлт
- **Railway**: Cloud deploy demo

## 🌐 Туршилтын хувилбар

Системийн ажиллагааг туршиж үзэхэд хялбар болгох зорилгоор [Railway.app](https://railway.app) платформ дээр deploy хийгдсэн ба Railway нь PostgreSQL өгөгдлийн санг автоматаар үүсгэж, CI/CD процессыг хялбарчлан, GitHub репозиторитой шууд холбогддог. Та POSTMAN эсвэл өөрт хялбар дурын API турших хэрэгсэлээр дараах хаягаар шууд туршиж үзэх боломжтой:

🔗 **[https://backend-microblog-production.up.railway.app](https://backend-microblog-production.up.railway.app)**

### 👤 Туршилтын бүртгэлүүд

Систем нь 3 төрлийн хэрэглэгчийн эрхтэй:

| Эрх        | Тайлбар                                                   | Нэвтрэх мэдээлэл                                                   |
| ---------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| **ADMIN**  | Бүх эрхтэй                                                | `demoadmin@example.com` / `Admin123!`                              |
| **EDITOR** | Нийтлэл үүсгэх, засварлах, өөрийн нийтэлсэн мэдээг устгах | `editor@example.com` / `editor123`                                 |
| **READER** | Зөвхөн унших, сэтгэгдэл, лайк үлдээх боломжтой            | _Дурын бүртгэл шинээр үүсгэхэд автоматаар READER болж бүртгэгдэнэ_ |

## 🔄 API-ийн үндсэн endpoint-ууд

### 🔐 Authentication

- `POST /api/auth/register` - Шинэ хэрэглэгч бүртгэх
- `POST /api/auth/login` - Нэвтрэх, JWT токен авах
- `GET /api/auth/verify/:token` - Имэйл хаягаа баталгаажуулах
- `POST /api/auth/forgot-password` - Нууц үг сэргээх хүсэлт
- `POST /api/auth/reset-password/:token` - Шинэ нууц үг тохируулах
- `GET /api/auth/demo-get-verification/:email` - Имэйл баталгаажуулах холбоос шууд авах
- `POST /api/auth/demo-forgot-password` - Нууц үг сэргээх холбоос шууд авах

### 📝 Нийтлэл

- `GET /api/articles` - Нийтлэлийн жагсаалт харах (хуудаслалт & шүүлтүүртэй)
- `GET /api/articles/:id` - Нийтлэлийн дэлгэрэнгүй мэдээлэл
- `POST /api/articles` - Шинэ нийтлэл нэмэх (зөвхөн editor/admin эрхтэй)
- `PUT /api/articles/:id` - Нийтлэл засах (зөвхөн editor эсвэл admin)
- `DELETE /api/articles/:id` - Нийтлэл устгах (зөвхөн editor эсвэл admin)

### 💬 Сэтгэгдэл & Лайк

- `POST /api/articles/:id/comments` - Нийтлэлд сэтгэгдэл нэмэх
- `GET /api/articles/:id/comments` - Нийтлэлийн сэтгэгдлүүд харах
- `POST /api/articles/:id/like` - Нийтлэлд лайк дарах/болих

## ✨ Онцлох шийдлүүд

### 1. Имэйл баталгаажуулах шийдэл

Имэйл баталгаажуулалт, нууц үг сэргээх процессыг гүйцэтгэхэд хэд хэдэн асуудалтай тулгарсан:

- Үүлэн орчинд (Railway) имэйл серверийн тохиргоо хийхэд нэмэлт төлбөр төлөх шаардлагатай
- Ethereal имэйл үйлчилгээ нь зөвхөн локал орчинд хэрэглэхэд илүү тохиромжтой
- Бодит имэйл илгээх нь туршилтын project-т хүндрэлтэй

**Шийдэл**: Зөвхөн туршилтын зорилгоор, тусгай демо endpoint-уудыг нэмсэн:

- `POST /api/auth/demo-forgot-password` - Нууц үг сэргээх холбоос шууд авах
- `GET /api/auth/demo-get-verification/:email` - Имэйл баталгаажуулах холбоос шууд авах

Энэ шийдэл нь туршилт хийх хүмүүс серверийн логуудруу (Railway) нэвтрэх шаардлагагүйгээр үйлчилгээг бүрэн туршиж үзэх боломжийг олгоно.

### 2. Архитектурын шийдэл

Системийн бүтэц нь MVC загвар дээр суурилсан:

- **Controllers**: Хүсэлт хүлээж авах, хариу илгээх
- **Services**: Гол логик
- **Middleware**: Auth шалгалт, эрхийн хяналт
- **Utils**: Туслах функцууд

## 💻 Локал орчинд ажиллуулах заавар

### Шаардлагууд:

- Node.js (14.x буюу түүнээс дээш)
- PostgreSQL өгөгдлийн сан (Өөр нэртэй датабааз үүсгэх шаардлагагүй)
- npm эсвэл yarn

### Алхамууд:

1. **Төслийг татах**
   Алхамууд:

git clone https://github.com/username/backend-microblog.git
cd backend-microblog
npm install
.env file үүсгэх
DATABASE_URL="postgresql://username:password@localhost:5432/microblog"
JWT_SECRET="your-jwt-secret-key"
npx prisma migrate dev
npx prisma db seed
npm run dev
http://localhost:5000/api/articles
