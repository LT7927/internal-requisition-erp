import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Checkbox, App as AntdApp } from 'antd';
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
  const { message } = AntdApp.useApp(); 

  const onFinish = async (values: any) => {
    // 1. In thử xem form bắt được chữ gì
    console.log("1. Dữ liệu từ Form:", values); 

    try {
      setLoading(true);
      
      // 2. Gói ghém đúng tên biến Backend cần (username và password)
      const payload = {
        username: values.username, 
        password: values.password
      };
      
      console.log("2. Dữ liệu gói gửi đi API:", payload);

      // 3. Gọi API Login
      const loginRes: any = await axiosClient.post('/api/auth/login', payload);
      console.log("3. KẾT QUẢ API LOGIN TRẢ VỀ:", loginRes);
      
      const accessToken = loginRes.accessToken || loginRes.data?.accessToken || loginRes.token; 
      const refreshToken = loginRes.refreshToken || loginRes.data?.refreshToken;
      
      if (!accessToken || !refreshToken) throw new Error("Không nhận đủ Token từ server");

      localStorage.setItem('refreshToken', refreshToken);
      dispatch(setCredentials({ accessToken }));

      const profileRes: any = await axiosClient.get('/api/auth/profile');
      const user = profileRes.data || profileRes;

      dispatch(setCredentials({ accessToken, user }));

      message.success('Đăng nhập thành công!');
      navigate('/requisitions/my');
      
    } catch (error: any) {
      console.log("CHI TIẾT LỖI TỪ BACKEND:", error.response?.data);
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Hệ thống ERP</Title>
          <Typography.Text type="secondary">Đăng nhập để quản lý yêu cầu mua sắm</Typography.Text>
        </div>

        <Form name="login_form" onFinish={onFinish} layout="vertical" size="large" initialValues={{ remember: true }}>
          
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập Tài khoản!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tài khoản đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;