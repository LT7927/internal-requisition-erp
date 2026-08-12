import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, message, Tag } from 'antd';
import { DollarOutlined, FileDoneOutlined, HourglassOutlined, StopOutlined, FileTextOutlined } from '@ant-design/icons';
import axiosClient from '../../utils/axiosClient';
import API_BASE_URL from '../../api';

const { Title } = Typography;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const res = await axiosClient.get(`${API_BASE_URL}/categories/statistics`);
      setStats(res.data?.data || res.data);
    } catch (error) {
      message.error('Không thể tải dữ liệu thống kê hệ thống');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị tiền tệ
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Cột cho bảng Thống kê theo phòng ban
  const departmentColumns = [
    { title: 'Phòng ban', dataIndex: 'department_name', key: 'name' },
    { title: 'Tổng phiếu', dataIndex: 'total', key: 'total', align: 'center' as const },
    { title: 'Đã duyệt', dataIndex: 'approved', key: 'approved', align: 'center' as const, render: (val: number) => <Tag color="green">{val}</Tag> },
    { title: 'Đang chờ', dataIndex: 'pending', key: 'pending', align: 'center' as const, render: (val: number) => <Tag color="orange">{val}</Tag> },
  ];

  // Cột cho bảng Thống kê theo loại chi phí
  const typeColumns = [
    { title: 'Loại chi phí', dataIndex: 'type_name', key: 'name' },
    { title: 'Số phiếu sử dụng', dataIndex: 'total', key: 'total', align: 'center' as const },
    { 
      title: 'Tổng tiền đã chi', 
      dataIndex: 'total_amount', 
      key: 'amount', 
      align: 'right' as const,
      render: (val: number) => <strong style={{ color: 'red' }}>{formatMoney(val)}</strong> 
    },
  ];

  if (!stats) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ padding: '0 10px' }}>
      <Title level={3} style={{ marginTop: 0, marginBottom: 24 }}>TỔNG QUAN TÀI CHÍNH & HOẠT ĐỘNG</Title>
      
      {/* Tài chính */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Statistic 
              title="Tổng Tiền Đã Phê Duyệt" 
              value={stats.financial?.total_approved_amount || 0} 
              formatter={(val) => formatMoney(val as number)}
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ background: '#fff7e6', borderColor: '#ffd591' }}>
            <Statistic 
              title="Tổng Tiền Đang Chờ Duyệt" 
              value={stats.financial?.total_pending_amount || 0} 
              formatter={(val) => formatMoney(val as number)}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Trạng thái phiếu y/c */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card bordered={false} hoverable>
            <Statistic title="Tổng Số Yêu Cầu" value={stats.overview?.total || 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} hoverable>
            <Statistic title="Đã Được Phê Duyệt" value={stats.overview?.approved || 0} valueStyle={{ color: '#3f8600' }} prefix={<FileDoneOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} hoverable>
            <Statistic title="Đang Chờ Xử Lý" value={(stats.overview?.pending_manager || 0) + (stats.overview?.pending_admin || 0)} valueStyle={{ color: '#faad14' }} prefix={<HourglassOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} hoverable>
            <Statistic title="Bị Từ Chối / Hủy" value={(stats.overview?.rejected || 0) + (stats.overview?.cancelled || 0)} valueStyle={{ color: '#cf1322' }} prefix={<StopOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Bảng phân tích */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Thống Kê Theo Phòng Ban" bordered={false} style={{ height: '100%' }}>
            <Table 
              size="small" 
              dataSource={stats.by_department || []} 
              columns={departmentColumns} 
              rowKey="department_code" 
              pagination={false} 
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Phân Tích Loại Chi Phí" bordered={false} style={{ height: '100%' }}>
            <Table 
              size="small" 
              dataSource={stats.by_type || []} 
              columns={typeColumns} 
              rowKey="type_code" 
              pagination={false} 
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;