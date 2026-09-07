# GitHub Actions — CI Frontend AROS

## Workflow có gì?

File: `.github/workflows/ci.yml`

| Trigger | Việc chạy |
|---------|-----------|
| Push `main`, `develop` | `npm ci` → lint → build |
| Pull request vào `main` / `develop` | Giống trên |

Deploy production vẫn do **Vercel** (Git Integration). Action này chỉ **kiểm tra chất lượng** trước khi merge/deploy.

## Bật lần đầu

1. Commit + push file workflow lên GitHub (`develop` hoặc `main`).
2. Repo → tab **Actions** → nếu hỏi, bật workflows.
3. Vào **Actions** → chọn workflow **CI** → xem run mới nhất (xanh = pass).

## (Tuỳ chọn) Biến build trên GitHub

Nếu muốn CI build với URL API giống production:

1. Repo → **Settings** → **Secrets and variables** → **Actions** → tab **Variables**
2. **New repository variable**
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend.example.com/api`
3. Không set cũng được — workflow dùng fallback `/api`.

> Biến trên Vercel (Project → Settings → Environment Variables) **vẫn cần** cho deploy thật. Variable GitHub chỉ ảnh hưởng bước `npm run build` trong CI.

## Branch protection (khuyến nghị cho `main`)

1. **Settings** → **Branches** → **Add branch protection rule**
2. Branch name: `main`
3. Bật:
   - **Require a pull request before merging** (tuỳ team)
   - **Require status checks to pass before merging**
   - Search / chọn check: **Lint & Build** (tên job trong workflow)
4. Save

Sau đó PR vào `main` không merge được nếu CI đỏ.

## Quy trình làm việc đề xuất

```
feature branch ──PR──► develop  (CI chạy)
develop        ──PR──► main     (CI chạy → Vercel Production)
```

Hoặc push thẳng `develop`/`main` nếu chưa bật protection — CI vẫn chạy để báo lỗi sớm.

## Khi CI fail

| Bước đỏ | Việc làm |
|---------|----------|
| Install | Kiểm tra `package-lock.json` đã commit; chạy `npm ci` local |
| Lint | Chạy `npm run lint` local, sửa rồi push lại |
| Build | Chạy `npm run build` local (`tsc` + Vite); sửa lỗi TS/import |

## Không nằm trong CI này

- Deploy Vercel (đã có Git hook)
- Test E2E / Playwright
- Backend / Docker

Có thể bổ sung sau bằng workflow riêng.

## Kiểm tra nhanh local (giống CI)

```bash
npm ci
npm run lint
npm run build
```
