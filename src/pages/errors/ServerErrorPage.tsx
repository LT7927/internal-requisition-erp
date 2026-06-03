import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const ServerErrorPage = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="500"
      title="500"
      subTitle="Xin lỗi, máy chủ đang gặp sự cố. Vui lòng thử lại sau."
      extra={
        <Button type="primary" onClick={() => navigate('/requisitions/my')}>
          Về trang chủ
        </Button>
      }
    />
  );
};

export default ServerErrorPage;