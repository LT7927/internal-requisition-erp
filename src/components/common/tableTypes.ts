import { ColumnsType } from 'antd/es/table';

// Khuôn mẫu cho bộ lọc
export interface FilterConfig {
  name: string;         
  placeholder?: string; 
  options: { label: string; value: string | number }[]; 
}

// Cục Config tổng để truyền vào DynamicTable
export interface TableConfig {
  apiEndpoint: string;
  columns: ColumnsType<any>;
  filterConfigs?: FilterConfig[];
  rowKey?: string;
}

export interface DynamicTableProps {
  config: TableConfig; // Nhận đúng 1 cục JSON tên là config
}