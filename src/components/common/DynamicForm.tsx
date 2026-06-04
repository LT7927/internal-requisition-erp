import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Row, Col } from 'antd';
import { DynamicFormProps } from './formTypes';
import { FormFieldRenderer } from './FormFields';

const DynamicForm = ({
  fields,
  onSubmit,
  submitBtnText = 'Lưu dữ liệu',
  loading = false,
  initialValues,
}: DynamicFormProps) => {
  
  // Khởi tạo React Hook Form
  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues || {},
  });

  // Theo dõi nếu dữ liệu ban đầu (initialValues) thay đổi (VD: khi API lấy data sửa về muộn), tự động rải lại vào form
  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Row gutter={[16, 0]}>
        {fields.map((field) => (
          // Sử dụng thuộc tính 'span' từ JSON để chia cột (Mặc định full màn hình = 24)
          <Col key={field.name} span={field.span || 24}>
            <FormFieldRenderer fieldConfig={field} control={control} />
          </Col>
        ))}
      </Row>

      {/* Khu vực nút bấm Submit hành động */}
      <Form.Item style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {submitBtnText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DynamicForm;