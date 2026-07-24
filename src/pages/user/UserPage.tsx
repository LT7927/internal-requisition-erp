import { useState, useMemo } from 'react';
import { Card, Button, Space, Tooltip, Modal, Drawer, Descriptions, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined, KeyOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import DynamicTable from '../../components/common/DynamicTable';
import DynamicForm from '../../components/common/DynamicForm';
import axiosClient from '../../utils/axiosClient';
import { userTableConfig, userFormFields, userSchema, USER_API,resetPasswordFields,resetPasswordSchema } from './userConfig';

const { confirm } = Modal;

const UserPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const currentUserRole = 'MANAGER'; 

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

  const handleOpenResetPassword = (record: any) => {
    setSelectedRecord(record);
    setIsResetModalVisible(true);
  };

  const triggerTableRefresh = () => {
    searchParams.set('t', Date.now().toString());
    setSearchParams(searchParams);
  };

  const handleFormSuccess = () => {
    setIsModalVisible(false);
    setIsResetModalVisible(false);
    triggerTableRefresh();
  };

  // Xử lý xoá nv
  const handleDelete = (record: any) => {
    confirm({
      title: 'Xác nhận xóa nhân viên',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa tài khoản của [${record.full_name}] không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await axiosClient.delete(`${USER_API}/${record.id}`);
          message.success('Xóa nhân viên thành công!');
          triggerTableRefresh();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
      },
    });
  };

  // Cột hành động của bảng
  const tableConfigWithActions = useMemo(() => {
    return {
      ...userTableConfig,
      columns: [
        ...userTableConfig.columns,
        {
          title: 'Hành động',
          key: 'actions',
          width: 200,
          align: 'center' as const,
          render: (_: any, record: any) => (
            <Space size="middle">
              <Tooltip title="Xem chi tiết">
                <Button type="text" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => handleView(record)} />
              </Tooltip>
              <Tooltip title="Chỉnh sửa">
                <Button type="text" icon={<EditOutlined />} style={{ color: '#faad14' }} onClick={() => handleEdit(record)} />
              </Tooltip>
              
              {(currentUserRole === 'MANAGER' || currentUserRole === 'ADMIN') && (
                <Tooltip title="Reset Mật Khẩu">
                  <Button type="text" icon={<KeyOutlined />} style={{ color: '#52c41a' }} onClick={() => handleOpenResetPassword(record)} />
                </Tooltip>
              )}

              <Tooltip title="Xóa">
                <Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
              </Tooltip>
            </Space>
          ),
        },
      ],
    };
  }, [currentUserRole]);

  return (
    <>
      <Card 
        title="QUẢN LÝ NHÂN VIÊN" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            Thêm Nhân Viên
          </Button>
        }
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <DynamicTable config={tableConfigWithActions} />
      </Card>

      {/* Thêm / Sửa User */}
      <Modal
        title={modalMode === 'create' ? 'THÊM NHÂN VIÊN MỚI' : 'CẬP NHẬT THÔNG TIN'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden 
      >
        <DynamicForm 
          fields={userFormFields}
          schema={userSchema}
          apiEndpoint={modalMode === 'create' ? USER_API : `${USER_API}/${selectedRecord?.id}`}
          method={modalMode === 'create' ? 'POST' : 'PUT'}
          initialValues={selectedRecord}
          onSuccess={handleFormSuccess}
          submitBtnText={modalMode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
        />
      </Modal>

      {/* Reset mật khẩu */}
      <Modal
        title={`ĐẶT LẠI MẬT KHẨU - ${selectedRecord?.full_name}`}
        open={isResetModalVisible}
        onCancel={() => setIsResetModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <DynamicForm 
          fields={resetPasswordFields}
          schema={resetPasswordSchema}
          apiEndpoint={`${USER_API}/${selectedRecord?.id}/reset-password`}
          method="PUT"
          onSuccess={handleFormSuccess}
          submitBtnText="Xác nhận đổi mật khẩu"
        />
      </Modal>

      {/* Xem chi tiết User */}
      <Drawer
        title="HỒ SƠ NHÂN VIÊN"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        size="default"
      >
        {selectedRecord && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Họ và Tên" labelStyle={{ width: '130px', fontWeight: 'bold' }}>
              {selectedRecord.full_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email đăng nhập" labelStyle={{ fontWeight: 'bold' }}>
              {selectedRecord.email}
            </Descriptions.Item>
            <Descriptions.Item label="Chức vụ" labelStyle={{ fontWeight: 'bold' }}>
              <Tag color={selectedRecord.role === 'ADMIN' ? 'red' : selectedRecord.role === 'MANAGER' ? 'blue' : 'green'}>
                {selectedRecord.role}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phòng ban" labelStyle={{ fontWeight: 'bold' }}>
              {selectedRecord.department_name || 'Chưa điều phối'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" labelStyle={{ fontWeight: 'bold' }}>
              <Tag color={selectedRecord.is_active ? 'success' : 'error'}>
                {selectedRecord.is_active ? 'Đang hoạt động' : 'Đã khóa'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  );
};

export default UserPage;