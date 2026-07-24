import { useEffect, useState } from 'react';
import { Table, Input, Space, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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

        if (items.length === 0) {
          console.warn("DynamicTable: Không tìm thấy dữ liệu hoặc mảng rỗng!", resData);
        }

        setData(items);
        setTotal(totalItems);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu bảng:', error);
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint, searchParams]);

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
      />
    </div>
  );
};

export default DynamicTable;