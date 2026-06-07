// Định nghĩa cấu hình cho từng bộ lọc (Filter Dropdown) xuất hiện phía trên bảng
export interface TableFilterConfig {
  name: string;               // Tên trường dữ liệu cần lọc (VD: 'status', 'departmentId')
  placeholder: string;        // Chữ mờ hiển thị ban đầu
  options: { label: string; value: any }[]; // Danh sách các lựa chọn trong Dropdown
}

// Định nghĩa tất cả các tham số truyền dữ liệu ra bên ngoài khi người dùng tương tác
export interface TableParams {
  page: number;               // Trang hiện tại
  pageSize: number;           // Số bản ghi trên một trang
  search?: string;            // Từ khóa tìm kiếm
  filters?: Record<string, any>; // Các giá trị bộ lọc đang chọn (VD: { status: 'PENDING' })
}

// Props tổng cho Component DynamicTable
export interface DynamicTableProps {
  columns: any[];             // Định nghĩa các cột của bảng (theo chuẩn của Ant Design Column)
  dataSource: any[];          // Mảng dữ liệu đổ vào bảng lấy từ API
  totalItems: number;         // Tổng số lượng bản ghi trên hệ thống (để tính số trang)
  isLoading: boolean;         // Trạng thái xoay xoay loading khi đang đợi API mang dữ liệu về
  params: TableParams;        // State quản lý phân trang/search/filter hiện tại từ component cha
  onParamsChange: (newParams: TableParams) => void; // Hàm báo cáo lên cha khi user bấm chuyển trang/search/filter
  filtersConfig?: TableFilterConfig[]; // Mảng cấu hình các bộ lọc (không bắt buộc)
  searchPlaceholder?: string; // Chữ mờ ô tìm kiếm (Mặc định: "Tìm kiếm...")
}