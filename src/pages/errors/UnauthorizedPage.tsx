import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="warning"
      title="401 - Chưa xác thực"
      subTitle="Phiên đăng nhập của bạn đã hết hạn hoặc bạn chưa đăng nhập."
      extra={
        <Button type="primary" onClick={() => navigate('/login')}>
          Đi đến Đăng nhập
        </Button>
      }
    />
  );
};

export default UnauthorizedPage;