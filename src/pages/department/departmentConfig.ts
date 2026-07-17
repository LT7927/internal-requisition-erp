import { z } from 'zod';
import { FormFieldConfig } from '../../components/common/formTypes';
import { TableConfig } from '../../components/common/tableTypes';

import API_BASE_URL from '../../api'; 

export const DEPARTMENT_API = `${API_BASE_URL}/categories/departments`;

export const departmentSchema = z.object({
  code: z.string().min(2, 'Mã phòng ban phải chứa ít nhất 2 ký tự').toUpperCase(),
  name: z.string().min(3, 'Tên phòng ban không được dưới 3 ký tự'),
  description: z.string().optional(),
});

export const departmentFormFields: FormFieldConfig[] = [
  { name: 'code', label: 'Mã phòng ban', type: 'text', placeholder: 'Nhập mã phòng ban', span: 12 },
  { name: 'name', label: 'Tên phòng ban', type: 'text', placeholder: 'Nhập tên phòng ban', span: 12 },
  { name: 'description', label: 'Ghi chú / Mô tả', type: 'textarea', placeholder: 'Nhập thông tin mô tả chi tiết...', span: 24 }
];

export const departmentTableConfig: TableConfig = {
  apiEndpoint: DEPARTMENT_API,
  rowKey: 'id',
  columns: [
    {
      title: 'Mã Phòng',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => `[${text}]`, 
    },
    {
      title: 'Tên Phòng Ban',
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