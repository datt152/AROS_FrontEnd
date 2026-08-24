# RULE.md — Quy tắc bắt buộc cho AI khi làm việc trên project này

File này áp dụng cho mọi AI coding agent (Claude Code, Cursor, Copilot, v.v.) khi sửa/thêm code trong repo.
Nếu có mâu thuẫn giữa file này và yêu cầu tức thời của người dùng trong 1 câu lệnh ngắn, **ưu tiên file này** — trừ khi người dùng nói rõ là muốn phá lệ.

Tài liệu gốc chi tiết: xem `docs/00-INDEX.md`. File này chỉ là bản rút gọn dạng "cấm/được phép".

## 0. Các quyết định đã chốt (không được hỏi lại, không được tự đổi)

| Vấn đề | Đã chốt |
|---|---|
| CSS approach | **Tailwind CSS v4** (dùng `@tailwindcss/vite` plugin, cấu hình CSS-first bằng `@theme` trong `index.css`, KHÔNG tạo `tailwind.config.js` trừ khi có lý do rõ ràng cần custom nâng cao) |
| UI kit / component library | Chưa chốt — nếu cần Headless UI, Radix, shadcn/ui... phải hỏi trước khi thêm |
| Icon | Chưa chốt — hỏi trước khi thêm `lucide-react`/`react-icons`... |

Xem ADR-009 trong `docs/14-DECISION-LOG.md` để biết lý do.

---

## 1. Cấm tuyệt đối — không được làm dù người dùng không nhắc

- Không tự thêm thư viện mới (state manager khác, HTTP client khác, form lib khác, validation lib khác, UI kit khác, data-fetching lib khác) mà chưa hỏi và được đồng ý. Riêng CSS approach đã chốt là Tailwind CSS (xem mục 0) — không được tự ý viết CSS thuần/CSS Modules/styled-components thay thế.
- Không viết style bằng inline `style={{...}}` cho những gì Tailwind utility class đã làm được — inline style chỉ dùng cho giá trị động tính toán runtime (VD: `width` theo phần trăm tiến độ).
- Không tạo `tailwind.config.js` khi không cần thiết — Tailwind v4 cấu hình theme qua `@theme` trong CSS, không phải file JS.
- Không tự đổi kiến trúc (ví dụ: chuyển từ feature-based sang layer-based, gộp `features/` thành 1 folder chung) mà không báo trước.
- Không tạo global state (Zustand, Context...) để lưu **server data** — server data luôn thuộc TanStack Query.
- Không dùng Redux "cho tiện".
- Không di chuyển code feature vào folder generic chỉ để giảm độ lồng thư mục.
- Không tạo abstraction/wrapper chỉ vì "nhìn chuyên nghiệp hơn" khi chưa có nhu cầu thực tế.
- Không sửa code không liên quan đến task đang làm ("rewrite unrelated code").
- Không tự đổi API contract của backend nếu không được yêu cầu rõ ràng.
- Không làm yếu kiểu TypeScript (`any`, `as unknown as`, tắt strict...) chỉ để hết lỗi type-check.
- Không bypass authentication/security check để "cho chạy được trước".
- Không lưu secret (API key, token bí mật...) trong source code.
- Không coi việc ẩn UI/route ở frontend là kiểm soát bảo mật thật — backend luôn là nơi quyết định authorization.
- Không tạo lại (duplicate) component/hook/util đã có sẵn nếu không thật sự cần thiết.
- Không tự tính điểm thi (grading) ở frontend làm kết quả chính thức — backend luôn là nguồn chấm điểm cuối cùng. Frontend chỉ được preview UI nếu được yêu cầu rõ.
- Không tự implement thuật toán nhận diện/chấm OMR ở frontend — đó là việc của backend/OMR service. Frontend chỉ lo: chọn ảnh, upload, hiển thị trạng thái xử lý, hiển thị kết quả.
- Không dùng lọc dữ liệu phía client (client-side filtering) để thay thế cho phân quyền của backend.
- Không tạo access token dạng lưu lâu dài trong `localStorage`/`sessionStorage`. Access token chỉ giữ trong memory (state của app), refresh token do backend quản lý qua cookie HttpOnly.
- Không tạo folder rỗng "cho đủ bộ" — chỉ tạo `api/ hooks/ components/ schemas/ types/` bên trong 1 feature khi thực sự có file để bỏ vào.

## 2. Kỷ luật phạm vi (Scope discipline)

Task luôn thuộc đúng 1 trong 2 loại sau — AI phải xác định loại trước khi code, và nếu không rõ thì **hỏi**, không tự suy diễn loại rộng hơn:

### Loại A — "Chỉ làm UI" / "thiết kế giao diện" / "làm mockup"
Chỉ được tạo/sửa:
- Component trình bày (presentational) trong `features/<feature>/components/` hoặc trực tiếp trong `pages/` nếu chưa có component tách riêng.
- Style bằng Tailwind utility classes.
- State cục bộ thuần UI (show/hide password, tab đang active, checkbox...) bằng `useState`.
- Dữ liệu giả (mock/placeholder) để hiển thị được giao diện.

Tuyệt đối KHÔNG được tự ý làm thêm dù "tiện thể":
- Không viết `api/*.ts`, không gọi `axios`, không tạo `useMutation`/`useQuery`.
- Không đụng vào `stores/auth.store.ts` hay bất kỳ store nào.
- Không tạo/sửa `schemas/*.ts` (Zod) trừ khi task nói rõ cần validate thật.
- Không đụng vào `routes/` (route guard, redirect sau login...).
- Không tự thêm logic đăng nhập/đăng xuất thật.

### Loại B — "Làm chức năng đăng nhập/đăng xuất" / "implement feature auth"
Được làm toàn bộ: `api/ hooks/ schemas/ components/ pages/` theo đúng vị trí ở mục 5, NHƯNG vẫn phải tuân thủ mục 1 (không thêm dependency, không tự chấm điểm...) và mục 3 (phải hỏi trước các điểm chưa rõ).

**Nếu prompt không ghi rõ Loại A hay B → AI phải hỏi lại 1 câu để xác nhận, không tự chọn loại rộng hơn "cho chắc".**

## 3. Danh sách bắt buộc phải hỏi trước khi tự quyết

Đây là những điểm KHÔNG có "mặc định hợp lý" — nếu chưa được quy định trong RULE.md/docs/prompt, AI phải dừng lại hỏi, không được tự bịa rồi làm:

- Cách hiển thị lỗi: toast góc màn hình / banner đầu form / inline dưới từng field / kết hợp? (Chưa chốt cách nào — đang là điểm hở.)
- Có dùng thư viện toast không (VD: `sonner`, `react-hot-toast`) hay tự viết component? → đây là thêm dependency, phải hỏi theo mục 1.
- Hành vi khi submit thất bại: có giữ nguyên input đã gõ không? Có clear ô password không? Focus vào field nào?
- Wording cụ thể (label, placeholder, câu thông báo lỗi/thành công) nếu chưa có sẵn — nếu không hỏi được ngay thì phải note rõ đây là text tạm (`// TODO: copy`) chứ không được coi là final.
- Tên file/tên component mới khi không khớp pattern đã có sẵn trong `docs/04-FOLDER-STRUCTURE.md`.
- Điều hướng sau khi hành động thành công (đăng nhập xong về đâu, đăng ký xong về đâu, đăng xuất xong về đâu).
- Bất kỳ animation/transition nào ngoài phạm vi Tailwind mặc định.

Nếu 1 quyết định nhỏ không đáng dừng lại hỏi (ví dụ: đặt tên biến), AI được tự quyết nhưng **phải nêu rõ giả định đã dùng** trong phần báo cáo cuối task (mục 9).

## 4. Phải dừng lại và hỏi người dùng trước khi tiếp tục nếu

- API contract chưa rõ ràng (thiếu field, thiếu status code, thiếu response shape...).
- Business rule chưa rõ ràng (ví dụ: học sinh có được sửa đáp án sau khi nộp không?).
- Hành vi authentication/security chưa rõ ràng.
- Task yêu cầu thêm 1 dependency mới.
- Task yêu cầu đổi kiến trúc hiện tại.
- Code hiện tại có 2 pattern khác nhau cho cùng 1 việc mà không rõ lý do.

Khi hỏi, chỉ hỏi **1 câu trọng tâm**, không hỏi tràn lan; các chi tiết nhỏ khác cứ theo pattern có sẵn trong repo mà làm.

## 5. Ranh giới thư mục — đặt sai chỗ là sai

| Thư mục | Được chứa | Cấm chứa |
|---|---|---|
| `app/` | bootstrap app, providers | business logic của feature |
| `routes/` | route table, `ProtectedRoute`, `RoleRoute` | gọi API, business logic phức tạp |
| `layouts/` | khung trang (sidebar, header, outlet) | API workflow riêng của 1 feature |
| `components/ui/` | primitive thuần (Button, Input, Modal, Toast...) | bất cứ thứ gì biết tên miền nghiệp vụ (VD: `ExamCard`) |
| `components/common/` | component chung không phải primitive (PageHeader, ErrorBoundary...) | `QuestionTable`, `ExamForm` (phải nằm trong `features/`) |
| `features/<tên>/` | toàn bộ code nghiệp vụ của domain đó | code của feature khác |
| `lib/` | tích hợp hạ tầng (axios instance, queryClient...) | import ngược từ `features/` |
| `stores/` | client state **thật sự** cần share xa (hiện tại: auth session) | server state |
| `types/` | type dùng chung ≥ 2 feature | type riêng của 1 feature |
| `utils/` | hàm thuần, không phụ thuộc domain | hàm có domain logic |
| `constants/` | hằng số toàn cục | hằng số riêng của 1 feature |

Quy tắc import:
- ✅ `feature → lib`, `feature → components/ui`, `feature → types dùng chung`
- ❌ `feature A → file nội bộ của feature B`, `components/ui → feature`, `lib → feature`, `utils → feature`

Nếu 1 component trong `components/ui` bắt đầu biết đến khái niệm nghiệp vụ → nó không còn là UI component thuần, phải chuyển vào `features/`.

## 6. Bắt buộc dùng đúng công cụ cho đúng loại state/logic

- Server data (dữ liệu từ API) → **TanStack Query**, không lưu vào state cục bộ hay Zustand.
- UI/local state (mở/đóng modal, tab đang chọn...) → **React state** (`useState`).
- Client state cần share giữa nhiều component xa nhau, có lý do chính đáng → **Zustand** (chỉ dùng khi thực sự cần, không mặc định).
- Form phức tạp (có validate nhiều field) → **React Hook Form + Zod**.
- Gọi API → luôn qua **1 instance Axios duy nhất** ở `src/lib/axios.ts`, không tạo instance khác trong feature.

## 7. Trước khi bắt tay code (quy trình bắt buộc)

1. Đọc `docs/00-INDEX.md` và `docs/02-ARCHITECTURE.md`.
2. Đọc tài liệu liên quan đến task (business rules / API / state / auth / forms / testing).
3. Tìm code hiện có tương tự (feature tương tự, hook tương tự, schema tương tự) — ưu tiên tái sử dụng pattern có sẵn hơn là tạo mới.
4. Chọn thay đổi nhỏ nhất có thể, ưu tiên "mở rộng pattern cũ" hơn "tạo abstraction/kiến trúc mới".

## 8. Sau khi code xong, coi là "Done" chỉ khi

- Chạy được, đúng hành vi mong muốn.
- `tsc` không lỗi.
- Lint sạch (nếu project có cấu hình lint).
- Test liên quan (nếu có) pass.
- Hành vi API đúng với contract đã thống nhất.
- State được lưu đúng chỗ (server/client/UI) theo bảng ở mục 6.
- Ranh giới kiến trúc ở mục 5 không bị phá vỡ.
- Không có dependency mới nào được thêm ngoài ý muốn.
- Nếu có thay đổi business rule / kiến trúc → đã cập nhật lại tài liệu trong `docs/`.

## 9. Sau mỗi task, AI phải báo cáo ngắn gọn

- **Đã đổi gì**: file/feature nào bị ảnh hưởng.
- **Vì sao**: lý do kiến trúc/nghiệp vụ.
- **API**: endpoint nào dùng/đổi.
- **State**: quyết định state loại nào, để ở đâu.
- **Validation**: schema nào thay đổi.
- **Test**: đã chạy check gì, kết quả.
- **Rủi ro**: giả định nào chưa chắc chắn, việc gì còn tồn đọng.
