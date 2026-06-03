import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Xin lỗi, trang bạn đang truy cập không tồn tại."
      extra={
        <Button type="primary" onClick={() => navigate('/requisitions/my')}>
          Về trang chủ
        </Button>
      }
    />
  );
};

export default NotFoundPage;