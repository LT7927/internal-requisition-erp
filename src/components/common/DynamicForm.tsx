import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button, Row, Col } from 'antd';
import { DynamicFormProps } from './formTypes';
import { FormFieldRenderer } from './FormFields';

const DynamicForm = ({
  fields,
  onSubmit,
  schema,
  submitBtnText = 'Lưu dữ liệu',
  loading = false,
  initialValues,
}: DynamicFormProps) => {
  
  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues || {},
    resolver: schema ? zodResolver(schema) : undefined, 
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Row gutter={[16, 0]}>
        {fields.map((field) => (
          <Col key={field.name} span={field.span || 24}>
            <FormFieldRenderer fieldConfig={field} control={control} />
          </Col>
        ))}
      </Row>

      <Form.Item style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {submitBtnText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DynamicForm;