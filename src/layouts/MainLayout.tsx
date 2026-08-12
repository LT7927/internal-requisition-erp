import { useState } from 'react';
import { Layout, Menu, Typography, Dropdown, Space, Avatar, Button, Modal, Form, Input, message } from 'antd';
import { FileTextOutlined, CheckSquareOutlined, ApartmentOutlined, UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, TagsOutlined, TeamOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import axiosClient from '../utils/axiosClient';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Hủy token trên Server
        await axiosClient.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.log('Lỗi API logout, tiến hành dọn dẹp LocalStorage');
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
        icon: <CheckSquareOutlined />,
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
        <div style={{ height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: 18, color: '#1677ff' }}>
          {collapsed ? 'ERP' : 'HỆ THỐNG ERP'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={getMenuItems()}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)', zIndex: 1 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Dropdown menu={userMenu} placement="bottomRight" arrow trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
              <Typography.Text strong>{user?.full_name || user?.username || 'Người dùng'}</Typography.Text>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px', padding: 24, minHeight: 280, background: '#fff', borderRadius: 8 }}>
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