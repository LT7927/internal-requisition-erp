import { ColumnsType } from 'antd/es/table';

export interface FilterConfig {
  name: string;         
  placeholder?: string; 
  options: { label: string; value: string | number }[]; 
}

// Khai báo cục Config tổng
export interface TableConfig {
  apiEndpoint: string;
  columns: ColumnsType<any>;
  filterConfigs?: FilterConfig[];
  rowKey?: string;
}

// Khai báo lại Props cho DynamicTable để nó chấp nhận thuộc tính 'config'
export interface DynamicTableProps {
  config: TableConfig; 
}