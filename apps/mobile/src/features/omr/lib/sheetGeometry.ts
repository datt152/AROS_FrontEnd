/**
 * Hình học phiếu trả lời OMR — đo từ phiếu mẫu (500×706 px, khổ A4 dọc).
 *
 * 4 marker là ô vuông đen đặc 19×19 px ở 4 góc phiếu.
 * Tọa độ dưới đây là TÂM marker theo % kích thước phiếu (0–1),
 * để vẽ khung ngắm trên camera khớp bất kể kích thước màn hình.
 */
export const SHEET_ASPECT_RATIO = 210 / 297 // A4 dọc: width / height ≈ 0.707

export type MarkerPosition = {
  /** Tâm marker theo % chiều ngang phiếu (0–1) */
  x: number
  /** Tâm marker theo % chiều dọc phiếu (0–1) */
  y: number
}

/** Tâm 4 marker: TL, TR, BL, BR */
export const SHEET_MARKERS: MarkerPosition[] = [
  { x: 0.064, y: 0.0439 },
  { x: 0.938, y: 0.0439 },
  { x: 0.064, y: 0.9561 },
  { x: 0.938, y: 0.9561 },
]

/** Kích thước marker theo % chiều ngang phiếu (≈ 3.8%) */
export const MARKER_SIZE_RATIO = 0.038

/** Giới hạn upload giống web: 10MB, chỉ jpg/png */
export const MAX_SHEET_BYTES = 10 * 1024 * 1024

/** Ảnh sau khi crop sát phiếu sẽ được resize về bề ngang tối đa này (giữ nét cho OMR) */
export const UPLOAD_IMAGE_WIDTH = 2400

/** Nới crop ra ngoài khung ngắm thêm từng này (theo bề ngang vùng crop) để marker không bị cắt sát */
export const CROP_MARGIN_RATIO = 0.05
