import { ZodType } from 'zod';

// Thêm 'checkbox-group' vào danh sách hỗ trợ
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
  onSubmit: (data: any) => void;    
  schema?: ZodType<any, any, any>; 
  submitBtnText?: string;           
  loading?: boolean;                
  initialValues?: any;              
}