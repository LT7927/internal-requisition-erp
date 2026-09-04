import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props { children?: ReactNode; }

interface State { hasError: boolean; }

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lỗi giao diện nghiêm trọng:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Đã có lỗi xảy ra"
          subTitle="Giao diện gặp sự cố khi hiển thị. Vui lòng tải lại trang."
          extra={<Button type="primary" onClick={() => window.location.reload()}>Tải lại trang</Button>}
          style={{ marginTop: '100px' }}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;