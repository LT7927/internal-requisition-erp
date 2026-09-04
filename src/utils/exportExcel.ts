import * as XLSX from 'xlsx';

/**
 * Hàm xuất dữ liệu JSON ra file Excel
 * @param data Mảng dữ liệu cần xuất (Ví dụ: mảng users, mảng thống kê)
 * @param filename Tên file khi tải về (Không cần đuôi .xlsx)
 * @param columnMapping Bản đồ dịch tên cột (Ví dụ: { full_name: 'Họ và tên', role: 'Chức vụ' })
 */
export const exportToExcel = (data: any[], filename: string, columnMapping?: Record<string, string>) => {
  if (!data || data.length === 0) {
    return;
  }

  // 1. Dịch tên cột từ Tiếng Anh sang Tiếng Việt dựa vào columnMapping
  const mappedData = data.map((item) => {
    if (!columnMapping) return item;
    
    const newItem: any = {};
    Object.keys(columnMapping).forEach((key) => {
      // Nếu dữ liệu là số tiền, có thể format luôn ở đây nếu cần, nhưng Excel thường thích số thô hơn
      newItem[columnMapping[key]] = item[key];
    });
    return newItem;
  });

  // 2. Tạo một WorkSheet (Trang tính) từ dữ liệu đã dịch
  const worksheet = XLSX.utils.json_to_sheet(mappedData);

  // 3. Tự động căn chỉnh độ rộng của cột cho đẹp (Auto-fit width)
  const colWidths = Object.values(columnMapping || {}).map(header => ({
    wch: Math.max(header.length + 5, 15) // Độ rộng tối thiểu là 15, tối đa bám theo chữ
  }));
  worksheet['!cols'] = colWidths;

  // 4. Tạo một WorkBook (File Excel) và gắn trang tính vào
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dữ liệu');

  // 5. Kích hoạt trình duyệt tải file xuống
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};