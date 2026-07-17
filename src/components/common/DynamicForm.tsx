import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button, Row, Col, message } from 'antd';
import { DynamicFormProps } from './formTypes';
import { FormFieldRenderer } from './FormFields';
import axiosClient from '../../utils/axiosClient';

const DynamicForm = ({
  fields,
  schema, 
  apiEndpoint, 
  method = 'POST', 
  onSubmit,
  onSuccess,
  submitBtnText = 'Lưu dữ liệu',
  initialValues,
}: DynamicFormProps) => {
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues || {},
    resolver: schema ? zodResolver(schema) : undefined, 
  });

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  // Giải quyết lỗi undefined: Định nghĩa hàm này để đảm bảo handleSubmit luôn nhận được 1 function hợp lệ
  const handleInternalSubmit = async (data: any) => {
    if (onSubmit) {
      onSubmit(data);
      return;
    }

    if (apiEndpoint) {
      setIsSubmitting(true);
      try {
        if (method === 'POST') {
          await axiosClient.post(apiEndpoint, data);
        } else {
          await axiosClient.put(apiEndpoint, data);
        }
        message.success('Thao tác thành công!');
        if (onSuccess) onSuccess(); 
      } catch (error: any) {
        message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.warn("DynamicForm: Thiếu apiEndpoint hoặc onSubmit");
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(handleInternalSubmit)}>
      <Row gutter={[16, 0]}>
        {fields.map((field) => (
          <Col key={field.name} span={field.span || 24}>
            <FormFieldRenderer fieldConfig={field} control={control} />
          </Col>
        ))}
      </Row>

      <Form.Item style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={isSubmitting} block>
          {submitBtnText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DynamicForm;