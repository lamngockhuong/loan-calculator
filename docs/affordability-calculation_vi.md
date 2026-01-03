# Tính Khả Năng Vay

## Tổng Quan

Hàm `computeAffordability` tính toán số tiền vay tối đa mà một người có thể vay dựa trên thu nhập hàng tháng và tỷ lệ DTI (Nợ/Thu nhập).

## DTI là gì?

**DTI (Debt-to-Income)** là tỷ lệ đo lường phần thu nhập hàng tháng dành cho trả nợ.

```text
DTI = Khoản Trả Nợ Hàng Tháng / Thu Nhập Hàng Tháng x 100%
```

### Hướng Dẫn Ngưỡng DTI

| Phạm vi DTI | Đánh giá | Khuyến nghị |
| ----------- | -------- | ----------- |
| Dưới 36% | Lý tưởng | Tài chính lành mạnh, rủi ro thấp |
| 37-42% | Chấp nhận được | Cân nhắc khi vay thêm |
| 43-49% | Cảnh báo | Rủi ro tín dụng cao, có thể bị từ chối |
| Trên 50% | Báo động | Cần kế hoạch giảm nợ ngay |

## Chữ Ký Hàm

```typescript
function computeAffordability(
  monthlyIncome: number,
  interestRate: number,
  loanYears: number
): AffordabilityResult
```

## Tham Số

| Tham số | Kiểu | Mô tả |
| ------- | ---- | ----- |
| `monthlyIncome` | number | Thu nhập hàng tháng (VND) |
| `interestRate` | number | Lãi suất năm (%) |
| `loanYears` | number | Thời hạn vay (năm) |

## Giá Trị Trả Về

```typescript
interface AffordabilityResult {
  maxLoan43: number;           // Vay tối đa với 43% DTI
  maxLoan36: number;           // Vay tối đa với 36% DTI (thoải mái)
  maxMonthlyPayment43: number; // Trả tối đa hàng tháng với 43% DTI
  maxMonthlyPayment36: number; // Trả tối đa hàng tháng với 36% DTI
}
```

## Logic Tính Toán

### Bước 1: Tính Khoản Trả Tối Đa Hàng Tháng

Dựa trên ngưỡng DTI:

```text
khoảnTrảTốiĐa43 = thuNhậpTháng x 0.43  (tối đa)
khoảnTrảTốiĐa36 = thuNhậpTháng x 0.36  (thoải mái)
```

### Bước 2: Chuyển Đổi Sang Lãi Suất Tháng

```text
lãiSuấtTháng = lãiSuấtNăm / 100 / 12
```

### Bước 3: Tính Số Tiền Vay Tối Đa (Công Thức PMT Ngược)

Công thức PMT ngược tính giá trị hiện tại (số tiền vay) từ khoản trả:

```text
PV = PMT x ((1 - (1 + r)^-n) / r)

Trong đó:
- PV = Giá trị hiện tại (số tiền vay tối đa)
- PMT = Khoản trả tối đa hàng tháng
- r = Lãi suất tháng
- n = Tổng số tháng
```

### Trường Hợp Đặc Biệt: Lãi Suất 0%

```text
Nếu r = 0: sốTiềnVayTốiĐa = khoảnTrảTốiĐa x tổngSốTháng
```

## Ví Dụ

### Đầu Vào

- Thu nhập hàng tháng: 30,000,000 VND
- Lãi suất: 9%/năm
- Thời hạn vay: 20 năm

### Tính Toán

```text
Bước 1: Khoản trả tối đa hàng tháng
- Với 43% DTI: 30,000,000 x 0.43 = 12,900,000 VND
- Với 36% DTI: 30,000,000 x 0.36 = 10,800,000 VND

Bước 2: Lãi suất tháng
- 9 / 100 / 12 = 0.0075

Bước 3: Số tiền vay tối đa (công thức PMT ngược)
- Với 43% DTI: ~1,433,000,000 VND (~1.43 tỷ)
- Với 36% DTI: ~1,200,000,000 VND (~1.2 tỷ)
```

### Kết Quả

```typescript
{
  maxLoan43: 1_433_000_000,
  maxLoan36: 1_200_000_000,
  maxMonthlyPayment43: 12_900_000,
  maxMonthlyPayment36: 10_800_000
}
```

## Tại Sao Có Hai Mức DTI?

| Mức | DTI | Mục đích |
| --- | --- | -------- |
| **Tối đa** | 43% | Giới hạn trên, rủi ro cao, có thể gây căng thẳng tài chính |
| **Thoải mái** | 36% | Khuyến nghị, còn dư cho trường hợp khẩn cấp |

**Khuyến nghị**: Sử dụng mức 36% DTI để an toàn tài chính. Chỉ cân nhắc 43% nếu bạn có thu nhập ổn định và không có khoản nợ khác.

## Các Công Thức Chính

### Tính DTI

```text
DTI = (Khoản Trả Vay Hàng Tháng / Thu Nhập Hàng Tháng) x 100%
```

### PMT Ngược (Số Tiền Vay Từ Khoản Trả)

```text
PV = PMT x ((1 - (1 + r)^-n) / r)
```

### PMT Chuẩn (Khoản Trả Từ Số Tiền Vay)

```text
PMT = PV x (r x (1 + r)^n) / ((1 + r)^n - 1)
```

## Ghi Chú

1. **Thu nhập gộp**: Sử dụng thu nhập trước thuế để tính toán
2. **Các khoản nợ khác**: Công thức chỉ tính cho một khoản vay; giảm bớt nếu có nợ khác
3. **Lãi suất thay đổi**: Sử dụng lãi suất năm đầu; khả năng vay thực tế có thể thay đổi
4. **Cách tiếp cận thận trọng**: DTI 36% được khuyến nghị cho sức khỏe tài chính dài hạn

## Hàm Liên Quan

- `computeScheduleAnnuity()` - Tính lịch trả nợ
- `PMT()` - Tính khoản trả hàng tháng từ số tiền vay
- `computeEarlyRepayment()` - Tính tiết kiệm khi trả trước hạn
