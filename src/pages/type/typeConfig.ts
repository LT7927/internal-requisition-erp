import { z } from 'zod';
import { FormFieldConfig } from '../../components/common/formTypes';
import { TableConfig } from '../../components/common/tableTypes';
import API_BASE_URL from '../../api';

export const TYPE_API = `${API_BASE_URL}/categories/types`;

// Kiểm duyệt Form Types
export const typeSchema = z.object({
  code: z.string().min(2, 'Mã loại chi phí phải có ít nhất 2 ký tự').toUpperCase(),
  name: z.string().min(3, 'Tên loại chi phí không được dưới 3 ký tự'),
  description: z.string().optional(),
});

// Cấu hình Form
export const typeFormFields: FormFieldConfig[] = [
  { name: 'code', label: 'Mã loại chi phí', type: 'text', placeholder: 'Nhập mã loại chi phí', span: 12 },
  { name: 'name', label: 'Tên loại chi phí', type: 'text', placeholder: 'Nhập tên loại chi phí', span: 12 },
  { name: 'description', label: 'Mô tả chi tiết', type: 'textarea', placeholder: 'Nhập thông tin mô tả chi tiết...', span: 24 }
];

// Cấu hình Bảng hiển thị
export const typeTableConfig: TableConfig = {
  apiEndpoint: TYPE_API,
  rowKey: 'id',
  columns: [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => `[${text}]`, 
    },
    {
      title: 'Tên Loại Chi Phí',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true, 
    }
  ],
};