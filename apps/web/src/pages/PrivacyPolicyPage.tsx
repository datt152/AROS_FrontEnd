import { AROS_SYSTEM_EMAIL } from '../constants/ui'
import { LegalPage } from './LegalPage'

export function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Chính sách bảo mật"
      updatedAt="07/11/2026"
      intro="Chính sách này mô tả cách AROS thu thập, sử dụng và bảo vệ thông tin khi bạn dùng nền tảng web hoặc ứng dụng di động. AROS là hệ thống thi trắc nghiệm phục vụ giáo viên và sinh viên: tài khoản, lớp học, bài thi trực tuyến, chấm phiếu OMR, luyện tập và theo dõi tiến độ."
      sections={[
        {
          title: '1. Thông tin chúng tôi thu thập',
          content: (
            <>
              <p>Tùy vai trò và thao tác của bạn, AROS có thể xử lý các nhóm dữ liệu sau:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Tài khoản:</strong> họ tên, email, mật khẩu (được lưu dưới dạng đã mã hóa), vai trò (giáo
                  viên hoặc sinh viên), mã sinh viên.
                </li>
                <li>
                  <strong>Lớp học và học thuật:</strong> môn học, lớp, ngân hàng câu hỏi, thư viện đề, đề thi online,
                  đề OMR, bài luyện tập, bài làm, đáp án, điểm số và lịch sử nộp bài.
                </li>
                <li>
                  <strong>Chấm OMR:</strong> ảnh phiếu trả lời do giáo viên chụp hoặc tải lên, kết quả nhận diện (mã
                  sinh viên, tên, mã đề, lựa chọn trên phiếu) và chỉnh sửa khi xem lại phiếu.
                </li>
                <li>
                  <strong>Bảo mật phiên:</strong> cookie httpOnly dùng để làm mới phiên đăng nhập trên web; trên
                  ứng dụng di động là refresh token lưu trên thiết bị. Có thể lưu email nếu bạn chọn “Ghi nhớ”;
                  thời điểm hoạt động gần nhất được dùng để đăng xuất khi không dùng trong thời gian dài.
                </li>
                <li>
                  <strong>Xác minh:</strong> khi đăng ký, AROS dùng Cloudflare Turnstile để giảm đăng ký tự động.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: '2. Mục đích sử dụng',
          content: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Tạo và quản lý tài khoản, xác thực, đặt lại mật khẩu qua email.</li>
              <li>Cho phép giáo viên quản lý lớp, đề thi, chấm bài và xem thống kê; cho sinh viên làm bài và xem kết quả.</li>
              <li>Nhận diện phiếu OMR, hỗ trợ giáo viên rà soát và lưu kết quả chấm.</li>
              <li>Phân tích kết quả lớp (kể cả công cụ phân tích thống kê trên trang thống kê bài thi) để hỗ trợ giảng dạy.</li>
              <li>Bảo vệ hệ thống: chống truy cập trái phép, giới hạn phiên khi không hoạt động, captcha khi đăng ký.</li>
            </ul>
          ),
        },
        {
          title: '3. Ai có thể xem dữ liệu',
          content: (
            <>
              <p>
                Giáo viên xem dữ liệu học tập của sinh viên thuộc lớp và đề thi mà họ quản lý (danh sách lớp, bài
                nộp, điểm, phiếu OMR). Sinh viên xem hồ sơ của mình, bài thi/luyện tập được giao và lịch sử làm bài.
              </p>
              <p>
                AROS không bán dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ với nhà cung cấp kỹ thuật cần thiết để vận
                hành dịch vụ (ví dụ xác minh captcha, gửi email đặt lại mật khẩu, lưu trữ máy chủ), trong phạm vi phục
                vụ các mục đích trên.
              </p>
            </>
          ),
        },
        {
          title: '4. Cookie và lưu trữ trên thiết bị',
          content: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Web dùng cookie httpOnly cho phiên đăng nhập; trình duyệt không đọc được cookie này bằng JavaScript.</li>
              <li>Tùy chọn “Ghi nhớ email” lưu email trên trình duyệt (localStorage) để điền sẵn form đăng nhập.</li>
              <li>Ứng dụng di động lưu token phiên trên thiết bị để giữ đăng nhập an toàn hơn so với cookie web.</li>
            </ul>
          ),
        },
        {
          title: '5. Ảnh phiếu OMR',
          content: (
            <p>
              Ảnh phiếu chứa thông tin nhận dạng và bài làm của sinh viên. Ảnh được dùng để nhận diện và chấm điểm,
              sau đó giáo viên có thể xem lại, chỉnh đáp án và lưu kết quả. Chỉ giáo viên phiên chấm tương ứng (và hệ
              thống xử lý ảnh) được phép truy cập các ảnh này. Không dùng ảnh phiếu cho mục đích quảng cáo.
            </p>
          ),
        },
        {
          title: '6. Quyền của bạn',
          content: (
            <>
              <p>Trong tài khoản, bạn có thể cập nhật họ tên; sinh viên có thể cập nhật mã sinh viên; mọi người có thể đổi mật khẩu.</p>
              <p>
                Nếu cần chỉnh sửa, xuất hoặc xóa dữ liệu ngoài các chức năng trên trang tài khoản, hãy liên hệ đơn vị
                vận hành AROS qua email{' '}
                <a href={`mailto:${AROS_SYSTEM_EMAIL}`} className="font-medium text-blue-600 hover:underline">
                  {AROS_SYSTEM_EMAIL}
                </a>
                . Yêu cầu xóa có thể bị giới hạn khi dữ liệu còn cần cho việc lưu trữ kết quả thi hoặc nghĩa vụ học vụ.
              </p>
            </>
          ),
        },
        {
          title: '7. Bảo mật và lưu trữ',
          content: (
            <p>
              AROS áp dụng biện pháp kỹ thuật phù hợp (mã hóa mật khẩu, cookie phiên httpOnly, đăng xuất khi không
              hoạt động, phân quyền theo vai trò). Không hệ thống nào bảo đảm tuyệt đối. Dữ liệu được giữ trong thời
              gian tài khoản, lớp học và kết quả thi còn cần cho việc giảng dạy và lưu trữ học vụ, trừ khi pháp luật
              hoặc đơn vị vận hành yêu cầu khác.
            </p>
          ),
        },
        {
          title: '8. Thay đổi chính sách',
          content: (
            <p>
              Khi chính sách được cập nhật, ngày “Cập nhật lần cuối” trên trang này sẽ thay đổi. Việc tiếp tục sử dụng
              AROS sau khi cập nhật đồng nghĩa bạn đã biết nội dung mới. Mọi thắc mắc gửi về{' '}
              <a href={`mailto:${AROS_SYSTEM_EMAIL}`} className="font-medium text-blue-600 hover:underline">
                {AROS_SYSTEM_EMAIL}
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  )
}
