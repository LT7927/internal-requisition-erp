import { TableConfig } from '../../components/common/tableTypes';
import API_BASE_URL from '../../api';

export const PENDING_APPROVALS_API = `${API_BASE_URL}/requisitions/pending-approvals`;
export const APPROVAL_HISTORY_API = `${API_BASE_URL}/approvals/history`;

// Cấu hình Bảng hiển thị
export const approvalTableConfig: TableConfig = {
  apiEndpoint: PENDING_APPROVALS_API,
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
      title: 'Người yêu cầu',
      dataIndex: 'requester_name',
      key: 'requester_name',
      width: 160,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department_name',
      key: 'department_name',
    },
    {
      title: 'Tiêu đề Yêu cầu',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
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
      placeholder: 'Lọc trạng thái',
      options: [
        { label: 'Chờ Quản lý duyệt', value: 'PENDING_MANAGER' },
        { label: 'Chờ Admin duyệt', value: 'PENDING_ADMIN' }
      ]
    }
  ]
};