# KIẾN TRÚC VÀ NGUYÊN TẮC PHÁT TRIỂN AVAB

> **BẮT BUỘC TUÂN THỦ** — Mọi thay đổi, tính năng mới hoặc chỉnh sửa đều phải qua checklist này.

---

## 1. User First
Mọi thiết kế xuất phát từ trải nghiệm người dùng, không phải góc nhìn kỹ thuật.

## 2. Workflow First
Thiết kế theo quy trình thực tế của giáo viên, học sinh, phụ huynh và nhà quản lý — không thiết kế theo cấu trúc module hoặc AI Engine.

## 3. One Feature – One Home
Mỗi chức năng **chỉ tồn tại ở một nơi duy nhất**. Không trùng lặp ở nhiều màn hình.

## 4. Simple & Efficient
- Ít thao tác nhất
- Ít lần nhấp nhất
- Ít màn hình nhất
- Người mới sử dụng được mà gần như không cần đào tạo

## 5. Consistency
Toàn hệ thống thống nhất: giao diện, màu, icon, tên gọi, luồng thao tác, component, quy tắc hiển thị.  
Không để mỗi module có phong cách riêng.

## 6. Responsive & Cross Platform
Hoạt động tốt trên Desktop, Laptop, Tablet, Mobile.  
Hỗ trợ Chrome, Edge, Safari, Firefox.  
Không có chức năng chỉ hoạt động trên một thiết bị hoặc trình duyệt.

## 7. Dynamic Architecture
Mọi dữ liệu, form, workflow, dashboard, role, permission, menu và cấu hình **phải thiết kế động**.  
Không hard-code. Cho phép mở rộng mà không cần sửa code.

## 8. Reuse First
Không phát triển lại chức năng nếu đã có. Ưu tiên tái sử dụng: Component, Service, API, Workflow, AI Engine, Dashboard, Form.

## 9. Refactor First
Trước khi tạo mới, kiểm tra:
- Đã có chức năng tương tự chưa?
- Có thể mở rộng cái cũ không?
- Có gây trùng lặp không?

**Ưu tiên Refactor thay vì tạo thêm.**

## 10. Full Impact Analysis
Khi sửa một chức năng, phân tích toàn bộ ảnh hưởng: màn hình, API, Database, Workflow, Dashboard liên quan → cập nhật đồng bộ.

## 11. Regression Testing
Sau mỗi thay đổi: Build → Kiểm tra lỗi → UI → Workflow → Permission → Responsive → Performance.  
Không hoàn thành khi chưa vượt qua toàn bộ kiểm thử.

## 12. AI Review
Trước khi hoàn thành tính năng, tự đánh giá:
- Có đơn giản hơn không?
- Có ít thao tác hơn không?
- Có bị trùng chức năng không?
- Có đúng Design System không?
- Có đúng Workflow không?

## 13. Performance
Tốc độ tải nhanh, ít request, cache hợp lý, Lazy Loading, Virtual Scrolling, tối ưu Database.

## 14. Scalability
Sẵn sàng cho nhiều tổ chức, nhiều cơ sở, hàng triệu người dùng/học liệu/câu hỏi. Không thiết kế theo quy mô nhỏ.

## 15. Security
RBAC, Audit Log, Backup, Version, Encryption, Data Isolation, Multi-Tenant.

## 16. AI Driven
AI là trợ lý toàn hệ thống. Người dùng không cần biết AI hoạt động thế nào. AI tự động phân tích, gợi ý, sinh nội dung, kiểm tra, tối ưu, phát hiện lỗi, đề xuất cải tiến.

## 17. Product Thinking
Trước mỗi tính năng mới, trả lời:
- Tính năng này giải quyết vấn đề gì?
- Ai sẽ sử dụng?
- Có làm giảm số thao tác không?
- Có làm tăng hiệu quả không?
- Có thể tái sử dụng không?
- Có phù hợp với kiến trúc AvaB không?

**Nếu không trả lời được thì không triển khai.**

## 18. Final Goal
Xây dựng một **Education Operating System** hiện đại, thông minh, thống nhất, dễ sử dụng, dễ mở rộng, hiệu năng cao — triển khai được cho mọi mô hình giáo dục mà không cần thay đổi kiến trúc hoặc viết lại hệ thống.

---

## Checklist trước khi merge bất kỳ thay đổi nào

```
[ ] User First: thiết kế từ góc nhìn người dùng chưa?
[ ] One Feature One Home: có trùng với chức năng nào đã có không?
[ ] Refactor First: có thể dùng lại code/component cũ không?
[ ] Full Impact Analysis: đã kiểm tra tất cả màn hình/API bị ảnh hưởng chưa?
[ ] Consistency: đúng Design System, màu, icon, naming chưa?
[ ] Responsive: test mobile chưa?
[ ] Build clean: npx tsc --noEmit pass chưa?
[ ] Performance: có gây N+1 query không?
[ ] Security: có lọc theo organizationId/campusId chưa?
[ ] AI Review: có đơn giản hơn được không?
```
