import { Link } from 'react-router-dom'

import { AROS_SYSTEM_EMAIL } from '../constants/ui'
import { ROUTES } from '../routes/routes.config'
import { LegalPage } from './LegalPage'

export function TermsOfServicePage() {
  return (
    <LegalPage
      title="Điều khoản dịch vụ"
      updatedAt="07/11/2026"
      intro="Các điều khoản này điều chỉnh việc sử dụng nền tảng AROS (web và ứng dụng di động): quản lý lớp học, ngân hàng câu hỏi, đề thi trực tuyến, chấm phiếu OMR, luyện tập và theo dõi tiến độ. Khi tạo tài khoản hoặc đăng nhập, bạn đồng ý với điều khoản này và Chính sách bảo mật."
      sections={[
        {
          title: '1. Đối tượng và tài khoản',
          content: (
            <>
              <p>
                AROS phục vụ môi trường lớp học. Đăng ký công khai hiện dành cho tài khoản giáo viên. Tài khoản sinh
                viên được tạo và gắn với lớp theo quy trình của giáo viên hoặc đơn vị vận hành.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Bạn phải cung cấp thông tin đúng (họ tên, email; sinh viên cần mã sinh viên hợp lệ).</li>
                <li>Bạn chịu trách nhiệm bảo mật mật khẩu và thiết bị đã đăng nhập.</li>
                <li>
                  Không được dùng tài khoản của người khác, không được cố truy cập chức năng ngoài vai trò được cấp
                  (giáo viên / sinh viên).
                </li>
              </ul>
            </>
          ),
        },
        {
          title: '2. Dịch vụ AROS cung cấp',
          content: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Giáo viên: môn học, lớp, ngân hàng câu hỏi, thư viện đề, kỳ thi online, đề OMR, luyện tập, chấm điểm, thống kê.</li>
              <li>Sinh viên: làm bài thi và luyện tập được giao, xem kết quả và lịch sử nộp bài.</li>
              <li>Chấm OMR: giáo viên tạo phiên chấm, quét hoặc tải ảnh phiếu, rà soát phiếu cần xem lại và lưu kết quả.</li>
            </ul>
          ),
        },
        {
          title: '3. Trách nhiệm khi thi và luyện tập',
          content: (
            <>
              <p>
                Sinh viên phải tự làm bài trong thời gian và quy định do giáo viên thiết lập. Gian lận, nhờ người khác
                làm hộ, phát tán đề hoặc đáp án, can thiệp kỹ thuật vào phiên thi đều bị cấm.
              </p>
              <p>
                Giáo viên chịu trách nhiệm nội dung đề, thời gian mở/đóng thi, việc giao lớp, chấm bài và quyết định
                học vụ dựa trên kết quả trên hệ thống.
              </p>
            </>
          ),
        },
        {
          title: '4. Phiếu OMR và dữ liệu lớp',
          content: (
            <p>
              Khi chụp hoặc tải phiếu, giáo viên cam kết có cơ sở hợp pháp để xử lý ảnh và thông tin trên phiếu (mã
              sinh viên, bài làm). Không tải nội dung không liên quan kỳ thi. Kết quả nhận diện tự động có thể sai;
              giáo viên cần rà soát các phiếu hệ thống đánh dấu cần xem lại trước khi chốt điểm.
            </p>
          ),
        },
        {
          title: '5. Nội dung và sở hữu trí tuệ',
          content: (
            <p>
              Câu hỏi, đề thi, bài luyện tập và tài liệu do giáo viên hoặc nhà trường đưa lên vẫn thuộc quyền của họ
              hoặc bên được cấp phép. AROS chỉ lưu và hiển thị để vận hành lớp học. Bạn không được sao chép, phát tán
              ngân hàng câu hỏi hay đề thi ra ngoài lớp khi chưa được phép.
            </p>
          ),
        },
        {
          title: '6. Hành vi bị cấm',
          content: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Phá hoại, quét lỗ hổng, giả mạo phiên, vượt quyền, hoặc làm gián đoạn dịch vụ.</li>
              <li>Tải phần mềm độc hại hoặc nội dung bất hợp pháp.</li>
              <li>Dùng AROS ngoài mục đích giảng dạy và học tập được nhà trường cho phép.</li>
            </ul>
          ),
        },
        {
          title: '7. Tính sẵn sàng',
          content: (
            <p>
              AROS nỗ lực vận hành ổn định nhưng không cam kết không gián đoạn. Bảo trì, sự cố mạng hoặc lỗi nhận diện
              OMR có thể ảnh hưởng đến việc làm bài hoặc chấm điểm. Đơn vị vận hành không chịu trách nhiệm thiệt hại
              gián tiếp phát sinh từ việc không truy cập được dịch vụ, trong phạm vi pháp luật cho phép.
            </p>
          ),
        },
        {
          title: '8. Tạm khóa và chấm dứt',
          content: (
            <p>
              Tài khoản có thể bị hạn chế hoặc khóa nếu vi phạm điều khoản, gian lận thi, hoặc theo yêu cầu của nhà
              trường. Bạn có thể ngừng sử dụng bất kỳ lúc nào; dữ liệu học vụ có thể được giữ theo quy định lưu trữ của
              đơn vị vận hành.
            </p>
          ),
        },
        {
          title: '9. Chính sách bảo mật',
          content: (
            <p>
              Việc xử lý dữ liệu cá nhân được mô tả tại{' '}
              <Link to={ROUTES.privacy} className="font-medium text-blue-600 hover:underline">
                Chính sách bảo mật
              </Link>
              . Hai văn bản này được đọc cùng nhau.
            </p>
          ),
        },
        {
          title: '10. Thay đổi điều khoản',
          content: (
            <p>
              AROS có thể cập nhật điều khoản khi chức năng hệ thống thay đổi. Ngày cập nhật được ghi trên trang này.
              Nếu bạn không đồng ý nội dung mới, hãy ngừng sử dụng dịch vụ và liên hệ{' '}
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
