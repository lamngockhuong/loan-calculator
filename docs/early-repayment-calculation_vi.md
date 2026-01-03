# Tính Toán Trả Nợ Trước Hạn

## Tổng Quan

Hàm `computeEarlyRepayment` tính toán số tiền lãi tiết kiệm được và thay đổi lịch trả nợ khi trả thêm tiền vào khoản vay.

## Chữ Ký Hàm

```typescript
function computeEarlyRepayment(
  loanAmount: number,
  totalMonths: number,
  interestRates: number[],
  calcMethod: 'annuity' | 'fixed',
  extraAmount: number,
  paymentType: 'one-time' | 'monthly'
): EarlyRepaymentResult
```

## Tham Số

| Tham số | Kiểu | Mô tả |
| ------- | ---- | ----- |
| `loanAmount` | number | Số tiền vay gốc (VND) |
| `totalMonths` | number | Thời hạn vay (tháng) |
| `interestRates` | number[] | Lãi suất hàng năm theo từng năm (%) |
| `calcMethod` | 'annuity' \| 'fixed' | Phương pháp tính |
| `extraAmount` | number | Số tiền trả thêm (VND) |
| `paymentType` | 'one-time' \| 'monthly' | Tần suất trả thêm |

## Giá Trị Trả Về

```typescript
interface EarlyRepaymentResult {
  newSchedule: ScheduleEntry[];    // Lịch trả nợ mới
  originalTotalInterest: number;  // Tổng lãi không trả thêm
  newTotalInterest: number;       // Tổng lãi khi trả thêm
  interestSaved: number;          // Lãi tiết kiệm = gốc - mới
  originalMonths: number;         // Số tháng ban đầu
  newMonths: number;              // Số tháng mới (có thể ngắn hơn)
  monthsReduced: number;          // Số tháng giảm = gốc - mới
}
```

## Logic Tính Toán

### Bước 1: Tính Lịch Trả Nợ Gốc

Đầu tiên, tính lịch trả nợ gốc không có trả thêm, sử dụng:

- `computeScheduleAnnuity()` - Trả góp đều hàng tháng (công thức PMT)
- `computeScheduleFixed()` - Gốc cố định, lãi giảm dần

### Bước 2: Áp Dụng Trả Thêm

#### Trả Một Lần (One-Time)

- Giảm gốc ngay lập tức ở tháng 1
- Công thức: `gốcMới = sốTiềnVay - sốTiềnTrảThêm`
- Tính lại khoản trả hàng tháng dựa trên gốc đã giảm

#### Trả Thêm Hàng Tháng (Monthly)

- Cộng vào mỗi khoản trả hàng tháng
- Giảm gốc nhanh hơn mỗi tháng
- Công thức: `tổngTrả = khoảnTrảThường + sốTiềnTrảThêm`

### Bước 3: Tính Lại Lịch Trả Nợ

Với mỗi tháng cho đến khi trả hết nợ:

```text
Phương pháp Trả Góp Đều (Annuity):
1. Tính số tháng còn lại
2. Tính lại PMT cho dư nợ còn lại
3. Cộng thêm số tiền trả thêm (nếu hàng tháng)
4. Lãi = dưNợCònLại x lãiSuấtTháng
5. Gốc = khoảnTrả - lãi
6. Cập nhật dư nợ còn lại

Phương pháp Gốc Cố Định (Fixed):
1. gốcCốĐịnh = sốTiềnVay / tổngSốTháng
2. gốc = gốcCốĐịnh + sốTiềnTrảThêm (nếu hàng tháng)
3. lãi = dưNợCònLại x lãiSuấtTháng
4. khoảnTrả = gốc + lãi
5. Cập nhật dư nợ còn lại
```

### Bước 4: Tính Tiết Kiệm

```text
lãiTiếtKiệm = tổngLãiGốc - tổngLãiMới
sốThángGiảm = sốThángGốc - sốThángMới
```

## Ví Dụ

### Đầu Vào

- Khoản vay: 500,000,000 VND
- Thời hạn: 120 tháng (10 năm)
- Lãi suất: 8%/năm
- Phương pháp: Trả góp đều
- Trả thêm: 5,000,000 VND/tháng

### Kết Quả

```typescript
{
  originalTotalInterest: 226_000_000,  // ~226 triệu VND
  newTotalInterest: 142_000_000,       // ~142 triệu VND
  interestSaved: 84_000_000,           // Tiết kiệm ~84 triệu VND
  originalMonths: 120,
  newMonths: 78,                       // Trả hết sớm hơn 42 tháng
  monthsReduced: 42
}
```

## Các Công Thức Chính

### Lãi Suất Tháng

```text
lãiSuấtTháng = lãiSuấtNăm / 100 / 12
```

### Công Thức PMT (Khoản Trả)

```text
PMT = r x PV x (1 + r)^n / ((1 + r)^n - 1)

Trong đó:
- r = lãi suất tháng
- PV = giá trị hiện tại (số tiền vay)
- n = số tháng
```

### Tính Lãi

```text
lãiTháng = dưNợCònLại x lãiSuấtTháng
```

### Tính Gốc

```text
gốc = khoảnTrả - lãi
```

## Ghi Chú

1. **Kết thúc sớm**: Vòng lặp dừng khi `dưNợCònLại <= 0.01` (xử lý số thập phân)
2. **Giới hạn an toàn**: Tối đa `tổngSốTháng x 2` vòng lặp để tránh vô hạn
3. **Lãi suất biến đổi**: Hỗ trợ lãi suất khác nhau theo năm qua `getInterestRateMonthly()`
4. **Độ chính xác**: Tất cả số tiền tính bằng VND (không cần số thập phân khi hiển thị)

## Hàm Liên Quan

- `computeScheduleAnnuity()` - Lịch trả nợ trả góp đều
- `computeScheduleFixed()` - Lịch trả nợ gốc cố định
- `PMT()` - Tính khoản trả hàng tháng
- `getInterestRateMonthly()` - Lấy lãi suất cho tháng cụ thể
