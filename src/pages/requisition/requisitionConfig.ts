import { z } from 'zod';
import { FormFieldConfig } from '../../components/common/formTypes';
import { TableConfig } from '../../components/common/tableTypes';
import API_BASE_URL from '../../api';

export const REQUISITION_API = `${API_BASE_URL}/requisitions`;
export const MY_REQUISITIONS_API = `${API_BASE_URL}/requisitions/my`;

// Kiểm duyệt Form Validate
export const requisitionSchema = z.object({
  title: z.string({ message: "Vui lòng nhập tiêu đề yêu cầu" }).min(1, "Vui lòng nhập tiêu đề yêu cầu"),
  description: z.string({ message: "Vui lòng nhập mô tả chi tiết" }).min(1, "Vui lòng nhập mô tả chi tiết"),
  type_id: z.number({ message: "Vui lòng chọn loại chi phí" }),
  amount: z.number({ message: "Vui lòng nhập số tiền" }).min(1000, "Số tiền tối thiểu là 1,000 VND"),
  currency: z.string().default("VND"),
});

// Cấu hình Form 
export const requisitionFormFields: FormFieldConfig[] = [
  { name: 'title', label: 'Tiêu đề Yêu cầu', type: 'text', placeholder: 'Nhập tiêu đề yêu cầu', span: 24 },
  { 
    name: 'type_id', 
    label: 'Phân loại chi phí', 
    type: 'select', 
    apiEndpoint: `${API_BASE_URL}/categories/types`, 
    placeholder: 'Chọn loại chi phí...', 
    span: 12 
  },
  { name: 'amount', label: 'Số tiền dự kiến', type: 'number', placeholder: 'Nhập số tiền', span: 8 },
  { 
    name: 'currency', 
    label: 'Loại tiền', 
    type: 'select', 
    options: [{ label: 'VND', value: 'VND' }, { label: 'USD', value: 'USD' }],
    span: 4 
  },
  { name: 'description', label: 'Mô tả chi tiết / Lý do', type: 'textarea', placeholder: 'Mô tả chi tiết mục đích, số lượng...', span: 24 }
];

// Cấu hình Bảng hiển thị
export const requisitionTableConfig: TableConfig = {
  apiEndpoint: MY_REQUISITIONS_API,
  rowKey: 'id',
  columns: [
    {
      title: 'Mã Phiếu',
      dataIndex: 'requisition_number',
      key: 'requisition_number',
      width: 140,
      render: (text: string) => `[${text}]`,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Loại chi phí',
      dataIndex: 'type_name',
      key: 'type_name',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number, record: any) => {
        return `${new Intl.NumberFormat('vi-VN').format(amount)} ${record.currency}`;
      }
    }
  ],
  filterConfigs: [
    {
      name: 'status',
      placeholder: 'Lọc theo trạng thái',
      options: [
        { label: 'Tất cả', value: '' },
        { label: 'Chờ Quản lý duyệt', value: 'PENDING_MANAGER' },
        { label: 'Chờ Admin duyệt', value: 'PENDING_ADMIN' },
        { label: 'Đã phê duyệt', value: 'APPROVED' },
        { label: 'Đã từ chối', value: 'REJECTED' },
        { label: 'Đã hủy', value: 'CANCELLED' }
      ]
    }
  ]
};