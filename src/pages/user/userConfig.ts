import { z } from 'zod';
import { FormFieldConfig } from '../../components/common/formTypes';
import { TableConfig } from '../../components/common/tableTypes';
import API_BASE_URL from '../../api';

export const USER_API = `${API_BASE_URL}/users`;

// Kiểm duyệt Form User
export const userSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().optional(), 
  email: z.string().email('Định dạng email không hợp lệ'),
  full_name: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự'),
  role: z.string().min(1, 'Vui lòng chọn chức vụ'),
  department_id: z.coerce.number({ message: "Vui lòng chọn phòng ban hợp lệ" }).min(1, 'Vui lòng chọn phòng ban'), 
});

// Cấu hình Form 
export const userFormFields: FormFieldConfig[] = [
  { name: 'username', label: 'Tên đăng nhập (Username)', type: 'text', placeholder: 'VD: nguyenvan_a', span: 12 },
  { name: 'password', label: 'Mật khẩu (Chỉ nhập khi tạo mới)', type: 'password', placeholder: 'Nhập mật khẩu...', span: 12 },
  { name: 'email', label: 'Email đăng nhập', type: 'email', placeholder: 'VD: nguyenvan@erp.com', span: 12 },
  { name: 'full_name', label: 'Họ và tên', type: 'text', placeholder: 'Nhập họ và tên đầy đủ...', span: 12 },
  { 
    name: 'role', 
    label: 'Chức vụ', 
    type: 'select', 
    options: [
      { label: 'Quản trị viên (Admin)', value: 'ADMIN' },
      { label: 'Quản lý (Manager)', value: 'MANAGER' },
      { label: 'Nhân viên (Staff)', value: 'STAFF' }
    ],
    span: 12 
  },
  { 
    name: 'department_id', 
    label: 'Thuộc Phòng ban', 
    type: 'select', 
    apiEndpoint: `${API_BASE_URL}/categories/departments`, 
    placeholder: 'Đang tải danh sách phòng ban...', 
    span: 12 
  }
];

// Cấu hình Bảng hiển thị
export const userTableConfig: TableConfig = {
  apiEndpoint: USER_API,
  rowKey: 'id',
  columns: [
    { title: 'Họ và tên', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Chức vụ', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => {
        const roleMap: Record<string, string> = {
          ADMIN: 'Quản trị viên',
          MANAGER: 'Quản lý',
          STAFF: 'Nhân viên'
        };
        return roleMap[role] || role;
      }
    },
  ],
  filterConfigs: [
    {
      name: 'role',
      placeholder: 'Lọc theo Chức vụ',
      options: [
        { label: 'Tất cả', value: '' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Manager', value: 'MANAGER' },
        { label: 'Staff', value: 'STAFF' }
      ]
    }
  ]
};

// Form Đặt lại mật khẩu
export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
});

// Cấu hình Form Đặt lại mật khẩu
export const resetPasswordFields: FormFieldConfig[] = [
  { name: 'newPassword', label: 'Mật khẩu mới', type: 'password', placeholder: 'Nhập mật khẩu mới cho nhân viên này...', span: 24 }
];