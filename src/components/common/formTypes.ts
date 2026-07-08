import { ZodType } from 'zod';

export type FormFieldType = 'text' | 'password' | 'email' | 'number' | 'select' | 'checkbox' | 'checkbox-group' | 'radio' | 'textarea';

export interface FormFieldConfig {
  name: string;               
  label: string;              
  type: FormFieldType;        
  placeholder?: string;       
  options?: { label: string; value: any }[]; 
  apiEndpoint?: string;       
  disabled?: boolean;         
  span?: number;              
}

export interface DynamicFormProps {
  fields: FormFieldConfig[];        
  schema?: ZodType<any, any, any>;  
  
  // [NÂNG CẤP]: Thêm cấu hình API để Form tự động gửi dữ liệu
  apiEndpoint?: string;             // VD: '/api/categories/departments'
  method?: 'POST' | 'PUT';          // Phương thức gửi (Tạo mới hay Cập nhật)
  
  onSubmit?: (data: any) => void;   // Vẫn giữ lại dự phòng nếu muốn tự xử lý
  onSuccess?: () => void;           // Hàm chạy khi Form gọi API thành công (để đóng Modal, load lại bảng...)
  
  submitBtnText?: string;           
  initialValues?: any;              
}