import { Descriptions, Table, Tag, Typography } from 'antd';

interface DepartmentDetailProps {
  departmentData: any; // Dữ liệu phòng ban chi tiết từ API trả về
}

const DepartmentDetail = ({ departmentData }: DepartmentDetailProps) => {
  if (!departmentData) return <div>Không có dữ liệu phòng ban</div>;

  // Định nghĩa các cột hiển thị danh sách nhân viên thuộc phòng ban đó
  const userColumns = [
    { title: 'Họ và tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Chức vụ (Role)', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'Admin' ? 'red' : role === 'Manager' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      )
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>Thông tin chung</Typography.Title>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Tên phòng ban">{departmentData.name}</Descriptions.Item>
        <Descriptions.Item label="Mã phòng ban"><Tag color="purple">{departmentData.code}</Tag></Descriptions.Item>
        <Descriptions.Item label="Mô tả">{departmentData.description || '(Chưa có mô tả)'}</Descriptions.Item>
      </Descriptions>

      <Typography.Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
        Danh sách nhân viên thuộc phòng ({departmentData.users?.length || 0})
      </Typography.Title>
      <Table 
        columns={userColumns} 
        dataSource={departmentData.users || []} 
        pagination={false} // Tắt phân trang cục bộ bên trong chi tiết
        size="small"
        bordered
      />
    </div>
  );
};

export default DepartmentDetail;