# Công cụ Tính Khoản Vay

Đây là ứng dụng máy tính khoản vay được xây dựng bằng [Next.js](https://nextjs.org) và khởi tạo với [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tính Năng

1. **Nhập Số Tiền Vay**

   - Cho phép người dùng nhập số tiền vay bằng VND.

2. **Nhập Thời Hạn Vay**

   - Cho phép người dùng nhập thời hạn vay bằng năm (có thể là số lẻ).

3. **Chọn Phương Pháp Tính Toán**

   - Người dùng có thể chọn giữa hai phương pháp tính toán:
     - Gốc, lãi chia đều hàng tháng
     - Gốc cố định, lãi giảm dần

4. **Tạo Lãi Suất**

   - Tạo lãi suất cho từng năm hoặc lãi suất chung cho tất cả các năm.

5. **Nhập Lãi Suất**

   - Cho phép người dùng nhập lãi suất cho từng kỳ hạn.

6. **Tính Toán Lịch Trả Nợ**

   - Tính toán lịch trả nợ dựa trên các giá trị nhập vào và phương pháp tính toán đã chọn.

7. **Hiển Thị Lịch Trả Nợ**

   - Hiển thị lịch trả nợ dưới dạng bảng với các cột sau:
     - Tháng
     - Số dư đầu kỳ (VND)
     - Tiền lãi (VND)
     - Tiền gốc (VND)
     - Tổng trả (VND)
     - Số dư cuối kỳ (VND)

8. **Hiển Thị Thống Kê**

   - Hiển thị tổng lãi phải trả và tổng số tiền gốc và lãi phải trả.

9. **Biểu Đồ Trả Nợ**

   - Hiển thị biểu đồ đường cho thấy số dư đầu kỳ và cuối kỳ trong suốt thời hạn vay.

10. **Biểu Đồ Lãi và Gốc**

    - Hiển thị biểu đồ cột cho thấy số tiền lãi và gốc trong suốt thời hạn vay.

11. **Tải Xuống CSV**

    - Cho phép người dùng tải xuống lịch trả nợ dưới dạng tệp CSV.

12. **Hỗ Trợ Đa Ngôn Ngữ**

    - Hỗ trợ tiếng Anh và tiếng Việt.

13. **Xử Lý Lỗi**
    - Hiển thị thông báo lỗi cho các đầu vào không hợp lệ như thời hạn vay, số tiền vay hoặc lãi suất không hợp lệ.

## Bắt Đầu

### Yêu Cầu

Đảm bảo bạn đã cài đặt các phần mềm sau:

- [Node.js](https://nodejs.org/) (phiên bản 22 trở lên)
- [pnpm](https://pnpm.io/) (phiên bản 10 trở lên)

### Cài Đặt

Đầu tiên, clone repository:

```bash
git clone https://github.com/lamngockhuong/loan-calculator.git
cd loan-calculator
```

Sau đó, cài đặt các phụ thuộc:

```bash
pnpm install
```

### Chạy Server Phát Triển

Đầu tiên, chạy server phát triển:

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) bằng trình duyệt của bạn để xem kết quả.

Bạn có thể bắt đầu chỉnh sửa trang bằng cách sửa đổi `app/page.tsx`. Trang sẽ tự động cập nhật khi bạn chỉnh sửa tệp.

### Chạy Kiểm Tra

Để chạy kiểm tra, sử dụng lệnh sau:

```bash
pnpm test
```

### Xây Dựng Cho Sản Xuất

Để tạo bản build tối ưu cho sản xuất, chạy:

```bash
pnpm build
```

## Tìm Hiểu Thêm

Để tìm hiểu thêm về Next.js, hãy xem các tài nguyên sau:

- [Tài liệu Next.js](https://nextjs.org/docs) - tìm hiểu về các tính năng và API của Next.js.
- [Học Next.js](https://nextjs.org/learn) - một hướng dẫn tương tác về Next.js.

Bạn có thể xem [repository GitHub của Next.js](https://github.com/vercel/next.js) - phản hồi và đóng góp của bạn được hoan nghênh!
