/** File từ React Native (camera / image picker): FormData nhận object `{ uri, name, type }`. */
export type NativeUploadFile = {
  uri: string
  name: string
  type: string
  size?: number
}

/** Web truyền `File` / `Blob`; Mobile truyền `NativeUploadFile`. */
export type UploadFile = Blob | NativeUploadFile

export function isNativeUploadFile(file: UploadFile): file is NativeUploadFile {
  return typeof (file as NativeUploadFile).uri === 'string'
}

export function getUploadFileSize(file: UploadFile) {
  return isNativeUploadFile(file) ? (file.size ?? 0) : file.size
}

export function appendUploadFile(formData: FormData, field: string, file: UploadFile) {
  if (isNativeUploadFile(file)) {
    formData.append(field, file as unknown as Blob)
    return
  }
  formData.append(field, file)
}
