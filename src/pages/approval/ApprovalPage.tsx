import { useState, useMemo } from 'react';
import { Card, Button, Space, Tooltip, Modal, Drawer, Descriptions, message, Tag, Input, Timeline } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import DynamicTable from '../../components/common/DynamicTable';
import axiosClient from '../../utils/axiosClient';
import { approvalTableConfig, APPROVAL_HISTORY_API } from './approvalConfig';
import API_BASE_URL from '../../api';

const ApprovalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [approvalHistory, setApprovalHistory] = useState<any[]>([]);
  
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerTableRefresh = () => {
    searchParams.set('t', Date.now().toString());
    setSearchParams(searchParams);
  };

  // Xem chi tiết, ls phê duyệt
  const handleView = async (record: any) => {
    setSelectedRecord(record);
    setIsDrawerVisible(true);
    setApprovalHistory([]); 

    try {
      const res: any = await axiosClient.get(`${APPROVAL_HISTORY_API}/${record.id}`);
      const historyData = res.data?.data || res.data || [];
      setApprovalHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error('Không thể lấy lịch sử duyệt:', error);
    }
  };

  const handleOpenAction = (record: any, type: 'approve' | 'reject') => {
    setSelectedRecord(record);
    setActionType(type);
    setComments('');
    setIsActionModalVisible(true);
  };

  // gọi api duyệt từ chối
  const submitApprovalAction = async () => {
    if (actionType === 'reject' && !comments.trim()) {
      message.warning('Vui lòng nhập lý do từ chối!');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentStatus = selectedRecord?.status;
      const rolePrefix = currentStatus === 'PENDING_ADMIN' ? 'admin' : 'manager';
      
      const endpoint = `${API_BASE_URL}/approvals/${rolePrefix}/${actionType}/${selectedRecord.id}`;
      
      const payload = actionType === 'approve' 
        ? { comments: comments } 
        : { rejection_reason: comments };

      await axiosClient.post(endpoint, payload);
      
      message.success(actionType === 'approve' ? 'Đã phê duyệt yêu cầu!' : 'Đã từ chối yêu cầu!');
      setIsActionModalVisible(false);
      triggerTableRefresh();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusTag = (status: string) => {
    if (status === 'PENDING_MANAGER') return <Tag color="orange">Chờ Quản lý duyệt</Tag>;
    if (status === 'PENDING_ADMIN') return <Tag color="geekblue">Chờ Admin duyệt</Tag>;
    return <Tag>{status}</Tag>;
  };

  // Cấu hình bảng
  const tableConfigWithActions = useMemo(() => {
    return {
      ...approvalTableConfig,
      columns: [
        ...approvalTableConfig.columns,
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
          width: 180,
          align: 'center' as const,
          render: (_: any, record: any) => (
            <Space size="middle">
              <Tooltip title="Xem chi tiết">
                <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
              </Tooltip>
              <Tooltip title="Phê duyệt">
                <Button type="primary" style={{ backgroundColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleOpenAction(record, 'approve')} />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button type="primary" danger icon={<CloseCircleOutlined />} onClick={() => handleOpenAction(record, 'reject')} />
              </Tooltip>
            </Space>
          ),
        },
      ],
    };
  }, []);

  return (
    <>
      <Card title="PHÊ DUYỆT YÊU CẦU" style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <DynamicTable config={tableConfigWithActions} />
      </Card>

      {/* Form xử lý phê duyệt - từ chối */}
      <Modal
        title={actionType === 'approve' ? `XÁC NHẬN PHÊ DUYỆT - ${selectedRecord?.requisition_number}` : `TỪ CHỐI YÊU CẦU - ${selectedRecord?.requisition_number}`}
        open={isActionModalVisible}
        onCancel={() => setIsActionModalVisible(false)}
        onOk={submitApprovalAction}
        confirmLoading={isSubmitting}
        okText={actionType === 'approve' ? 'Đồng ý Duyệt' : 'Xác nhận Từ chối'}
        okButtonProps={{ danger: actionType === 'reject', style: actionType === 'approve' ? { backgroundColor: '#52c41a' } : {} }}
      >
        <div style={{ marginBottom: 16 }}>
          Bạn đang xử lý phiếu yêu cầu <strong>{selectedRecord?.title}</strong> của nhân viên <strong>{selectedRecord?.requester_name}</strong>.
        </div>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
          {actionType === 'approve' ? 'Ghi chú phê duyệt (Không bắt buộc):' : 'Lý do từ chối (Bắt buộc):'}
        </div>
        <Input.TextArea 
          rows={4} 
          placeholder={actionType === 'approve' ? 'Nhập ghi chú cho nhân viên...' : 'Nhập lý do chi tiết tại sao từ chối...'} 
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </Modal>

      {/* xem chi tiết */}
      <Drawer
        title={`CHI TIẾT PHIẾU TRÌNH: ${selectedRecord?.requisition_number}`}
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        size="large"
      >
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Descriptions column={2} bordered size="middle">
              <Descriptions.Item label="Người trình" labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.requester_name}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban" labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.department_name}
              </Descriptions.Item>
              <Descriptions.Item label="Tiêu đề" span={2} labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.title}
              </Descriptions.Item>
              <Descriptions.Item label="Loại chi phí" labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.type_name}
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền" labelStyle={{ fontWeight: 'bold' }}>
                <span style={{ color: 'red', fontWeight: 'bold' }}>
                  {new Intl.NumberFormat('vi-VN').format(selectedRecord.amount)} {selectedRecord.currency}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Lý do chi tiết" span={2} labelStyle={{ fontWeight: 'bold' }}>
                {selectedRecord.description}
              </Descriptions.Item>
            </Descriptions>

            {/* Lịch sử phê duyệt */}
            {approvalHistory.length > 0 && (
              <Card title="LỊCH SỬ XỬ LÝ" size="small" type="inner">
                <Timeline style={{ marginTop: 16 }}>
                  {approvalHistory.map((log: any) => (
                    <Timeline.Item key={log.id} color={log.action === 'APPROVED' ? 'green' : 'red'}>
                      <div style={{ marginBottom: 4 }}>
                        <strong>{log.approver_name}</strong> <i>({log.approver_role})</i> đã <strong>{log.action === 'APPROVED' ? 'Duyệt' : 'Từ chối'}</strong>
                      </div>
                      {log.comments && (
                        <div style={{ color: '#666' }}>Ghi chú: {log.comments}</div>
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

export default ApprovalPage;