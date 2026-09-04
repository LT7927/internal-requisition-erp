import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Dropdown, Space, Avatar, Button, Modal, Form, Input, message, Switch, Badge, Drawer } from 'antd';
import { FileTextOutlined, CheckSquareOutlined, ApartmentOutlined, UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, TagsOutlined, TeamOutlined, DashboardOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import axiosClient from '../utils/axiosClient';
import API_BASE_URL from '../api';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [form] = Form.useForm();
  const [pendingCount, setPendingCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const role = user?.role?.toUpperCase();
      if (role === 'MANAGER' || role === 'ADMIN') {
        try {
          const res = await axiosClient.get(`${API_BASE_URL}/categories/statistics`);
          const stats = res.data?.data || res.data;
          
          if (role === 'MANAGER') setPendingCount(stats.overview?.pending_manager || 0);
          else if (role === 'ADMIN') setPendingCount(stats.overview?.pending_admin || 0);
        } catch (error) {
          console.log('Không thể lấy số liệu thông báo');
        }
      }
    };
    fetchPendingCount();
  }, [user]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Hủy token trên Server
        await axiosClient.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.log('Lỗi API logout');
    } finally {
      localStorage.clear();
      dispatch(logout());
      navigate('/login');
    }
  };

  // Đổi mật khẩu cá nhân
  const handleChangePassword = async (values: any) => {
    setIsChangingPassword(true);
    try {
      await axiosClient.post('/api/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setIsProfileModalVisible(false);
      form.resetFields();
      handleLogout();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại. Sai mật khẩu hiện tại?');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Hiển thị Menu theo role
  const getMenuItems = () => {
    const role = user?.role?.toUpperCase();
    const items: any[] = [];

    if (role === 'MANAGER' || role === 'ADMIN') {
      items.push({
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Bảng điều khiển',
      });
    }

    items.push({
      key: '/requisitions/my',
      icon: <FileTextOutlined />,
      label: 'Yêu cầu của tôi',
    });

    if (role === 'MANAGER' || role === 'ADMIN') {
      items.push({
        key: '/approvals/pending',
        icon: (
          <Badge count={pendingCount} size="small" offset={[2, -2]}>
            <CheckSquareOutlined style={{ color: mode === 'dark' ? '#fff' : 'inherit' }} />
          </Badge>
        ),
        label: 'Duyệt yêu cầu',
      });
    }

    if (role === 'ADMIN') {
      items.push({
        key: 'admin_group',
        label: 'QUẢN TRỊ HỆ THỐNG',
        type: 'group',
        children: [
          { key: '/user', icon: <TeamOutlined />, label: 'Nhân viên' },
          { key: '/categories/departments', icon: <ApartmentOutlined />, label: 'Phòng ban' },
          { key: '/types', icon: <TagsOutlined />, label: 'Loại chi phí' },
        ]
      });
    }

    return items;
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Đổi mật khẩu',
        onClick: () => setIsProfileModalVisible(true)
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const mobileMenu = (
    <Drawer
      title="HỆ THỐNG ERP"
      placement="left"
      onClose={() => setCollapsed(true)}
      open={!collapsed && isMobile}
      width={250}
      styles={{ body: { padding: 0, background: mode === 'dark' ? '#141414' : '#fff' }, header: { background: mode === 'dark' ? '#141414' : '#fff', color: mode === 'dark' ? '#fff' : 'inherit' } }}
    >
      <Menu
        theme={mode === 'dark' ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => {
          navigate(key);
          setCollapsed(true);
        }}
        items={getMenuItems()}
        style={{ borderRight: 0 }}
      />
    </Drawer>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider dùng cho Desktop và Tablet */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          breakpoint="lg"
          onBreakpoint={(broken) => setCollapsed(broken)}
          theme={mode === 'dark' ? 'dark' : 'light'} 
          style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}
        >
          <div style={{ height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: 18, color: '#1677ff' }}>
            {collapsed ? 'ERP' : 'HỆ THỐNG ERP'}
          </div>
          <Menu
            theme={mode === 'dark' ? 'dark' : 'light'}
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={getMenuItems()}
          />
        </Sider>
      )}

      {/* Drawer dùng cho Mobile */}
      {isMobile && mobileMenu}

      <Layout style={{ width: isMobile ? '100%' : 'auto' }}>
        <Header style={{ 
          padding: '0 16px', 
          background: mode === 'dark' ? '#141414' : '#fff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: '0 1px 4px rgba(0,0,0,.08)', 
          zIndex: 1 
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 48, height: 48, color: mode === 'dark' ? '#fff' : 'inherit' }}
          />
          
          <Space size="middle">
            <Switch
              checked={mode === 'dark'}
              onChange={() => dispatch(toggleTheme())}
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
            />

            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} size={isMobile ? "small" : "default"} />
                {/* Ẩn tên user trên điện thoại */}
                {!isMobile && (
                  <Typography.Text strong style={{ color: mode === 'dark' ? '#fff' : 'inherit' }}>
                    {user?.full_name || user?.username || 'Người dùng'}
                  </Typography.Text>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Căn lề Nội dung co giãn theo thiết bị */}
        <Content style={{ 
          margin: isMobile ? '16px 8px' : '24px', 
          padding: isMobile ? 12 : 24, 
          minHeight: 280, 
          background: mode === 'dark' ? '#141414' : '#fff',
          borderRadius: 8,
          overflowX: 'hidden'
        }}>
          <Outlet /> 
        </Content>
      </Layout>

      <Modal
        title="ĐỔI MẬT KHẨU CÁ NHÂN"
        open={isProfileModalVisible}
        onCancel={() => { setIsProfileModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={isChangingPassword}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item 
            label="Mật khẩu hiện tại" 
            name="currentPassword" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu cũ..." />
          </Form.Item>
          <Form.Item 
            label="Mật khẩu mới" 
            name="newPassword" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới..." />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MainLayout;