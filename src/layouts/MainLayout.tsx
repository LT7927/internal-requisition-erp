import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Tạm thời cấu hình menu cứng, sau này sẽ dùng Redux filter theo Role
  const menuItems = [
    { key: '/requisitions/my', label: 'Yêu cầu của tôi' },
    { key: '/approvals/pending', label: 'Chờ duyệt' },
    { key: '/categories/departments', label: 'Phòng ban' },
  ];

  const handleLogout = () => {
    // Logic xóa token sẽ thêm sau, giờ chỉ chuyển hướng tạm
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{ height: 32, margin: 16, background: 'rgba(0, 0, 0, 0.2)', borderRadius: 6 }} />
        <Menu
          mode="inline"
          defaultSelectedKeys={['/requisitions/my']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '20px' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', borderRadius: '8px' }}>
          {/* Nội dung các trang danh sách, form... sẽ hiển thị ở đây */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;