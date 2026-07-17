import { useState, useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Input, InputNumber, Select, Radio, Checkbox, Form, Typography, Spin } from 'antd';
import { FormFieldConfig } from './formTypes';
import axiosClient from '../../utils/axiosClient';

const { Text } = Typography;

interface FieldRendererProps {
  fieldConfig: FormFieldConfig;
  control: Control<any>;
}

export const FormFieldRenderer = ({ fieldConfig, control }: FieldRendererProps) => {
  const { name, label, type, placeholder, options, apiEndpoint, disabled } = fieldConfig;
  
  const [dynamicOptions, setDynamicOptions] = useState<{label: string, value: any}[]>(options || []);
  const [isLoading, setIsLoading] = useState(false);

  // apiEndpoint được sử dụng ở đây, giải quyết lỗi "is declared but its value is never read"
  useEffect(() => {
    if (type === 'select' && apiEndpoint) {
      const fetchOptions = async () => {
        setIsLoading(true);
        try {
          const res: any = await axiosClient.get(apiEndpoint);
          const data = res.data?.data || res.data || res;
          
          if (Array.isArray(data)) {
            setDynamicOptions(data.map((item: any) => ({
              label: item.name || item.title || item.code || 'Không tên', 
              value: item.id || item.code
            })));
          }
        } catch (error) {
          console.error(`Lỗi tải dữ liệu cho ô ${name}:`, error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOptions();
    }
  }, [type, apiEndpoint, name]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const renderComponent = () => {
          switch (type) {
            case 'password': return <Input.Password {...field} placeholder={placeholder} disabled={disabled} />;
            case 'email': return <Input {...field} type="email" placeholder={placeholder} disabled={disabled} />;
            case 'number': return <InputNumber {...field} placeholder={placeholder} disabled={disabled} style={{ width: '100%' }} />;
            case 'textarea': return <Input.TextArea {...field} placeholder={placeholder} disabled={disabled} rows={4} />;
            
            case 'select':
              return (
                <Select 
                  {...field} 
                  placeholder={placeholder} 
                  disabled={disabled} 
                  style={{ width: '100%' }}
                  loading={isLoading}
                  options={dynamicOptions}
                  notFoundContent={isLoading ? <Spin size="small" /> : null}
                  showSearch 
                  optionFilterProp="label"
                />
              );
              
            case 'radio':
              return <Radio.Group {...field} disabled={disabled} options={dynamicOptions} />;
              
            case 'checkbox-group':
              return <Checkbox.Group {...field} disabled={disabled} options={dynamicOptions} />;
              
            case 'checkbox':
              return (
                <Checkbox 
                  {...field} 
                  checked={field.value} 
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={disabled}
                >
                  {label}
                </Checkbox>
              );
              
            case 'text':
            default:
              return <Input {...field} placeholder={placeholder} disabled={disabled} />;
          }
        };

        return (
          <Form.Item
            label={type === 'checkbox' ? null : label}
            validateStatus={error ? 'error' : ''}
            help={error ? <Text type="danger">{error.message}</Text> : null}
          >
            {renderComponent()}
          </Form.Item>
        );
      }}
    />
  );
};