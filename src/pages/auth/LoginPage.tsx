import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axiosClient from '../../utils/axiosClient';
import { setCredentials } from '../../store/slices/authSlice';

const { Title } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // --- ĐOẠN CODE GỌI API THẬT (TẠM THỜI COMMENT LẠI) ---
      // const loginRes: any = await axiosClient.post('/api/auth/login', values);
      // const token = loginRes.token || loginRes.data?.token; 
      // localStorage.setItem('token', token);
      // const profileRes: any = await axiosClient.get('/api/auth/profile');
      // const user = profileRes.data || profileRes;
      
      // --- ĐOẠN CODE MOCK DATA (GIẢ LẬP) ---
      // 1. Giả lập thời gian chờ mạng 1 giây cho giống thật
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Tự động set Role dựa vào email người dùng gõ
      let mockRole = 'Staff'; // Mặc định là nhân viên
      if (values.email.includes('admin')) mockRole = 'Admin';
      if (values.email.includes('manager')) mockRole = 'Manager';

      // 3. Tạo dữ liệu giả
      const mockToken = 'fake-jwt-token-12345';
      const mockUser = { 
        id: 1, 
        name: 'Người dùng Test', 
        email: values.email, 
        role: mockRole 
      };

      // 4. Đưa vào Redux và LocalStorage như bình thường
      localStorage.setItem('token', mockToken);
      dispatch(setCredentials({ token: mockToken, user: mockUser }));

      message.success(`Đăng nhập giả lập thành công với quyền: ${mockRole}`);
      navigate('/requisitions/my');
      
    } catch (error) {
      message.error('Đăng nhập thất bại!');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Hệ thống ERP</Title>
        <Typography.Text type="secondary">Đăng nhập để quản lý yêu cầu mua sắm</Typography.Text>
      </div>

      <Form name="login_form" onFinish={onFinish} layout="vertical" size="large">
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email đăng nhập" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoginPage;