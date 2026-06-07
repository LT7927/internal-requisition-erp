import { Table, Input, Select, Space, Row, Col } from 'antd';
import { DynamicTableProps, TableParams } from './tableTypes';
import { useState, useEffect } from 'react';

const { Search } = Input;

const DynamicTable = ({
  columns,
  dataSource,
  totalItems,
  isLoading,
  params,
  onParamsChange,
  filtersConfig = [],
  searchPlaceholder = 'Tìm kiếm...',
}: DynamicTableProps) => {
  // Quản lý tạm thời text trong ô search để user gõ xong ấn Enter hoặc click kính lúp mới kích hoạt gọi API
  const [searchText, setSearchText] = useState(params.search || '');

  // Đồng bộ lại ô search nếu component cha chủ động reset params từ bên ngoài
  useEffect(() => {
    setSearchText(params.search || '');
  }, [params.search]);

  // 1. Xử lý khi user gõ chữ và bấm Search (hoặc ấn Enter)
  const handleSearch = (value: string) => {
    onParamsChange({
      ...params,
      page: 1, // Reset về trang 1 khi bắt đầu tìm kiếm từ khóa mới
      search: value || undefined,
    });
  };

  // 2. Xử lý khi user thay đổi một bộ lọc (Select dropdown)
  const handleFilterChange = (filterName: string, value: any) => {
    const currentFilters = params.filters || {};
    onParamsChange({
      ...params,
      page: 1, // Reset về trang 1 khi đổi bộ lọc
      filters: {
        ...currentFilters,
        [filterName]: value === undefined ? undefined : value, // Nếu chọn "Tất cả" (undefined) thì xóa filter đó đi
      },
    });
  };

  // 3. Xử lý khi user bấm chuyển trang hoặc đổi số lượng hiển thị (PageSize) trên bảng
  const handleTableChange = (pagination: any) => {
    onParamsChange({
      ...params,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      
      {/* ================= KHU VỰC BỘ LỌC VÀ Ô TÌM KIẾM (TOP) ================= */}
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        {/* Thanh Search ô tìm kiếm */}
        <Col xs={24} md={8}>
          <Search
            placeholder={searchPlaceholder}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: '100%' }}
          />
        </Col>

        {/* Các nút bấm Filter dropdown */}
        <Col xs={24} md={16} style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
          {filtersConfig.map((filter) => (
            <Select
              key={filter.name}
              placeholder={filter.placeholder}
              allowClear
              style={{ minWidth: 160 }}
              value={params.filters?.[filter.name]}
              onChange={(value) => handleFilterChange(filter.name, value)}
            >
              {filter.options.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          ))}
        </Col>
      </Row>

      {/* ================= THÂN BẢNG VÀ PHÂN TRANG (MIDDLE & BOTTOM) ================= */}
      <Table
        columns={columns}
        dataSource={dataSource.map((item, index) => ({
          ...item,
          key: item.id || index, // Đảm bảo mỗi dòng trong bảng AntD luôn có thuộc tính key duy nhất để không bị cảnh báo console
        }))}
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: totalItems,
          showSizeChanger: true, // Cho phép người dùng chọn xem hiển thị 10, 20 hay 50 dòng trên trang
          pageSizeOptions: ['10', '20', '50'],
          locale: { items_per_page: '/ trang' },
        }}
        bordered
      />
    </Space>
  );
};

export default DynamicTable;