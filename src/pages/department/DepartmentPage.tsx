import { useState, useMemo } from 'react';
import { Card, Button, Space, Tooltip, Modal, Drawer, Descriptions, message, Tag, Table } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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
    setIsLoadingDetail(true);
    setIsDrawerVisible(true);
    try {
      const res: any = await axiosClient.get(`${DEPARTMENT_API}/${record.id}`);
      const data = res.data?.data || res.data;
      setSelectedRecord(data);
    } catch (error) {
      message.error('Không thể tải chi tiết phòng ban!');
      setSelectedRecord(record);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const triggerTableRefresh = () => {
    searchParams.set('t', Date.now().toString());
    setSearchParams(searchParams);
  };

  const handleFormSuccess = () => {
    setIsModalVisible(false);
    triggerTableRefresh();
  };

  const handleDelete = (record: any) => {
    confirm({
      title: 'Xác nhận xóa phòng ban',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa phòng ban [${record.name}] không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await axiosClient.delete(`${DEPARTMENT_API}/${record.id}`);
          message.success('Xóa phòng ban thành công!');
          triggerTableRefresh();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể xóa phòng ban có nhân viên đang hoạt động');
        }
      },
    });
  };

  const tableConfigWithActions = useMemo(() => {
    return {
      ...departmentTableConfig,
      columns: [
        ...(departmentTableConfig.columns || []),
        {
          title: 'Hành động',
          key: 'actions',
          width: 150,
          align: 'center' as const,
          render: (_: any, record: any) => (
            <Space size="middle">
              <Tooltip title="Xem chi tiết & Nhân sự">
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

  const userColumns = [
    { 
      title: 'Họ và tên', 
      dataIndex: 'full_name', 
      key: 'full_name' 
    },
    { 
      title: 'Chức vụ', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : role === 'MANAGER' ? 'blue' : 'green'}>
          {role}
        </Tag>
      )
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'is_active', 
      key: 'is_active',
      render: (isActive: any) => {
        const active = isActive === true || isActive === 1;
        return <Tag color={active ? 'success' : 'default'}>{active ? 'Đang làm' : 'Đã nghỉ'}</Tag>;
      }
    }
  ];

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

      <Modal
        title={modalMode === 'create' ? 'THÊM PHÒNG BAN MỚI' : 'CẬP NHẬT PHÒNG BAN'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <DynamicForm 
          fields={departmentFormFields}
          schema={departmentSchema}
          apiEndpoint={modalMode === 'create' ? DEPARTMENT_API : `${DEPARTMENT_API}/${selectedRecord?.id}`}
          method={modalMode === 'create' ? 'POST' : 'PUT'}
          initialValues={selectedRecord}
          onSuccess={handleFormSuccess}
          submitBtnText={modalMode === 'create' ? 'Tạo phòng ban' : 'Lưu thay đổi'}
        />
      </Modal>

      <Drawer
        title="CHI TIẾT PHÒNG BAN"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        size="large"
      >
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã Phòng" labelStyle={{ fontWeight: 'bold' }}>
                <Tag color="purple">{selectedRecord.code}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tên Phòng" labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng Quản lý" labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.manager_count || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng Nhân sự" labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.user_count || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2} labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.description || 'Không có mô tả'}
              </Descriptions.Item>
            </Descriptions>

            <Card title="DANH SÁCH NHÂN SỰ" size="small" type="inner" styles={{ body: { padding: 0 } }}>
              <Table 
                dataSource={selectedRecord.users || []} 
                columns={userColumns} 
                rowKey="id"
                pagination={false}
                loading={isLoadingDetail}
                scroll={{ y: 300 }}
                locale={{ emptyText: 'Chưa có nhân sự nào trong phòng ban này' }}
              />
            </Card>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default DepartmentPage;