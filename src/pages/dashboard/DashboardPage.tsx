import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, message, Tag, Skeleton, Button } from 'antd';
import { DollarOutlined, FileDoneOutlined, FileTextOutlined, HourglassOutlined, StopOutlined, FileExcelOutlined } from '@ant-design/icons';
import axiosClient from '../../utils/axiosClient';
import API_BASE_URL from '../../api';
import { exportToExcel } from '../../utils/exportExcel';

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
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Hiển thị tiền tệ
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // --- Hàm xử lý execl ---
  const handleExportDepartment = () => {
    if (!stats?.by_department) return message.warning('Chưa có dữ liệu để xuất');
    
    const mapping = {
      department_code: 'Mã phòng ban',
      department_name: 'Tên phòng ban',
      total: 'Tổng số phiếu',
      approved: 'Đã phê duyệt',
      pending: 'Đang chờ duyệt'
    };
    
    exportToExcel(stats.by_department, 'ThongKe_PhongBan', mapping);
    message.success('Xuất file thống kê phòng ban thành công!');
  };

  const handleExportType = () => {
    if (!stats?.by_type) return message.warning('Chưa có dữ liệu để xuất');
    
    const mapping = {
      type_code: 'Mã loại',
      type_name: 'Tên loại chi phí',
      total: 'Tổng số phiếu sử dụng',
      total_amount: 'Tổng tiền đã chi (VNĐ)'
    };
    
    exportToExcel(stats.by_type, 'ThongKe_LoaiChiPhi', mapping);
    message.success('Xuất file thống kê loại chi phí thành công!');
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

  return (
    <div style={{ padding: '0 10px' }}>
      <Title level={3} style={{ marginTop: 0, marginBottom: 24 }}>TỔNG QUAN TÀI CHÍNH & HOẠT ĐỘNG</Title>
      
      {/* Tài chính */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }} title={false}>
              <Statistic title="Tổng Tiền Đã Phê Duyệt" value={stats?.financial?.total_approved_amount || 0} formatter={(val) => formatMoney(val as number)} valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} prefix={<DollarOutlined />} />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ background: '#fff7e6', borderColor: '#ffd591' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }} title={false}>
              <Statistic title="Tổng Tiền Đang Chờ Duyệt" value={stats?.financial?.total_pending_amount || 0} formatter={(val) => formatMoney(val as number)} valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }} prefix={<DollarOutlined />} />
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Trạng thái phiếu y/c */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }} title={false}>
              <Statistic title="Tổng Số Yêu Cầu" value={stats?.overview?.total || 0} prefix={<FileTextOutlined />} />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }} title={false}>
              <Statistic title="Đã Được Phê Duyệt" value={stats?.overview?.approved || 0} valueStyle={{ color: '#3f8600' }} prefix={<FileDoneOutlined />} />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }} title={false}>
              <Statistic title="Đang Chờ Xử Lý" value={(stats?.overview?.pending_manager || 0) + (stats?.overview?.pending_admin || 0)} valueStyle={{ color: '#faad14' }} prefix={<HourglassOutlined />} />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} hoverable>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }} title={false}>
              <Statistic title="Bị Từ Chối / Hủy" value={(stats?.overview?.rejected || 0) + (stats?.overview?.cancelled || 0)} valueStyle={{ color: '#cf1322' }} prefix={<StopOutlined />} />
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Bảng phân tích */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="Thống Kê Theo Phòng Ban" 
            bordered={false} 
            style={{ height: '100%' }}
            extra={<Button type="primary" style={{ backgroundColor: '#52c41a' }} icon={<FileExcelOutlined />} onClick={handleExportDepartment}>Xuất Excel</Button>}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              <Table size="small" dataSource={stats?.by_department || []} columns={departmentColumns} rowKey="department_code" pagination={false} />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Phân Tích Loại Chi Phí" 
            bordered={false} 
            style={{ height: '100%' }}
            extra={<Button type="primary" style={{ backgroundColor: '#52c41a' }} icon={<FileExcelOutlined />} onClick={handleExportType}>Xuất Excel</Button>}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              <Table size="small" dataSource={stats?.by_type || []} columns={typeColumns} rowKey="type_code" pagination={false} />
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;