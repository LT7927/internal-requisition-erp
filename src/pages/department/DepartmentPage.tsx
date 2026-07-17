import { useState, useMemo } from 'react';
import { Card, Button, Space, Tooltip, Modal, Drawer, Descriptions, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import DynamicTable from '../../components/common/DynamicTable';
import DynamicForm from '../../components/common/DynamicForm';
import axiosClient from '../../utils/axiosClient';
import { departmentTableConfig, departmentFormFields, departmentSchema, DEPARTMENT_API } from './departmentConfig';

const { confirm } = Modal;

const DepartmentPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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

  // --- XỬ LÝ XÓA DỮ LIỆU ---
  const handleDelete = (record: any) => {
    confirm({
      title: 'Xác nhận xóa phòng ban',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa phòng ban [${record.code}] - ${record.name} không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await axiosClient.delete(`${DEPARTMENT_API}/${record.id}`);
          message.success('Xóa phòng ban thành công!');
          triggerTableRefresh();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
      },
    });
  };

  // --- BƠM CỘT HÀNH ĐỘNG VÀO BẢN VẼ BẢNG ---
  const tableConfigWithActions = useMemo(() => {
    return {
      ...departmentTableConfig,
      columns: [
        ...departmentTableConfig.columns,
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
      <Card 
        title="QUẢN LÝ PHÒNG BAN" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            Thêm Phòng Ban
          </Button>
        }
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <DynamicTable config={tableConfigWithActions} />
      </Card>

      {/* HỘP THOẠI THÊM / SỬA */}
      <Modal
        title={modalMode === 'create' ? 'THÊM PHÒNG BAN MỚI' : 'CẬP NHẬT PHÒNG BAN'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null} // Tắt nút mặc định vì DynamicForm đã có nút Lưu
        destroyOnClose // Rất quan trọng: Xóa rác của Form khi đóng hộp thoại
      >
        <DynamicForm 
          fields={departmentFormFields}
          schema={departmentSchema}
          // Chuyển đổi API động dựa theo chế độ Thêm hay Sửa
          apiEndpoint={modalMode === 'create' ? DEPARTMENT_API : `${DEPARTMENT_API}/${selectedRecord?.id}`}
          method={modalMode === 'create' ? 'POST' : 'PUT'}
          initialValues={selectedRecord}
          onSuccess={handleFormSuccess}
          submitBtnText={modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        />
      </Modal>

      {/* NGĂN KÉO XEM CHI TIẾT */}
      <Drawer
        title="CHI TIẾT PHÒNG BAN"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={450}
      >
        {selectedRecord && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Mã Phòng" labelStyle={{ width: '120px', fontWeight: 'bold' }}>
              {selectedRecord.code}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Phòng" labelStyle={{ fontWeight: 'bold' }}>
              {selectedRecord.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" labelStyle={{ fontWeight: 'bold' }}>
              {selectedRecord.description || 'Không có mô tả'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
};

export default DepartmentPage;