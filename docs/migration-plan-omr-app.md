# Migration Plan — TracNghiem OMR App
### Từ `trac-nghiem-omr-app` (React 19 + Vite + Tailwind, kiến trúc theo trang) sang kiến trúc mới (React + TypeScript + Tailwind, feature-based, TanStack Query)

> Vai trò: Senior Frontend Architect / UI Migration Specialist.
> Trạng thái: **PHÂN TÍCH XONG — CHƯA CODE.** Tài liệu này là kế hoạch để bạn review. Sau khi bạn duyệt, tôi mới bắt đầu implementation theo từng phase.

---

## Số liệu nhanh

| Mục | Số lượng |
|---|---|
| Routes | 30 (3 public, 11 sinh viên, 8 giảng viên, 8 admin) |
| Page files | 30 (1 file / route, mapping 1:1, khá sạch) |
| Tổng dòng code `pages/` | ~9.785 dòng |
| Shared components | 8 (`components/`) |
| Layout components | 4 (`layout/`) |
| Services | 3 (`api.ts`, `authService.ts`, `practiceService.ts`) |
| State management library | Không có (chỉ 1 Context cho Auth) |
| File lớn nhất | `TaoKyThi.tsx` — 1002 dòng, 25+ `useState` |

---

## 1. Current Architecture Analysis

Project cũ là **kiến trúc theo trang** (page-based), không phải feature-based:

```
src/
├── App.tsx                # AuthProvider + AppRouter + ToastContainer
├── routers/AppRouter.tsx  # toàn bộ route định nghĩa 1 chỗ, lazy-load
├── contexts/AuthContext.tsx
├── hooks/useAuth.tsx
├── layout/                # DashboardLayout, Header, Sidebar, Footer
├── components/            # modal + alert dùng chung (8 file)
├── services/               # api.ts (axios), authService.ts, practiceService.ts
└── pages/
    ├── admin/      (8 trang)
    ├── giangvien/  (8 trang)
    ├── sinhvien/   (11 trang)
    └── auth/       (1 trang)
```

**Đặc điểm quan trọng:**

- Routing tập trung, rõ ràng, lazy-load theo route — **đây là điểm mạnh nhất của project cũ.**
- Không có Redux/Zustand/Recoil. Toàn bộ server-state (danh sách câu hỏi, kỳ thi, tài khoản...) được fetch trực tiếp trong từng page bằng `useState` + `useEffect`, không có cache, không có dedup request, không có global state layer.
- `services/api.ts` là một axios instance được thiết kế khá tốt: tự gắn Bearer token, tự xử lý 401/403 → redirect login, tự đọc `x-session-token` để refresh token âm thầm, tự chuẩn hóa lỗi qua `getApiErrorMessage`. Đây là tài sản kỹ thuật (không chỉ UI) đáng giữ lại.
- **Nhưng axios instance này không được dùng thống nhất.** 8/8 trang trong `pages/admin/` (Dashboard, QuanLyMonHoc, ThemMonHoc, SuaMonHoc, QuanLyTaiKhoan, TaoTaiKhoan, SuaTaiKhoan, QuanLyHeThong) gọi thẳng `fetch("http://localhost:5000/api/...")` — bỏ qua hoàn toàn axios interceptor. Hệ quả: **các request admin không gắn Authorization header**, không xử lý 401 thống nhất, và URL bị hard-code localhost nên sẽ gãy khi deploy production. Đây là vấn đề nghiêm trọng nhất tìm được trong toàn bộ codebase (xem thêm mục 10 — Risk Analysis).
- Mỗi page tự `import DashboardLayout` và tự truyền `role="ADMIN" | "SINH VIÊN" | "GIẢNG VIÊN"` dưới dạng chuỗi tiếng Việt viết tay (40 chỗ gọi, xuất hiện ở gần như mọi file, kể cả lặp lại 2-3 lần trong cùng file cho các nhánh loading/error/success). Một chỗ (`TaoKyThi.tsx` dòng 551) còn bị encode khác biệt (`role={"GI\u1ea2NG VI\u00caN"}`) — dấu hiệu nhiều người cùng sửa code với tooling khác nhau (git log xác nhận có nhánh `Nhi` và `Kiet` merge vào nhau).
- Không có type dùng chung: mỗi page tự định nghĩa lại interface riêng cho cùng một entity (`ExamItem`, `ExamApi`, `ClassItem`, `QuestionApi`... xuất hiện lặp lại ở `TaoKyThi.tsx`, `ChamBai.tsx`, `UploadOMR.tsx`, `NganHangCauHoi.tsx` với field gần như giống hệt nhau).
- Business logic (parse Excel, transform DTO ↔ view model, tính toán thống kê) nằm thẳng trong component, có nơi rất nặng: hàm parse Excel trong `NganHangCauHoi.tsx` (chuẩn hóa header tiếng Việt có dấu/không dấu, map độ khó, validate từng dòng) dài hơn 100 dòng, nằm chung file với JSX.
- Logic xuất Excel (`XLSX.writeFile`) bị lặp lại độc lập ở 3 nơi khác nhau (`NganHangCauHoi.tsx`, `ChamBai.tsx`, `ThongKeDiemThi.tsx`) — cùng một nghiệp vụ, viết 3 lần.
- `AddQuestionModal.tsx` và `EditQuestionModal.tsx` giống nhau ~90% (so diff xác nhận: chỉ khác state khởi tạo, label nút và 1 khối info hiển thị) — chưa được rút gọn thành 1 component với `mode="add" | "edit"`.
- Không có test, không có Storybook, không có design token trong `tailwind.config.js` (file chỉ có `content` path, `theme.extend` rỗng) — mọi màu sắc/gradient được viết tay lặp lại (riêng cụm `from-indigo-600 to-cyan-500` xuất hiện 21 lần rải rác).
- Chỉ thiết kế cho Web: không có breakpoint responsive nào đáng kể được kiểm tra chủ động (sidebar 64px cố định `w-64`, không có hành vi collapse/drawer cho mobile).

**Kết luận:** Kiến trúc cũ không tệ về mặt routing và có vài mảnh nền tảng tốt (axios instance, AuthContext, `practiceService.ts`), nhưng phần lớn UI được viết theo kiểu "component tự lo hết" (fetch + transform + render trong cùng 1 file), không có ranh giới feature, không có cache layer, và có 1 lỗ hổng kiến trúc thực sự (admin module không qua axios) cần xử lý sớm chứ không chỉ là "dọn code cho đẹp".

---

## 2. UI Inventory

### Routes (đầy đủ 30 route)

| Route | Page | Role | Data deps |
|---|---|---|---|
| `/` | RoleRedirect | public | AuthContext |
| `/login` | Login | public | authService |
| `/unauthorized` | Unauthorized | public | — |
| `/sinhvien/dashboard` | Dashboard | sinhvien | api (nhiều endpoint tổng hợp) |
| `/sinhvien/ky-thi` | DanhSachKyThi | sinhvien | api |
| `/sinhvien/ky-thi/:subjectId` | DanhSachBaiThi | sinhvien | api |
| `/sinhvien/ketqua` | KetQuaThi | sinhvien | nhận qua `location.state`, không gọi API |
| `/sinhvien/lam-bai/:examId` | LamBaiThi | sinhvien | api |
| `/sinhvien/lich-su` | LichSuLamBai | sinhvien | api |
| `/sinhvien/luyen-tap` | LuyenTap | sinhvien | api |
| `/sinhvien/chitiet-baithi/:id` | ChiTietBaiThi | sinhvien | api |
| `/sinhvien/luyen-tap/:subjectId` | DanhSachBaiLuyenTap | sinhvien | api |
| `/sinhvien/luyen-tap/lam-bai/:practiceId` | LamBaiLuyenTap | sinhvien | practiceService |
| `/sinhvien/ketqua-luyen-tap` | KetQuaLuyenTap | sinhvien | nhận qua `location.state` |
| `/giangvien/dashboard` | Dashboard | giangvien | api |
| `/giangvien/tao-ky-thi` | TaoKyThi | giangvien | api (3 entity: classes, exams, question-bank) |
| `/giangvien/cham-bai` | ChamBai | giangvien | api + XLSX export |
| `/giangvien/ngan-hang-cau-hoi` | NganHangCauHoi | giangvien | api + XLSX import/export |
| `/giangvien/omr-upload` | UploadOMR | giangvien | api (upload multipart) |
| `/giangvien/tao-bai-luyen-tap` | TaoBaiLuyenTap | giangvien | api |
| `/giangvien/thong-ke-diem-thi` | ThongKeDiemThi | giangvien | api + recharts |
| `/giangvien/lich-su-lam-bai` | LichSuLamBai | giangvien | api |
| `/admin/dashboard` | Dashboard | admin | **raw `fetch`, hard-coded localhost** |
| `/admin/system` | QuanLyHeThong | admin | **raw `fetch`** |
| `/admin/subjects` | QuanLyMonHoc | admin | **raw `fetch`** |
| `/admin/subjects/create` | ThemMonHoc | admin | **raw `fetch`** |
| `/admin/subjects/edit/:id` | SuaMonHoc | admin | **raw `fetch`** |
| `/admin/accounts` | QuanLyTaiKhoan | admin | **raw `fetch`** |
| `/admin/accounts/create` | TaoTaiKhoan | admin | **raw `fetch`** |
| `/admin/accounts/edit/:id` | SuaTaiKhoan | admin | **raw `fetch`** |

Tất cả (trừ 3 route public) đều bọc trong `DashboardLayout` → `PrivateRoute allowedRoles=[...]` theo từng nhóm 3 role, khớp với `Sidebar`'s `menuByRole`.

### Pages theo nhóm chức năng

- **Auth**: Login, RoleRedirect, Unauthorized (+ 2 modal: ForgotPassword, ChangePassword)
- **Question Bank**: NganHangCauHoi (+ AddQuestionModal, EditQuestionModal)
- **Exam (kỳ thi)**: TaoKyThi (tạo/sửa/xóa/tải đề), ChamBai (chấm + xem chi tiết), UploadOMR
- **Practice (luyện tập)**: TaoBaiLuyenTap, LuyenTap, DanhSachBaiLuyenTap, LamBaiLuyenTap, KetQuaLuyenTap
- **Student exam-taking**: DanhSachKyThi, DanhSachBaiThi, LamBaiThi, KetQuaThi, ChiTietBaiThi, LichSuLamBai (sinhvien)
- **Statistics/History**: ThongKeDiemThi, LichSuLamBai (giangvien)
- **Subject management**: QuanLyMonHoc, ThemMonHoc, SuaMonHoc (admin)
- **Account management**: QuanLyTaiKhoan, TaoTaiKhoan, SuaTaiKhoan (admin)
- **System settings**: QuanLyHeThong (admin)
- **Dashboard** (3 bản riêng: admin, giangvien, sinhvien — không share component thống kê nào)
- **Common**: DashboardLayout, Header, Sidebar, Footer, AlertMessage, ModalErrorAlert, GuideChatWidget

### Components

| Component | Loại | Ghi chú |
|---|---|---|
| DashboardLayout, Header, Sidebar, Footer | Layout | Tốt, cần tách role-mapping ra khỏi từng page |
| PrivateRoute | Navigation guard | Nhỏ gọn, giữ được concept |
| AddQuestionModal / EditQuestionModal | Form modal | Trùng lặp ~90%, cần gộp |
| ChangePasswordModal / ForgotPasswordModal | Form modal | UI/UX tốt (đếm ngược 60s, khóa scroll nền) |
| AlertMessage / ModalErrorAlert | Feedback UI | Nhỏ, tái dùng tốt |
| GuideChatWidget | Widget | Chatbot FAQ tĩnh (không gọi AI API, search nội dung local) — nội dung hướng dẫn nên tách khỏi component logic |

---

## 3. Migration Classification

| Old Code | Category | Reason | Migration Strategy |
|---|---|---|---|
| `services/api.ts` | **A. REUSE DIRECTLY** | Axios instance + interceptor (token, 401/403, error normalize) thiết kế tốt, framework-agnostic | Copy gần như nguyên bản vào `shared/api/` |
| `layout/Footer.tsx` | **A. REUSE DIRECTLY** | 11 dòng, không phụ thuộc gì | Copy nguyên |
| `AlertMessage.tsx`, `ModalErrorAlert.tsx` | **A. REUSE DIRECTLY** | Component thuần UI, không business logic | Copy vào `shared/ui/`, gõ lại type props |
| `RoleRedirect.tsx`, `Unauthorized.tsx` | **A. REUSE DIRECTLY** | Logic đơn giản, không coupling | Copy, chỉnh theo route-config mới |
| Nội dung hướng dẫn trong `GuideChatWidget.tsx` | **A. REUSE DIRECTLY** (nội dung) | Nội dung FAQ có giá trị, không đổi | Tách sang `content/guides.ts`, giữ nguyên text |
| `contexts/AuthContext.tsx`, `hooks/useAuth.tsx` | **B. REUSE + REFACTOR** | Concept đúng (session timeout, idle logout, sync giữa tab) nhưng tự quản lý cache "account" thủ công — nên để TanStack Query lo phần cache/refetch | Giữ Context cho *identity* hiện tại, chuyển `getMe()` thành query, giữ nguyên idle-timeout logic (đây là logic riêng, không phải server-state) |
| `authService.ts` | **B. REUSE + REFACTOR** | API call rõ ràng, tách tốt — chỉ cần bọc lại bằng hooks | Giữ hàm, thêm lớp `useLoginMutation`, `useChangePasswordMutation` |
| `practiceService.ts` | **B. REUSE + REFACTOR** | Đã tách API ra khỏi component từ trước — hình mẫu tốt nhất trong repo | Chuyển trực tiếp thành TanStack Query hooks, gần như không đổi field |
| Login, ForgotPasswordModal, ChangePasswordModal (UI) | **B. REUSE + REFACTOR** | UI/UX hoàn chỉnh, chỉ cần đổi cách gọi API | Giữ JSX gần như nguyên, thay `useState` gọi trực tiếp bằng mutation hook |
| Header, Sidebar, DashboardLayout | **B. REUSE + REFACTOR** | UI tốt nhưng role truyền bằng chuỗi tay, `menuByRole` hard-code | Giữ giao diện, đổi role sang enum dùng chung, chuyển `menuByRole` thành config theo feature |
| AddQuestionModal + EditQuestionModal | **B. REUSE + REFACTOR** | Trùng lặp cao | Gộp thành `QuestionFormModal` với prop `mode` |
| NganHangCauHoi.tsx (UI bảng, filter, tab Excel) | **B. REUSE + REFACTOR** | UI/UX đầy đủ (search, filter chương/độ khó, import Excel có validate dòng lỗi) | Giữ UI, tách `loadQuestions`/CRUD → query hooks, tách parser Excel → `question-import.util.ts` |
| ChamBai.tsx (UI bảng điểm, modal chi tiết) | **B. REUSE + REFACTOR** | UI đầy đủ, nhưng 1 file gánh quá nhiều state fetch | Giữ UI thành nhiều component nhỏ (SubmissionTable, SubmissionDetailModal), tách fetch → hooks |
| UploadOMR.tsx | **B. REUSE + REFACTOR** | UI upload rõ ràng, ít state | Giữ UI, chuyển upload → mutation hook |
| ThongKeDiemThi.tsx, LichSuLamBai.tsx (2 bản) | **B. REUSE + REFACTOR** | UI biểu đồ (recharts) và bảng tốt | Giữ UI chart, tách data-fetch → hooks, gộp logic xuất Excel dùng chung |
| DanhSachKyThi, DanhSachBaiThi, ChiTietBaiThi, KetQuaThi, KetQuaLuyenTap, DanhSachBaiLuyenTap (sinh viên) | **B. REUSE + REFACTOR** | UI trình bày kỳ thi/kết quả rõ ràng, ít logic phức tạp | Giữ UI, tách fetch → hooks trong feature `exams`/`practice` |
| **TaoKyThi.tsx** | **C. REBUILD dùng UI cũ làm reference** | 1002 dòng, 25+ `useState` gộp chung: list kỳ thi + wizard tạo/sửa + fetch 3 entity (lớp, kỳ thi, ngân hàng câu hỏi) + tải blob đề/phiếu trong cùng 1 component | Dựng lại thành `ExamListPage` + `ExamWizard` (nhiều bước) + hooks riêng từng entity. UI cũ dùng làm bản vẽ tay cho từng field/luồng (tự động sinh đề theo chương+độ khó / chọn thủ công / trộn câu-đáp án) |
| **TaoBaiLuyenTap.tsx** | **C. REBUILD dùng UI cũ làm reference** | 795 dòng — gần như bản sao độ phức tạp của TaoKyThi cho luyện tập | Dựng lại, cố gắng **dùng chung wizard component** với `exams` (2 luồng "tạo bài kiểm tra" rất giống nhau, hiện đang viết 2 lần độc lập) |
| **LamBaiThi.tsx** + **LamBaiLuyenTap.tsx** | **C. REBUILD dùng UI cũ làm reference** | 2 màn hình làm bài (452 + 411 dòng) trùng lặp gần hết logic: timer, flag câu hỏi, điều hướng câu, submit — hiện viết riêng 2 lần cho "thi" và "luyện tập" | Dựng lại thành 1 `ExamRunner` dùng chung (component + `useExamSession` hook), tham số hoá theo `mode: "exam" \| "practice"`. UI cũ (giao diện câu hỏi, thanh điều hướng, flag, đồng hồ đếm ngược) là reference UX chính |
| 8 file `pages/admin/*.tsx` — **phần data layer** (raw `fetch("http://localhost:5000/...")`) | **D. DO NOT REUSE** | Không qua axios interceptor → thiếu Authorization header, hard-code localhost, không xử lý 401 thống nhất, mỗi file tự định nghĩa lại base URL | Xóa toàn bộ đoạn `fetch(...)`, viết lại bằng `shared/api` + query hooks. **UI (bảng, form, modal xác nhận) của các trang admin vẫn thuộc nhóm B** — chỉ phần gọi API là D |
| `dist/`, `vite-dev.log`, `vite-dev.err.log`, `sql/` (rỗng) | **D. DO NOT REUSE** | Build artifact / log / thư mục rỗng, đã có trong `.gitignore` nhưng lọt vào bản nén | Không copy sang project mới |

---

## 4. Proposed New Architecture

Tôi **không dùng nguyên cấu trúc `legacy-ui/` đầy đủ** mà bạn gợi ý trong ví dụ. Lý do: project chỉ có một nguồn UI cũ duy nhất (không phải hợp nhất nhiều hệ thống legacy), quy mô ~30 trang — một cây `legacy-ui/pages + components + layouts + references` đầy đủ sẽ tạo thêm một tầng thư mục phải bảo trì mà không tương xứng với lợi ích. Thay vào đó tôi đề xuất một khu vực tạm **`_staging/`** (không phải cấu trúc con nested), tồn tại rõ ràng chỉ trong giai đoạn di chuyển và bị xóa ở Phase cuối, thay vì mô phỏng lại "project cũ trong project mới".

Cấu trúc đề xuất — **feature-based**, vì project có ranh giới nghiệp vụ rõ (question-bank, exams, practice, omr, statistics, accounts...) và feature-based là kiểu dễ chia sẻ logic sang React Native nhất (mỗi feature tách riêng `api/hooks/types` không phụ thuộc DOM):

```
src/
├── app/
│   ├── router/
│   │   ├── AppRouter.tsx
│   │   ├── routes.config.ts        # path constants + role-map, nguồn sự thật duy nhất
│   │   └── ProtectedRoute.tsx      # thay PrivateRoute, đọc role từ routes.config
│   ├── providers/
│   │   ├── AppProviders.tsx        # gộp QueryClientProvider + AuthProvider + ToastContainer
│   │   └── query-client.ts
│   └── layouts/
│       ├── DashboardLayout.tsx     # nhận role qua route context, KHÔNG nhận qua prop tay nữa
│       └── AuthLayout.tsx
│
├── pages/                          # route-level, MỎNG — chỉ compose feature components
│   ├── admin/
│   ├── teacher/
│   ├── student/
│   └── auth/
│
├── features/
│   ├── auth/                       # login, forgot/change password, session
│   ├── question-bank/              # NganHangCauHoi + 2 modal gộp lại
│   ├── exams/
│   │   ├── creation/                # TaoKyThi rebuild
│   │   ├── taking/                  # ExamRunner dùng chung với practice
│   │   └── grading/                 # ChamBai
│   ├── practice/                   # TaoBaiLuyenTap, LuyenTap... (dùng chung taking/ với exams)
│   ├── omr/                        # UploadOMR
│   ├── statistics/                 # ThongKeDiemThi + LichSuLamBai (2 bản)
│   ├── subjects/                   # admin: QuanLyMonHoc, Them/SuaMonHoc
│   ├── accounts/                   # admin: QuanLyTaiKhoan, Tao/SuaTaiKhoan
│   └── system-settings/            # admin: QuanLyHeThong
│       (mỗi feature: api/ hooks/ components/ types/ utils/)
│
├── widgets/                        # UI dùng chung xuyên feature, KHÔNG chứa business logic
│   ├── layout/                     # Header, Sidebar, Footer
│   ├── ui/                         # AlertMessage, ModalErrorAlert, Table, EmptyState, LoadingState
│   └── guide-chat/                 # GuideChatWidget + content/guides.ts
│
├── shared/                         # cross-cutting, ưu tiên framework-agnostic (chia sẻ RN sau này)
│   ├── api/                        # axios instance (từ api.ts cũ) + error normalizer
│   ├── query/                      # queryClient config + query-key factory
│   ├── types/                      # Role enum, Account, PaginatedResponse...
│   ├── utils/                      # excel.util.ts (dùng chung 3 nơi), date.util.ts
│   └── constants/
│
├── _staging/                       # CHỈ tồn tại trong quá trình migrate — xem Phase 3 & Phase 10
│   └── MIGRATION_CHECKLIST.md
│
├── App.tsx
└── main.tsx
```

**Vì sao không dùng `legacy-ui/` kiểu ví dụ:** mục tiêu của bạn là "không trở thành project cũ nằm trong project mới". Một thư mục `legacy-ui` tồn tại lâu dài rất dễ trở thành nơi code cũ "ở luôn" vì không ai bị ép phải dọn nó. `_staging/` với 1 file checklist buộc phải rỗng ở cuối Phase 10 tạo áp lực dọn dẹp rõ ràng hơn, đồng thời tránh nhân bản cấu trúc `pages/components/layouts` một lần nữa bên trong chính nó.

---

## 5. Migration Mapping (ví dụ đại diện từng nhóm)

| Old | New |
|---|---|
| `src/services/api.ts` | `src/shared/api/client.ts` |
| `src/services/authService.ts` | `src/features/auth/api/auth.api.ts` |
| `src/services/practiceService.ts` | `src/features/practice/api/practice.api.ts` (chia hàm thành theo hooks tương ứng) |
| `src/contexts/AuthContext.tsx` + `hooks/useAuth.tsx` | `src/features/auth/store/AuthProvider.tsx` + `src/features/auth/hooks/useAuth.ts` |
| `src/layout/Sidebar.tsx` (`menuByRole` hard-code) | `src/widgets/layout/Sidebar.tsx` (đọc menu từ `app/router/routes.config.ts`) |
| `src/pages/giangvien/NganHangCauHoi.tsx` | `src/pages/teacher/QuestionBankPage.tsx` (compose) + `src/features/question-bank/components/QuestionTable.tsx` + `.../hooks/useQuestions.ts` + `.../utils/question-import.util.ts` |
| `src/components/AddQuestionModal.tsx` + `EditQuestionModal.tsx` | `src/features/question-bank/components/QuestionFormModal.tsx` (prop `mode: "create" \| "edit"`) |
| `src/pages/giangvien/TaoKyThi.tsx` | `src/pages/teacher/ExamListPage.tsx` + `src/features/exams/creation/ExamWizard.tsx` + `.../hooks/useExams.ts`, `useClasses.ts`, `useCreateExamMutation.ts` |
| `src/pages/sinhvien/LamBaiThi.tsx` + `src/pages/sinhvien/LamBaiLuyenTap.tsx` | `src/features/exams/taking/ExamRunner.tsx` (dùng chung) + `src/pages/student/ExamTakingPage.tsx` / `PracticeTakingPage.tsx` (2 page mỏng, cùng render `ExamRunner`) |
| `src/pages/giangvien/ChamBai.tsx` | `src/pages/teacher/GradingPage.tsx` + `src/features/exams/grading/SubmissionTable.tsx` + `SubmissionDetailModal.tsx` |
| `src/pages/admin/QuanLyMonHoc.tsx` (+ 2 file `fetch` khác) | `src/pages/admin/SubjectsPage.tsx` + `src/features/subjects/api/subjects.api.ts` (dùng `shared/api/client`, **không còn `fetch()` tay**) |
| XLSX export lặp lại (3 nơi) | `src/shared/utils/excel.util.ts` (1 hàm `exportToExcel(rows, filename)` dùng chung) |
| `src/components/GuideChatWidget.tsx` | `src/widgets/guide-chat/GuideChatWidget.tsx` + `src/widgets/guide-chat/content/guides.ts` |

---

## 6. Data Architecture

### Đánh giá TanStack Query vs RTK Query

| Tiêu chí | Nhận định cho project này |
|---|---|
| Global client-state hiện có | **Không có** (không Redux, chỉ 1 Context cho auth) → không có lý do kéo theo cả hệ sinh thái Redux chỉ để lấy caching |
| Kích thước team | Nhỏ (git log cho thấy vài người đóng góp) → ưu tiên ít boilerplate |
| React Native trong tương lai | TanStack Query chạy y hệt trên RN (cùng API), không cần Redux Provider lồng thêm |
| Optimistic update | Cả 2 đều hỗ trợ tốt; TanStack Query cú pháp `onMutate`/`onError` ngắn gọn hơn cho case đơn giản như CRUD câu hỏi, đổi trạng thái chấm bài |
| Cache theo entity phức tạp (normalized cache) | Không cần thiết ở quy mô này — dữ liệu chủ yếu là list/detail độc lập theo feature (câu hỏi, kỳ thi, tài khoản), không có quan hệ lồng sâu cần normalize kiểu Redux Toolkit Entity Adapter |
| Pagination/prefetch | TanStack Query có `useInfiniteQuery`/`prefetchQuery` sẵn, phù hợp cho danh sách câu hỏi/tài khoản hiện **chưa phân trang** (rủi ro hiệu năng khi ngân hàng câu hỏi lớn — xem Risk) |

**→ Khuyến nghị: TanStack Query** cho toàn bộ server-state. Không cần thêm Redux/Zustand ở giai đoạn này. Local/UI state (form wizard, câu hỏi đang chọn khi làm bài, trạng thái mở modal) tiếp tục dùng `useState`/custom hook như cách `practiceService.ts` + các trang luyện tập đã làm — đó là pattern đúng, chỉ cần nhân rộng.

> Ghi chú mở: nếu sau này `ExamRunner` cần lưu tạm câu trả lời để chống mất dữ liệu khi mất mạng (offline-first cho phòng thi), lúc đó mới cân nhắc thêm state persist (Zustand + middleware persist) — chưa cần cho phase hiện tại.

### Lớp dữ liệu

```
Component (widgets/pages)
   ↑ dùng
Feature hooks (useQuestions, useCreateExamMutation...)
   ↑ gọi
Feature api (question-bank.api.ts — hàm thuần, nhận/trả DTO)
   ↑ dùng
shared/api/client.ts (axios instance, kế thừa gần nguyên từ api.ts cũ)
   ↑ gọi
Backend
```

Quy tắc bắt buộc: **không component nào được gọi `axios`/`fetch` trực tiếp** — đây chính là lỗi đang tồn tại ở 8 trang admin, phải chặn lại bằng convention + (khuyến nghị) 1 ESLint rule cấm import `axios`/`fetch` ngoài thư mục `*/api/`.

Query key factory tập trung theo feature, ví dụ:
```ts
export const questionKeys = {
  all: ['questions'] as const,
  list: (filters: QuestionFilters) => [...questionKeys.all, 'list', filters] as const,
  detail: (id: number) => [...questionKeys.all, 'detail', id] as const,
}
```

Mutation invalidate theo key thay vì gọi lại `loadQuestions()` thủ công như code cũ (`NganHangCauHoi.tsx` hiện gọi `await loadQuestions()` sau mỗi create/update/delete — TanStack Query thay bằng `queryClient.invalidateQueries({ queryKey: questionKeys.all })`).

---

## 7. Routing Architecture

**Giữ nguyên toàn bộ URL path** — không có lý do đổi (không ảnh hưởng SEO ở app nội bộ, nhưng đổi path phá vỡ bookmark/thói quen người dùng nội bộ mà không có lợi ích tương xứng). Giữ `react-router-dom` (đã v7, ổn định cho web; khi làm React Native sẽ dùng `react-navigation` riêng — chỉ path *constants* và role-map trong `shared/`/`app/router/routes.config.ts` là phần chia sẻ được, không phải chính router).

**Thay đổi kiến trúc:**

1. Gộp `routes.config.ts` làm nguồn sự thật duy nhất cho: path, role được phép, và menu sidebar — thay vì hiện tại bị định nghĩa rời rạc ở 3 chỗ (`AppRouter.tsx`, `Sidebar.tsx`'s `menuByRole`, và chuỗi `role="..."` viết tay trong từng page).
2. Đưa `DashboardLayout` lên làm **layout route lồng nhau** (`<Route element={<DashboardLayout/>}><Route path="..." element={<Page/>}/></Route>`) thay vì mỗi page tự import và tự bọc `<DashboardLayout role="...">`. Nhờ vậy role không cần truyền tay 40 lần nữa — layout tự suy ra role từ route hiện tại hoặc từ `account.role` trong AuthContext.
3. Đổi `PrivateRoute` → `ProtectedRoute`, đọc `allowedRoles` từ `routes.config.ts` thay vì hard-code lại trong `AppRouter.tsx`.
4. Role dùng `Role` enum (`"admin" | "giangvien" | "sinhvien"` — khớp giá trị backend) thay vì chuỗi hiển thị tiếng Việt viết hoa (`"SINH VIÊN"`, `"GIẢNG VIÊN"`) đang bị dùng lẫn lộn làm cả *role key* lẫn *display label*. Tách riêng: `Role` enum để logic, `roleLabel` map để hiển thị.

Phân loại theo role (không đổi so với hiện tại, chỉ hệ thống hoá):

- **Public**: `/`, `/login`, `/unauthorized`
- **Protected — sinhvien**: 11 route (mục 2)
- **Protected — giangvien**: 8 route
- **Protected — admin**: 8 route

---

## 8. Responsive Strategy

Kiểm tra từng nhóm component trong UI cũ:

| Component/khu vực | Đánh giá | Chiến lược |
|---|---|---|
| Sidebar (`w-64` cố định) | WEB ONLY hiện tại | Reuse concept (menu theo role, active state) nhưng thêm biến thể drawer/off-canvas cho mobile — cấu trúc dữ liệu menu (`navItems`) share được, phần render thì không |
| Header | WEB ONLY (đơn giản, dễ responsive hoá) | Refactor nhẹ: ẩn phần text phụ trên mobile, giữ logic |
| Table (ChamBai, NganHangCauHoi, QuanLyTaiKhoan...) | WEB ONLY — dùng `<table>` HTML thuần, tràn ngang trên mobile | REUSE CONCEPT FOR MOBILE: giữ nguyên cấu trúc dữ liệu + cột, nhưng cần biến thể card-list cho màn hẹp — không ép chung 1 component Table cho mọi kích thước màn hình |
| Form (TaoKyThi, TaoTaiKhoan...) | Đa phần dùng grid/flex Tailwind, tương đối co giãn được | REUSE CONCEPT: giữ field/label, chỉ chỉnh breakpoint |
| Modal/Dialog | `fixed inset-0` overlay — pattern chuẩn, co giãn tốt | REUSE trực tiếp |
| ExamRunner (giao diện làm bài) | Quan trọng nhất về UX, hiện là 1-column, khá thân thiện mobile sẵn | REUSE CONCEPT FOR MOBILE, ưu tiên kiểm thử kỹ vì đây là màn hình sinh viên dùng nhiều nhất và có khả năng dùng trên điện thoại thực tế |
| Card/Dashboard stats | Grid Tailwind cơ bản | Dễ responsive, reuse trực tiếp sau khi thêm breakpoint |

**Chia sẻ với React Native (tương lai):** những gì đặt trong `shared/` và `features/*/api,hooks,types,utils` (không import React-DOM, không dùng Tailwind/JSX web-specific) là phần chia sẻ được — tức là toàn bộ tầng dữ liệu. Phần `components/` trong mỗi feature (JSX + Tailwind) **không** ép dùng chung với RN — sẽ viết lại UI riêng cho RN khi tới lúc, chỉ tái dùng hooks/types/validation/api.

---

## 9. Migration Roadmap

| Phase | Goal | Files affected | Risk | Verification |
|---|---|---|---|---|
| **1. Setup nền tảng mới** | Khởi tạo `app/`, `shared/api`, `shared/query`, `AppProviders`, `routes.config.ts` (chưa migrate page nào) | Toàn bộ file mới, không đụng code cũ | Thấp | Build chạy, route rỗng render được layout |
| **2. Migrate `shared/` & `auth` feature** | Đưa `api.ts` → `shared/api`, dựng `features/auth` (login, forgot/change password, AuthProvider mới dùng TanStack Query cho `getMe`) | ~6 file cũ | Trung bình (session/idle-timeout logic nhạy cảm, phải giữ nguyên hành vi) | Đăng nhập/đăng xuất/đổi mật khẩu/quên mật khẩu hoạt động y hệt bản cũ, test idle-logout 30 phút |
| **3. Migrate layout & widgets dùng chung** | Header, Sidebar (đọc menu từ config), Footer, AlertMessage, ModalErrorAlert, GuideChatWidget | ~8 file | Thấp | Layout hiển thị đúng theo từng role |
| **4. Migrate Question Bank feature** | NganHangCauHoi + gộp 2 modal + tách Excel parser | 3 file → cấu trúc feature mới | Trung bình (logic parse Excel phức tạp, nhiều edge-case định dạng cột) | So sánh kết quả import cùng 1 file Excel mẫu giữa bản cũ/mới, test đủ case lỗi dòng |
| **5. Migrate Subjects & Accounts & System Settings (admin)** | **Ưu tiên cao vì đây là nơi có lỗ hổng `fetch` không qua axios** | 8 file admin | **Cao** — vừa refactor UI vừa phải vá lỗ hổng auth header, cần backend xác nhận endpoint có yêu cầu auth hay không trước khi migrate | Test mọi thao tác admin với tài khoản không phải admin để chắc chắn bị chặn đúng (403), test network tab thấy Authorization header |
| **6. Migrate Exams — creation + grading + OMR** | Rebuild `TaoKyThi`, `ChamBai`, `UploadOMR` theo UI cũ làm reference | 3 file lớn nhất | Cao (nghiệp vụ sinh đề tự động theo chương/độ khó, trộn câu-đáp án là logic phức tạp nhất repo) | Test tạo kỳ thi đủ 2 luồng (tự động/thủ công), test tải đề/phiếu OMR, test chấm bài + xuất Excel |
| **7. Migrate Exam-taking + Practice (dùng chung `ExamRunner`)** | Gộp `LamBaiThi`+`LamBaiLuyenTap` thành 1 component tham số hoá, migrate `TaoBaiLuyenTap`, `LuyenTap` và các trang danh sách | ~10 file | Cao (đây là màn hình sinh viên dùng trực tiếp để thi — lỗi ở đây ảnh hưởng điểm số thật) | Test timer, flag, nộp bài, mất kết nối giữa chừng, so khớp kết quả chấm với bản cũ trên cùng 1 bộ dữ liệu test |
| **8. Migrate Statistics & History** | ThongKeDiemThi, LichSuLamBai (2 bản), Dashboard (3 bản) | ~5 file | Trung bình | So khớp số liệu thống kê với bản cũ |
| **9. Responsive optimization** | Sidebar drawer mobile, table → card-list mobile, kiểm thử `ExamRunner` trên mobile thực tế | Toàn bộ `widgets/layout`, các Table component | Trung bình | Test trên viewport thật (không chỉ devtools) cho ít nhất 1 luồng thi hoàn chỉnh |
| **10. Dọn dẹp** | Xóa `_staging/`, xóa `pages/` cũ, xóa `services/` cũ, xóa page-level `DashboardLayout role="..."` còn sót, chạy lại `npm run build` xác nhận không còn import chết | Toàn repo | Thấp nếu các phase trước verify kỹ | `grep -r "role=\"ADMIN\"\|role=\"SINH VIÊN\"\|role=\"GIẢNG VIÊN\""` trả về rỗng; `grep -r "fetch(" src/` trả về rỗng |

**Nguyên tắc xuyên suốt mọi phase** (đúng mục 12 bạn yêu cầu): không xóa code cũ cho tới khi phase tương ứng được verify xong; mỗi phase merge riêng, không gộp nhiều phase trong 1 PR lớn; route cũ và route mới có thể chạy song song trong giai đoạn chuyển tiếp nếu cần (feature flag theo role, không bắt buộc).

---

## 10. Risk Analysis

| Rủi ro | Mức độ | Chi tiết | Giảm thiểu |
|---|---|---|---|
| **Admin module không gắn Authorization header** | 🔴 Cao | 8 trang admin gọi `fetch` trực tiếp, không qua interceptor. Cần xác nhận với backend: nếu endpoint `/api/admin/*` hiện **không** kiểm tra token, đây là lỗ hổng bảo mật thật (bất kỳ ai gọi thẳng API cũng thao túng được dữ liệu), không chỉ là bug frontend | Kiểm tra backend TRƯỚC khi migrate Phase 5; nếu backend có check quyền, phase 5 chỉ là dọn code; nếu backend không check, phải báo và xử lý phía backend song song |
| **Logic sinh đề tự động (TaoKyThi) phức tạp, dễ sai khi rebuild** | 🔴 Cao | Ràng buộc "tổng câu dễ+tb+khó = tổng số câu", validate theo từng chương, trộn câu/đáp án — sai 1 chỗ có thể tạo đề thi lỗi cho sinh viên thật | Viết test case cụ thể cho từng nhánh validate trước khi rebuild, so sánh output với bản cũ trên cùng input |
| **`ExamRunner` gộp chung exam/practice có thể lệch hành vi tinh vi** | 🟠 Trung bình-Cao | 2 file cũ (`LamBaiThi`, `LamBaiLuyenTap`) tuy giống nhau nhưng có thể có khác biệt nhỏ (ví dụ cách tính điểm, có cho xem đáp án ngay hay không) chưa chắc giống hệt nhau — cần đọc kỹ diff trước khi gộp | Diff kỹ 2 file trước khi thiết kế `ExamRunner`, giữ lại khác biệt qua prop `mode`, không giả định chúng giống nhau 100% |
| **Excel import/export chuẩn hóa tiếng Việt có dấu/không dấu** | 🟠 Trung bình | Hàm `normalizeKey` xử lý nhiều biến thể header (có dấu, không dấu, viết hoa/thường) — dễ sót case khi viết lại | Copy nguyên logic normalize sang util mới thay vì viết lại từ đầu, chỉ refactor vị trí file, không đổi thuật toán |
| **Không có type dùng chung hiện tại → dễ lệch DTO khi tạo `shared/types`** | 🟠 Trung bình | Nhiều interface trùng tên khác field ở các file khác nhau (`ExamItem` định nghĩa khác nhau ở `TaoKyThi.tsx` vs `UploadOMR.tsx` vs `ChamBai.tsx`) | Đối chiếu từng interface với response thật của backend trước khi hợp nhất thành 1 type, không suy đoán |
| **Không có phân trang cho danh sách (câu hỏi, tài khoản)** | 🟡 Thấp-Trung bình (hiện tại), tăng dần theo thời gian | Khi dữ liệu lớn lên, load toàn bộ list 1 lần sẽ chậm | Không bắt buộc xử lý ngay, nhưng thiết kế query hook theo hướng dễ thêm `useInfiniteQuery` sau này |
| **Session/idle-timeout logic (AuthContext)** | 🟡 Thấp-Trung bình | Logic đếm ngược, đồng bộ giữa tab, giữ phiên sống (`keepSessionAlive`) khá tinh vi, dễ sai khi refactor | Giữ nguyên thuật toán, chỉ thay nguồn cache "account" bằng TanStack Query, viết test riêng cho idle-logout |
| **File `TaoKyThi.tsx` bị lỗi encoding ở 1 chỗ (`role={"GI\u1ea2NG VI\u00caN"}`)** | 🟢 Thấp | Dấu hiệu môi trường edit không đồng nhất giữa các dev cũ, không ảnh hưởng chức năng | Không cần xử lý riêng, sẽ tự biến mất khi bỏ hoàn toàn cách truyền role bằng chuỗi tay (Phase 6 + 10) |
| **`dist/`, log file lọt vào bản nén dù đã gitignore** | 🟢 Thấp | Không ảnh hưởng migration nhưng cần loại trừ tường minh khi copy | Không copy các thư mục/file này sang project mới |

---

## Việc cần bạn quyết định trước khi bắt đầu code

1. **Xác nhận với backend**: các endpoint `/api/admin/*` có đang kiểm tra token/role không? (ảnh hưởng độ ưu tiên của Phase 5)
2. Xác nhận 2 luồng `LamBaiThi` vs `LamBaiLuyenTap` có thực sự nên gộp chung `ExamRunner`, hay có khác biệt nghiệp vụ tôi chưa thấy hết qua đọc code tĩnh (ví dụ: luyện tập có cho xem đáp án ngay sau khi chọn không, thi thật thì không)?
3. Có muốn giữ nguyên toàn bộ URL path hiện tại không, hay đây là cơ hội tốt để chuẩn hoá lại (ví dụ prefix `/teacher` thay vì `/giangvien` để nhất quán tiếng Anh trong code)?
4. Thứ tự Phase 5-6-7 tôi đề xuất theo mức độ rủi ro giảm dần khi làm sớm (vá lỗ hổng admin trước) — bạn có ưu tiên nghiệp vụ nào cần đi trước vì lý do khác (ví dụ sắp có kỳ thi thật sắp diễn ra, cần ưu tiên ổn định `exams`/`ExamRunner` trước) không?

Sau khi bạn trả lời các câu trên và duyệt kế hoạch, tôi sẽ bắt đầu **Phase 1** trước — chỉ dựng khung kiến trúc mới, chưa đụng vào bất kỳ page nào của bạn.
