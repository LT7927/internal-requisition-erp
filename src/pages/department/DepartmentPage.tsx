import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Modal, Space, message, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axiosClient from '../../utils/axiosClient';
import DynamicTable from '../../components/common/DynamicTable';
import { TableParams } from '../../components/common/tableTypes';
import DepartmentForm from './DepartmentForm';
import DepartmentDetail from './DepartmentDetail';

const DepartmentPage = () => {
  const queryClient = useQueryClient();

  // 1. Quản lý State bộ lọc và phân trang (Truyền xuống Table Common)
  const [params, setParams] = useState<TableParams>({
    page: 1,
    pageSize: 10,
    search: undefined,
    filters: undefined,
  });

  // Các State quản lý trạng thái Đóng/Mở các Modal hội thoại UI
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null);
  const [viewingDepartmentId, setViewingDepartmentId] = useState<string | null>(null);

  // ================= 2. GỌI API BẰNG TANSTACK QUERY (GET LIST) =================
  const { data, isLoading } = useQuery({
    queryKey: ['departments', params], // Mỗi khi params đổi, TanStack tự động fetch lại API mới
    queryFn: async () => {
      const response: any = await axiosClient.get('/api/categories/departments', {
        params: {
          page: params.page,
          limit: params.pageSize,
          search: params.search,
        },
      });
      return response; // Giả định backend trả về cấu hình: { data: [...], total: 45 }
    },
  });

  // Lấy chi tiết một phòng ban (bao gồm list user) khi click xem chi tiết
  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ['department-detail', viewingDepartmentId],
    queryFn: async () => {
      if (!viewingDepartmentId) return null;
      return await axiosClient.get(`/api/categories/departments/${viewingDepartmentId}`);
    },
    enabled: !!viewingDepartmentId, // Chỉ tự kích hoạt gọi API khi biến id này có giá trị cụ thể
  });

  // ================= 3. XỬ LÝ MUTATIONS (POST, PUT, DELETE) =================
  // Mutation xử lý việc Thêm mới hoặc Cập nhật phòng ban
  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (editingDepartment) {
        // Nếu có data cũ -> Đang sửa (PUT /api/categories/departments/{id})
        return await axiosClient.put(`/api/categories/departments/${editingDepartment.id}`, formData);
      } else {
        // Không có data cũ -> Đang thêm mới (POST /api/categories/departments - Admin only)
        return await axiosClient.post('/api/categories/departments', formData);
      }
    },
    onSuccess: () => {
      message.success(editingDepartment ? 'Cập nhật phòng ban thành công!' : 'Tạo mới phòng ban thành công!');
      setIsFormModalOpen(false);
      setEditingDepartment(null);
      // Ép lệnh cho TanStack Query làm tươi lại bộ nhớ đệm, tự động reload lại bảng dữ liệu
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => message.error('Đã xảy ra lỗi khi lưu dữ liệu!'),
  });

  // Mutation xử lý việc Xóa một phòng ban (DELETE /api/categories/departments/{id})
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await axiosClient.delete(`/api/categories/departments/${id}`),
    onSuccess: () => {
      message.success('Xóa phòng ban thành công!');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => message.error('Không thể xóa phòng ban này!'),
  });

  // ================= 4. ĐỊNH NGHĨA CÁC CỘT HIỂN THỊ CỦA BẢNG =================
  const columns = [
    { title: 'Mã phòng ban', dataIndex: 'code', key: 'code', width: '20%' },
    { title: 'Tên phòng ban', dataIndex: 'name', key: 'name', width: '30%' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', width: '35%' },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => { setViewingDepartmentId(record.id); setIsDetailModalOpen(true); }} 
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa (Admin only)">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => { setEditingDepartment(record); setIsFormModalOpen(true); }} 
            />
          </Tooltip>
          <Tooltip title="Xóa phòng ban">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa phòng ban này không?"
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="Có"
              cancelText="Hủy"
            >
              <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="QUẢN LÝ DANH MỤC PHÒNG BAN" 
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => { setEditingDepartment(null); setIsFormModalOpen(true); }}
        >
          Thêm phòng ban mới
        </Button>
      }
    >
      {/* RÁP NỐI TABLE COMMON VÀO ĐÂY */}
      <DynamicTable
        columns={columns}
        dataSource={data?.data || []} // Đổ mảng dữ liệu lấy từ API
        totalItems={data?.total || 0} // Tổng số lượng bản ghi thực tế để tính số trang
        isLoading={isLoading}
        params={params}
        onParamsChange={setParams} // Hàm đồng bộ hóa khi user search hoặc phân trang
        searchPlaceholder="Tìm kiếm theo tên hoặc mã..."
      />

      {/* MODAL CHỨA FORM THÊM / SỬA PHÒNG BAN */}
      <Modal
        title={editingDepartment ? "CẬP NHẬT PHÒNG BAN" : "THÊM PHÒNG BAN MỚI"}
        open={isFormModalOpen}
        onCancel={() => { setIsFormModalOpen(false); setEditingDepartment(null); }}
        footer={null} // Ẩn nút default footer để dùng nút Submit của Form Common điều khiển
        destroyOnClose // Tự động hủy xóa form khi đóng modal để xóa trắng dữ liệu thừa
      >
        <DepartmentForm 
          onSubmit={(formData) => saveMutation.mutate(formData)} 
          initialValues={editingDepartment}
          loading={saveMutation.isPending}
        />
      </Modal>

      {/* MODAL CHỨA CHI TIẾT PHÒNG BAN VÀ LIST USER */}
      <Modal
        title="CHI TIẾT PHÒNG BAN & NHÂN SỰ"
        open={isDetailModalOpen}
        onCancel={() => { setIsDetailModalOpen(false); setViewingDepartmentId(null); }}
        footer={[
          <Button key="close" onClick={() => { setIsDetailModalOpen(false); setViewingDepartmentId(null); }}>
            Đóng lại
          </Button>
        ]}
        width={650}
        loading={isDetailLoading}
      >
        <DepartmentDetail departmentData={detailData} />
      </Modal>
    </Card>
  );
};

export default DepartmentPage;