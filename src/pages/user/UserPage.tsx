import { useState, useMemo } from 'react';
import { Card, Button, Space, Tooltip, Modal, Drawer, Descriptions, message, Tag, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, ExclamationCircleOutlined, KeyOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import DynamicTable from '../../components/common/DynamicTable';
import DynamicForm from '../../components/common/DynamicForm';
import axiosClient from '../../utils/axiosClient';
import { userTableConfig,  userFormFields,  userSchema,  USER_API, resetPasswordFields, resetPasswordSchema } from './userConfig';

const { confirm } = Modal;

const UserPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserRole = userData?.role || 'ADMIN'; 

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

  const handleView = async (record: any) => {
    try {
      const res: any = await axiosClient.get(`${USER_API}/${record.id}`);
      const data = res.data?.data || res.data;
      setSelectedRecord(data);
      setIsDrawerVisible(true);
    } catch (error) {
      setSelectedRecord(record);
      setIsDrawerVisible(true);
    }
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

  // Hàm xử lý đóng mở tài khoản
  const handleToggleStatus = (record: any) => {
    const isCurrentlyActive = record.is_active === true || record.is_active === 1;
    const actionText = isCurrentlyActive ? 'Khóa' : 'Mở khóa';

    confirm({
      title: `Xác nhận ${actionText.toLowerCase()} tài khoản`,
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn ${actionText.toLowerCase()} tài khoản truy cập của nhân viên [${record.full_name}] không?`,
      okText: actionText,
      okType: isCurrentlyActive ? 'danger' : 'primary',
      cancelText: 'Hủy',
      async onOk() {
        try {
          if (isCurrentlyActive) {
            // Khi khoá: Gọi phương thức DELETE
            await axiosClient.delete(`${USER_API}/${record.id}`);
          } else {
            // Khi MỞ khoá: Gọi phương thức PUT để kích hoạt lại
            await axiosClient.put(`${USER_API}/${record.id}`, {
              email: record.email,
              full_name: record.full_name,
              role: record.role,
              department_id: record.department_id,
              is_active: true
            });
          }
          
          message.success(`${actionText} tài khoản thành công!`);
          triggerTableRefresh();
        } catch (error: any) {
          message.error(error.response?.data?.message || `Có lỗi xảy ra khi ${actionText.toLowerCase()} tài khoản`);
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
          title: 'Trạng thái',
          dataIndex: 'is_active',
          key: 'is_active',
          align: 'center' as const,
          render: (isActive: any) => {
            const active = isActive === true || isActive === 1;
            return (
              <Tag color={active ? 'success' : 'error'}>
                {active ? 'Hoạt động' : 'Đã khóa'}
              </Tag>
            );
          }
        },
        {
          title: 'Hành động',
          key: 'actions',
          width: 220,
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
                  <Button type="text" icon={<KeyOutlined />} style={{ color: '#fa8c16' }} onClick={() => handleOpenResetPassword(record)} />
                </Tooltip>
              )}

              {/* Nút Khóa / Mở Khóa Động */}
              <Tooltip title={record.is_active === true || record.is_active === 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                <Button 
                  type="text" 
                  icon={record.is_active === true || record.is_active === 1 ? <LockOutlined /> : <UnlockOutlined />} 
                  danger={record.is_active === true || record.is_active === 1}
                  style={record.is_active !== true && record.is_active !== 1 ? { color: '#52c41a' } : {}}
                  onClick={() => handleToggleStatus(record)} 
                />
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
          method="POST"
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Họ và Tên" labelStyle={{ width: '130px', fontWeight: 'bold' }}>
                {selectedRecord.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Tên đăng nhập" labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.username}
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
                <Tag color={selectedRecord.is_active === true || selectedRecord.is_active === 1 ? 'success' : 'error'}>
                  {selectedRecord.is_active === true || selectedRecord.is_active === 1 ? 'Đang hoạt động' : 'Đã khóa'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Hiển thị thống kê */}
            {selectedRecord.requisition_stats && (
              <Card title="Thống Kê Yêu Cầu" size="small" type="inner">
                <Row gutter={16} style={{ textAlign: 'center' }}>
                  <Col span={8}>
                    <Statistic title="Tổng số" value={selectedRecord.requisition_stats.total_requisitions} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Đã duyệt" value={selectedRecord.requisition_stats.approved} valueStyle={{ color: '#3f8600' }} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Đang chờ" value={selectedRecord.requisition_stats.pending} valueStyle={{ color: '#faad14' }} />
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
};

export default UserPage;