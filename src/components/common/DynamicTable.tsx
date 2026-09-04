import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Space, Select, Empty, Skeleton, Typography, Button } from 'antd';
import { SearchOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../utils/axiosClient';
import { DynamicTableProps, FilterConfig } from './tableTypes';
import useDebounce from '../../hooks/useDebounce';

const DynamicTable = ({ config }: DynamicTableProps) => {
  const { apiEndpoint, columns, filterConfigs = [], rowKey = 'id' } = config;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  
  const [isError, setIsError] = useState<boolean>(false); 

  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('limit')) || 10;
  
  const initialSearch = searchParams.get('search') || '';
  const [searchText, setSearchText] = useState(initialSearch);

  const debouncedSearchTerm = useDebounce(searchText, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchParams.set('search', debouncedSearchTerm);
      searchParams.set('page', '1'); 
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]); 

  const handleFilterChange = (filterName: string, value: any) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(filterName, value); 
    } else {
      searchParams.delete(filterName); 
    }
    searchParams.set('page', '1'); 
    setSearchParams(searchParams);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };

      searchParams.forEach((value, key) => {
        if (key !== 'page' && key !== 'limit') {
          params[key] = value;
        }
      });

      const response: any = await axiosClient.get(apiEndpoint, { params });
      
      const resData = response.data || response;
      let items: any[] = [];
      let totalItems = 0;

      // Xác định tầng cần quét (Quét thẳng ở ngoài hay phải chui vào trong biến 'data')
      const targetObject = (resData?.data && typeof resData.data === 'object' && !Array.isArray(resData.data))
        ? resData.data
        : resData;
        
        // Bắt đầu quét tóm gọn mảng dữ liệu
        if (Array.isArray(targetObject)) {
          // API trả về mảng trực tiếp
          items = targetObject;
        totalItems = items.length;
      } else if (targetObject && typeof targetObject === 'object') {
          // Quét toàn bộ các keys trong object, thấy cái nào là Array thì đó chính là dữ liệu!
          const arrayKey = Object.keys(targetObject).find(key => Array.isArray(targetObject[key]));
        
        if (arrayKey) {
          items = targetObject[arrayKey]; // Lôi mảng users ra
          // Tìm số tổng cộng để phân trang (Hỗ trợ quét nhiều kiểu trả về khác nhau)
          totalItems = targetObject.pagination?.total 
                    || targetObject.pagination?.totalItems 
                    || targetObject.total 
                    || items.length;
        }
      }

      setData(items);
      setTotal(totalItems);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu bảng:', error);
      setData([]);
      setTotal(0);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, searchParams, currentPage, pageSize]);

  // Gọi API khi param thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (pagination: any) => {
    searchParams.set('page', pagination.current.toString());
    searchParams.set('limit', pagination.pageSize.toString());
    setSearchParams(searchParams);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Space wrap>
          {filterConfigs.map((filter: FilterConfig) => (
            <Select
              key={filter.name}
              placeholder={filter.placeholder || `Lọc theo ${filter.name}`}
              value={searchParams.get(filter.name) || undefined} 
              onChange={(val) => handleFilterChange(filter.name, val)}
              allowClear 
              style={{ minWidth: 160, borderRadius: 8 }}
              options={filter.options}
            />
          ))}
        </Space>

        <Input
          placeholder="Nhập từ khóa tìm kiếm..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300, borderRadius: 8 }}
          allowClear
        />
      </div>

      {loading && data.length === 0 ? (
        <div style={{ padding: '24px 0' }}>
          <Skeleton active title={{ width: 200 }} paragraph={{ rows: 6 }} />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey={rowKey}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (totalValue: number) => `Tổng số ${totalValue} bản ghi`,
          }}
          scroll={{ x: 'max-content' }}
          
          locale={{
            emptyText: isError ? (
              // Hiển thị khi server sập
              <Empty
                image={<DisconnectOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />}
                description={
                  <div style={{ padding: '16px 0' }}>
                    <Typography.Text type="danger" strong style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>
                      Máy chủ đang mất kết nối
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                      Không thể lấy dữ liệu từ hệ thống. Vui lòng kiểm tra lại mạng hoặc liên hệ bộ phận IT.
                    </Typography.Text>
                    <Button type="primary" danger onClick={fetchData}>
                      Tải lại dữ liệu
                    </Button>
                  </div>
                }
              />
            ) : (
              // Hiển thị khi chạy bình thường
              <Empty
                image={Empty.PRESENTED_IMAGE_DEFAULT}
                description={
                  <div style={{ padding: '16px 0' }}>
                    <Typography.Text type="secondary" strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                      Chưa có dữ liệu để hiển thị
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      Bạn có thể thử thay đổi bộ lọc, tìm kiếm từ khóa khác, <br/> hoặc bấm "Thêm mới" ở góc phải để tạo dữ liệu nhé.
                    </Typography.Text>
                  </div>
                }
              />
            )
          }}
        />
      )}
    </div>
  );
};

export default DynamicTable;