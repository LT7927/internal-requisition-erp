import { RegisterOptions } from 'react-hook-form';

// Các loại ô nhập liệu mà hệ thống hỗ trợ
export type FormFieldType = 'text' | 'password' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';

// Định nghĩa cấu hình cho từng ô nhập liệu cụ thể
export interface FormFieldConfig {
  name: string;               // Tên trường dữ liệu (VD: 'email', 'password', 'departmentId')
  label: string;              // Nhãn hiển thị phía trên ô nhập (VD: 'Địa chỉ Email')
  type: FormFieldType;        // Loại ô nhập liệu
  placeholder?: string;       // Chữ mờ gợi ý bên trong ô nhập
  options?: { label: string; value: any }[]; // Dành riêng cho Select, Radio, Checkbox
  rules?: RegisterOptions;    // Các luật validate của React Hook Form (VD: required, minLength)
  disabled?: boolean;         // Trạng thái vô hiệu hóa ô nhập
  span?: number;              // Số cột chiếm trên lưới AntD Grid (từ 1 đến 24. VD: 12 là nửa màn hình, 24 là đầy màn hình)
}

// Cấu hình tổng của cả một Form
export interface DynamicFormProps {
  fields: FormFieldConfig[];        // Mảng các ô nhập liệu dạng JSON
  onSubmit: (data: any) => void;    // Hàm xử lý khi form submit thành công
  submitBtnText?: string;           // Chữ trên nút submit (Mặc định là "Lưu")
  loading?: boolean;                // Hiển thị trạng thái loading của nút submit
  initialValues?: any;              // Dữ liệu ban đầu (dùng khi làm chức năng Sửa/Edit)
}