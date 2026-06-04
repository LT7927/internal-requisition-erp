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
      
      // 1. Gọi API Login (POST /api/auth/login)
      const loginRes: any = await axiosClient.post('/api/auth/login', values);
      
      // Lưu ý: Cần kiểm tra cấu trúc Swagger xem token nằm ở đâu (vd: loginRes.token hay loginRes.data.token)
      const token = loginRes.token || loginRes.data?.token; 
      
      if (!token) throw new Error("Không nhận được token từ server");

      // Lưu tạm token vào localStorage để axiosClient tự động đính kèm vào header cho API Profile
      localStorage.setItem('token', token);

      // 2. Gọi API Profile (GET /api/auth/profile)
      const profileRes: any = await axiosClient.get('/api/auth/profile');
      const user = profileRes.data || profileRes;

      // 3. Đưa Token và thông tin User vào kho lưu trữ Redux
      dispatch(setCredentials({ token, user }));

      message.success('Đăng nhập thành công!');
      
      // 4. Chuyển hướng vào trang trong
      navigate('/requisitions/my');
      
    } catch (error) {
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!');
      // Nếu lỗi, xóa token rác đi
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