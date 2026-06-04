import { Control, Controller } from 'react-hook-form';
import { Input, InputNumber, Select, Radio, Checkbox, Form, Typography } from 'antd';
import { FormFieldConfig } from './formTypes';

const { Text } = Typography;

interface FieldRendererProps {
  fieldConfig: FormFieldConfig;
  control: Control<any>;
}

export const FormFieldRenderer = ({ fieldConfig, control }: FieldRendererProps) => {
  const { name, label, type, placeholder, options, rules, disabled } = fieldConfig;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        // Hàm render component tương ứng dựa vào thuộc tính type trong JSON
        const renderComponent = () => {
          switch (type) {
            case 'password':
              return <Input.Password {...field} placeholder={placeholder} disabled={disabled} />;
            case 'email':
              return <Input {...field} type="email" placeholder={placeholder} disabled={disabled} />;
            case 'number':
              return <InputNumber {...field} placeholder={placeholder} disabled={disabled} style={{ width: '100%' }} />;
            case 'textarea':
              return <Input.TextArea {...field} placeholder={placeholder} disabled={disabled} rows={4} />;
            case 'select':
              return (
                <Select {...field} placeholder={placeholder} disabled={disabled} style={{ width: '100%' }}>
                  {options?.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              );
            case 'radio':
              return (
                <Radio.Group {...field} disabled={disabled}>
                  {options?.map((opt) => (
                    <Radio key={opt.value} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))}
                </Radio.Group>
              );
            case 'checkbox':
              // Đối với checkbox đơn lẻ hoặc nhóm checkbox, AntD dùng thuộc tính 'checked' hoặc 'value'
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
          // validateStatus="error" sẽ làm viền ô nhập của AntD chuyển sang màu đỏ khi có lỗi
          <Form.Item
            label={type === 'checkbox' ? null : label} // Checkbox không cần hiện label phía trên vì đã có label bên cạnh
            validateStatus={error ? 'error' : ''}
            help={error ? <Text type="danger">{error.message}</Text> : null}
            required={!!rules?.required}
          >
            {renderComponent()}
          </Form.Item>
        );
      }}
    />
  );
};