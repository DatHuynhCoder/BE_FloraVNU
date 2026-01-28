# FloraVNU - Tiệm hoa tươi, nơi trình yêu bắt đầu

FloraVNU là nền tảng thương mại điện tử chuyên cung cấp hoa tươi tại Làng Đại học Thủ Đức, Backend được xây dựng bằng Nestjs và TypeScript.

## Tính năng chính

### Người dùng
- Duyệt và tìm kiếm sản phẩm hoa với bộ lọc đa dạng (theo sự kiện, loại hoa, kiểu dáng, giá)
- Giỏ hàng và đặt hàng trực tuyến
- Thanh toán qua VNPAY hoặc COD
- Theo dõi lịch sử đơn hàng và trạng thái giao hàng
- Đánh giá và bình luận sản phẩm (rating 0.5-5 sao)
- Quản lý thông tin tài khoản (hồ sơ, đổi mật khẩu, xóa tài khoản)
- Chatbox hỗ trợ khách hàng với AI
- Tùy chọn nhận tại cửa hàng hoặc giao hàng tận nơi
- Thêm lời nhắn và ghi chú cho đơn hàng

### Quản trị viên
- Quản lý đơn hàng (xem, cập nhật trạng thái, hủy)
- Quản lý tài khoản người dùng

## Công nghệ sử dụng ở Backend

- Framework: NestJS
- Language: TypeScript
- Database: MongoDB
- ODM (Object Data Mapping): Mongoose
- Cloud Platform: Cloudinary
- Payment Gateway: PayOS
- VectorDB: Qdrant
- Auth: JWT, passport
- AI Agent: Gemini AI API

## Cấu trúc dự án

```
src/
├── common/                          
│   ├── schemas/                     # common schemas 
│   │   ├── image.schema.ts          # image schema for user, flower,...
│   ├── services/                    # common services
│   │   ├── cloudinary/              # cloudinary services use for upload, get images
│   │   ├── gemini/                  # gemini ai services using in chatbot
│   │   ├── qdrant/                  # qdrant services for vectorDB
├── decorators/                      
│   ├── roles.decorator.ts           # Decorator for roles: admin, customer,...
├── guards/ 
│   ├── payment-webhook.guard.ts     # Guard to check payment requests
│   ├── roles.guard.ts               # Guard to check role requests
├── mail/                             
│   ├── template.hbs                 # contain mail config and template
├── modules/                        
│   ├── account/                     # module to handle all account logic
│   │   ├── dto                      # define request, response structure
│   │   ├── schemas                  # schema about account
│   │   ├── account.controller.ts    # handle http request, routing
│   │   ├── account.module.ts        # module config 
│   │   ├── account.service.ts       # handle all module logic
│   ├── auth/                        # module to handle all auth logic
│   ├── cart/                        # module to handle all cart logic
│   ├── chatbot/                     # module to handle all chatbot logic
│   ├── comment/                     # module to handle all comment logic
│   ├── flower/                      # module to handle all flower logic
│   ├── order/                       # module to handle all order logic
│   ├── payment/                     # module to handle all payment logic
├── utils/ 
│   ├── getQdrantId.ts               # get qdrant vectorid based on mongo objectid
│   ├── hashPass.ts                  # hashing password
│   ├── normalizeStr.ts              # normalize Vietnamese string
│   ├── payos-utils.ts               # utilities for payment logic
│   ├── trimHTMLTags.ts              # remove all html tag, only keep content
├── app.controller.ts                
├── app.module.ts                    
├── app.service.ts                   
├── main.ts  
```

## Bắt đầu

### Yêu cầu

- Node.js 18.x trở lên

### Cài đặt

1. Clone repository:
```bash
git clone https://github.com/DatHuynhCoder/BE_FloraVNU.git
cd BE_FloraVNU
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` trong thư mục root với các biến môi trường:
```env
PORT = 5000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRE=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAIL_ADMIN=
MAIL_PASSWORD=
GEMINI_API_KEY=
QDRANT_API_KEY=
QDRANT_URI=
QDRANT_COLLECTION_NAME=flower_vector
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

4. Chạy development server:
```bash
npm run start:dev
```

Website sẽ chạy tại `http://localhost:5000`

## License

[MIT License](LICENSE)

## Nhóm phát triển

Sinh viên Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM

Team: NhungChangTraiBanHoa

## Links

- Website: [https://floravnu.com](https://floravnu.com)
- Backend Repository: [https://github.com/DatHuynhCoder/BE_FloraVNU](https://github.com/DatHuynhCoder/BE_FloraVNU)
- Frontend Repository: [https://github.com/LewingKai/FloraVNU_FE](https://github.com/LewingKai/FloraVNU_FE)

---

Made with love by NhungChangTraiBanHoa Team