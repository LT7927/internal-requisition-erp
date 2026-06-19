import { useState } from 'react';
import { Layout, Menu, Typography, Dropdown, Space, Avatar, Button } from 'antd';
import { 
  FileTextOutlined, 
  CheckSquareOutlined, 
  ApartmentOutlined, 
  UserOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Lấy thông tin user từ kho Redux để biết họ là ai, chức vụ gì
  const { user } = useSelector((state: RootState) => state.auth);

  // 1. Kịch bản Logout: Xóa token ở ổ cứng, xóa Redux, đá về trang Login
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // 2. Tự động sinh Menu dựa vào Role của người dùng
  const getMenuItems = () => {
    const role = user?.role?.toUpperCase(); // Giả định backend trả về user.role là 'Staff', 'Manager', hoặc 'Admin'

    // Menu cơ bản ai cũng có
    const items = [
      {
        key: '/requisitions/my',
        icon: <FileTextOutlined />,
        label: 'Yêu cầu của tôi',
      }
    ];

    // Nếu là Manager hoặc Admin -> Thấy thêm menu Duyệt yêu cầu
    if (role === 'MANAGER' || role === 'ADMIN') {
      items.push({
        key: '/approvals/pending',
        icon: <CheckSquareOutlined />,
        label: 'Chờ duyệt',
      });
    }

    // Nếu là Admin tối cao -> Thấy thêm menu Quản lý hệ thống (Phòng ban)
    if (role === 'ADMIN') {
      items.push({
        key: '/categories/departments',
        icon: <ApartmentOutlined />,
        label: 'Quản lý phòng ban',
      });
    }

    return items;
  };

  // Menu xổ xuống khi click vào tên Avatar góc phải
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Hồ sơ cá nhân',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        danger: true,
        onClick: handleLogout, // Gắn hàm logout vào đây
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* THANH MENU BÊN TRÁI (SIDEBAR) */}
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
        <div style={{ height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: 18, color: '#1677ff' }}>
          {collapsed ? 'ERP' : 'HỆ THỐNG ERP'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]} // Tự động highlight menu dựa trên URL hiện tại
          onClick={({ key }) => navigate(key)} // Chuyển trang khi click
          items={getMenuItems()} // Gọi hàm rải menu đã phân quyền ở trên
        />
      </Sider>

      <Layout>
        {/* THANH TIÊU ĐỀ BÊN TRÊN (HEADER) */}
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)', zIndex: 1 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Dropdown menu={userMenu} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
              <Typography.Text strong>{user?.username || 'Người dùng'}</Typography.Text>
            </Space>
          </Dropdown>
        </Header>

        {/* KHU VỰC NỘI DUNG CHÍNH (Nơi các trang con như Department, Requisition render ra) */}
        <Content style={{ margin: '24px', padding: 24, minHeight: 280, background: '#fff', borderRadius: 8 }}>
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;