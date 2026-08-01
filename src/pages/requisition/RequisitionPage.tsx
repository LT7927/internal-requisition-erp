import { useState, useMemo } from 'react';
import { Card, Button, Space, Tooltip, Modal, Drawer, Descriptions, message, Tag, Input, Timeline } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import DynamicTable from '../../components/common/DynamicTable';
import DynamicForm from '../../components/common/DynamicForm';
import axiosClient from '../../utils/axiosClient';
import { requisitionTableConfig, requisitionFormFields, requisitionSchema, REQUISITION_API } from './requisitionConfig';

const RequisitionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

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
      const res: any = await axiosClient.get(`${REQUISITION_API}/${record.id}`);
      const data = res.data?.data || res.data || record;
      setSelectedRecord(data);
      setIsDrawerVisible(true);
    } catch (error) {
      message.error('Không thể tải chi tiết phiếu yêu cầu!');
    }
  };

  const handleOpenCancelModal = (record: any) => {
    setSelectedRecord(record);
    setCancelReason('');
    setIsCancelModalVisible(true);
  };

  const triggerTableRefresh = () => {
    searchParams.set('t', Date.now().toString());
    setSearchParams(searchParams);
  };

  const handleFormSuccess = () => {
    setIsModalVisible(false);
    triggerTableRefresh();
  };

  // Hàm xử lý huỷ yêu cầu
  const submitCancelRequisition = async () => {
    if (!cancelReason.trim()) {
      message.warning('Vui lòng nhập lý do hủy phiếu!');
      return;
    }

    setIsCancelling(true);
    try {
      // Delete cho phép truyền request body thông qua thuộc tính 'data'
      await axiosClient.delete(`${REQUISITION_API}/${selectedRecord.id}`, {
        data: { cancellation_reason: cancelReason }
      });
      message.success('Đã hủy phiếu yêu cầu thành công!');
      setIsCancelModalVisible(false);
      triggerTableRefresh();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy phiếu');
    } finally {
      setIsCancelling(false);
    }
  };

  // Hàm render trạng thái
  const renderStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string, text: string }> = {
      PENDING_MANAGER: { color: 'orange', text: 'Chờ Quản lý duyệt' },
      PENDING_ADMIN: { color: 'geekblue', text: 'Chờ Admin duyệt' },
      APPROVED: { color: 'success', text: 'Đã phê duyệt' },
      REJECTED: { color: 'error', text: 'Bị từ chối' },
      CANCELLED: { color: 'default', text: 'Đã hủy' }
    };
    const mapped = statusMap[status] || { color: 'default', text: status };
    return <Tag color={mapped.color}>{mapped.text}</Tag>;
  };

  // Cột hành động của bảng
  const tableConfigWithActions = useMemo(() => {
    return {
      ...requisitionTableConfig,
      columns: [
        ...requisitionTableConfig.columns,
        {
          title: 'Trạng thái',
          dataIndex: 'status',
          key: 'status',
          align: 'center' as const,
          render: (status: string) => renderStatusTag(status)
        },
        {
          title: 'Hành động',
          key: 'actions',
          width: 150,
          align: 'center' as const,
          render: (_: any, record: any) => {
            // Chỉ cho phép Sửa/Hủy khi đang chờ quản lý
            const isEditable = record.status === 'PENDING_MANAGER';

            return (
              <Space size="middle">
                <Tooltip title="Xem chi tiết">
                  <Button type="text" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => handleView(record)} />
                </Tooltip>
                
                {isEditable && (
                  <Tooltip title="Chỉnh sửa">
                    <Button type="text" icon={<EditOutlined />} style={{ color: '#faad14' }} onClick={() => handleEdit(record)} />
                  </Tooltip>
                )}

                {isEditable && (
                  <Tooltip title="Hủy phiếu">
                    <Button type="text" icon={<StopOutlined />} danger onClick={() => handleOpenCancelModal(record)} />
                  </Tooltip>
                )}
              </Space>
            );
          },
        },
      ],
    };
  }, []);

  return (
    <>
      <Card 
        title="DANH SÁCH YÊU CẦU CỦA TÔI" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            Tạo Yêu Cầu Mới
          </Button>
        }
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <DynamicTable config={tableConfigWithActions} />
      </Card>

      {/* Thêm sửa yêu cầu */}
      <Modal
        title={modalMode === 'create' ? 'TẠO YÊU CẦU MỚI' : `CẬP NHẬT YÊU CẦU: ${selectedRecord?.requisition_number}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
        width={700}
      >
        <DynamicForm 
          fields={requisitionFormFields}
          schema={requisitionSchema}
          apiEndpoint={modalMode === 'create' ? REQUISITION_API : `${REQUISITION_API}/${selectedRecord?.id}`}
          method={modalMode === 'create' ? 'POST' : 'PUT'}
          initialValues={selectedRecord}
          onSuccess={handleFormSuccess}
          submitBtnText={modalMode === 'create' ? 'Gửi yêu cầu' : 'Lưu thay đổi'}
        />
      </Modal>

      {/* Modal lý do huỷ */}
      <Modal
        title={`HỦY PHIẾU YÊU CẦU - ${selectedRecord?.requisition_number}`}
        open={isCancelModalVisible}
        onCancel={() => setIsCancelModalVisible(false)}
        onOk={submitCancelRequisition}
        confirmLoading={isCancelling}
        okText="Xác nhận Hủy"
        cancelText="Quay lại"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginBottom: 16 }}>
          Bạn có chắc chắn muốn hủy phiếu yêu cầu <strong>{selectedRecord?.title}</strong> không? Hành động này không thể hoàn tác.
        </div>
        <Input.TextArea 
          rows={3} 
          placeholder="Vui lòng nhập lý do hủy phiếu (Bắt buộc)..." 
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>

      {/* Xem chi tiết */}
      <Drawer
        title={`CHI TIẾT YÊU CẦU: ${selectedRecord?.requisition_number}`}
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        size="large"
      >
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Descriptions column={2} bordered size="middle">
              <Descriptions.Item label="Tiêu đề" span={2} labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.title}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại" labelStyle={{ fontWeight: 'bold' }}>
                {renderStatusTag(selectedRecord.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Loại chi phí" labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.type_name}
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền" labelStyle={{ fontWeight: 'bold' }}>
                <span style={{ color: 'red', fontWeight: 'bold' }}>
                  {new Intl.NumberFormat('vi-VN').format(selectedRecord.amount)} {selectedRecord.currency}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban" labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.department_name}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do / Mô tả" span={2} labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.description}
              </Descriptions.Item>
              
              {/* Nếu phiếu bị từ chối/hủy, hiển thị thêm lý do */}
              {(selectedRecord.rejection_reason || selectedRecord.status === 'CANCELLED') && (
                <Descriptions.Item label="Lý do Từ chối/Hủy" span={2} labelStyle={{ fontWeight: 'bold', color: 'red' }}>
                  {selectedRecord.rejection_reason || 'Do người dùng chủ động hủy'}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Hiển thị lịch sử phê duyệt */}
            {selectedRecord.approval_logs && selectedRecord.approval_logs.length > 0 && (
              <Card title="LỊCH SỬ PHÊ DUYỆT" size="small" type="inner">
                <Timeline style={{ marginTop: 16 }}>
                  {selectedRecord.approval_logs.map((log: any) => (
                    <Timeline.Item key={log.id} color={log.action === 'APPROVED' ? 'green' : 'red'}>
                      <div style={{ marginBottom: 4 }}>
                        <strong>{log.approver_name}</strong> <i>({log.approver_role})</i> đã <strong>{log.action === 'APPROVED' ? 'Duyệt' : 'Từ chối'}</strong>
                      </div>
                      {log.comments && (
                        <div style={{ color: '#666' }}>Lý do/Ghi chú: {log.comments}</div>
                      )}
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Thời gian: {new Date(log.created_at).toLocaleString('vi-VN')}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
};

export default RequisitionPage;