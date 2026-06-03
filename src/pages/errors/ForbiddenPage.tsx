import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
      extra={
        <Button type="primary" onClick={() => navigate('/requisitions/my')}>
          Về trang chủ
        </Button>
      }
    />
  );
};

export default ForbiddenPage;