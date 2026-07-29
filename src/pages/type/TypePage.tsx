import { useState, useMemo } from 'react';
import { Card, Button, Space, Tooltip, Modal, Drawer, Descriptions, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import DynamicTable from '../../components/common/DynamicTable';
import DynamicForm from '../../components/common/DynamicForm';
import axiosClient from '../../utils/axiosClient';
import { typeTableConfig, typeFormFields, typeSchema, TYPE_API } from './typeConfig';

const { confirm } = Modal;

const TypePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Xử lý mở giao diện
  const handleCreateNew = () => {
    setModalMode('create');
    setSelectedRecord(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setModalMode('edit');
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const handleView = (record: any) => {
    setSelectedRecord(record);
    setIsDrawerVisible(true);
  };

  const triggerTableRefresh = () => {
    searchParams.set('t', Date.now().toString());
    setSearchParams(searchParams);
  };

  const handleFormSuccess = () => {
    setIsModalVisible(false);
    triggerTableRefresh();
  };

  // Xử lý xoá dữ liệu
  const handleDelete = (record: any) => {
    confirm({
      title: 'Xác nhận xóa loại chi phí',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa loại chi phí [${record.code}] - ${record.name} không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await axiosClient.delete(`${TYPE_API}/${record.id}`);
          message.success('Xóa loại chi phí thành công!');
          triggerTableRefresh();
        } catch (error: any) {
          // Bắt lỗi 403
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
      },
    });
  };

  // Cột hành động của bảng
  const tableConfigWithActions = useMemo(() => {
    return {
      ...typeTableConfig,
      columns: [
        ...typeTableConfig.columns,
        {
          title: 'Hành động',
          key: 'actions',
          width: 180,
          align: 'center' as const,
          render: (_: any, record: any) => (
            <Space size="middle">
              <Tooltip title="Xem chi tiết">
                <Button type="text" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => handleView(record)} />
              </Tooltip>
              <Tooltip title="Chỉnh sửa">
                <Button type="text" icon={<EditOutlined />} style={{ color: '#faad14' }} onClick={() => handleEdit(record)} />
              </Tooltip>
              <Tooltip title="Xóa">
                <Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
              </Tooltip>
            </Space>
          ),
        },
      ],
    };
  }, []);

  return (
    <>
      {/* Danh sách loại chi phí */}
      <Card 
        title="DANH MỤC LOẠI CHI PHÍ" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            Thêm Loại Chi Phí
          </Button>
        }
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <DynamicTable config={tableConfigWithActions} />
      </Card>

      {/* Form tạo / cập nhập */}
      <Modal
        title={modalMode === 'create' ? 'THÊM LOẠI CHI PHÍ MỚI' : 'CẬP NHẬT LOẠI CHI PHÍ'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden 
      >
        <DynamicForm 
          fields={typeFormFields}
          schema={typeSchema}
          apiEndpoint={modalMode === 'create' ? TYPE_API : `${TYPE_API}/${selectedRecord?.id}`}
          method={modalMode === 'create' ? 'POST' : 'PUT'}
          initialValues={selectedRecord}
          onSuccess={handleFormSuccess}
          submitBtnText={modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        />
      </Modal>

      {/* Xem chi tiết */}
      <Drawer
        title="CHI TIẾT LOẠI CHI PHÍ"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        size="default"
      >
        {selectedRecord && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Mã Loại" labelStyle={{ width: '150px', fontWeight: 'bold' }}>
              <Tag color="blue">{selectedRecord.code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên Loại" labelStyle={{ fontWeight: 'bold' }}>
              {selectedRecord.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" labelStyle={{ fontWeight: 'bold' }}>
              {selectedRecord.description || 'Không có mô tả'}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng yêu cầu" labelStyle={{ fontWeight: 'bold' }}>
              {selectedRecord.requisition_count !== undefined 
                ? `${selectedRecord.requisition_count} phiếu` 
                : 'Chưa có số liệu'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" labelStyle={{ fontWeight: 'bold' }}>
              <Tag color={selectedRecord.is_active ? 'success' : 'error'}>
                {selectedRecord.is_active ? 'Đang áp dụng' : 'Ngừng áp dụng'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
};

export default TypePage;