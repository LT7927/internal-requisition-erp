import DynamicForm from '../../components/common/DynamicForm';
import { FormFieldConfig } from '../../components/common/formTypes';

interface DepartmentFormProps {
  onSubmit: (data: any) => void;
  initialValues?: any;
  loading?: boolean;
}

const DepartmentForm = ({ onSubmit, initialValues, loading }: DepartmentFormProps) => {
  // Bản vẽ JSON mô tả cấu trúc Form của Phòng ban theo Swagger
  const fields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Tên phòng ban',
      type: 'text',
      placeholder: 'Nhập tên phòng ban (VD: Phòng Nhân sự)',
      rules: { required: 'Tên phòng ban không được để trống!' },
      span: 24, // Chiếm trọn chiều rộng dòng
    },
    {
      name: 'code',
      label: 'Mã phòng ban',
      type: 'text',
      placeholder: 'Nhập mã viết tắt (VD: HR, IT, MKT)',
      rules: { required: 'Mã phòng ban không được để trống!' },
      span: 24,
    },
    {
      name: 'description',
      label: 'Mô tả chi tiết',
      type: 'textarea',
      placeholder: 'Nhập mô tả ngắn về chức năng phòng ban...',
      span: 24,
    }
  ];

  return (
    <DynamicForm
      fields={fields}
      onSubmit={onSubmit}
      initialValues={initialValues}
      loading={loading}
      submitBtnText={initialValues ? 'Cập nhật phòng ban' : 'Tạo phòng ban mới'}
    />
  );
};

export default DepartmentForm;