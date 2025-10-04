export const normalizeStr = (str: string): string => {
  return str
    .normalize('NFD')                       // Tách dấu khỏi ký tự
    .replace(/[\u0300-\u036f]/g, '')        // Xóa dấu
    .replace(/đ/g, 'd')                     // thay đ -> d
    .replace(/Đ/g, 'D')                     // thay Đ -> D
    .toLowerCase()                          // thành chữ thường
    .trim()                                 // xóa khoảng trắng đầu/cuối
    .replace(/\s+/g, '-')                  // thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-')
};