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
  
  apiEndpoint?: string;  
  method?: 'POST' | 'PUT'; 
  
  onSubmit?: (data: any) => void;
  onSuccess?: () => void;
  
  submitBtnText?: string;           
  initialValues?: any;              
}