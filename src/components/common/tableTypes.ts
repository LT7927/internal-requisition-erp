import { ColumnsType } from 'antd/es/table';

export interface FilterConfig {
  name: string;         
  placeholder?: string; 
  options: { label: string; value: string | number }[]; 
}

export interface TableConfig {
  apiEndpoint: string;
  columns: ColumnsType<any>;
  filterConfigs?: FilterConfig[];
  rowKey?: string;
}

export interface DynamicTableProps {
  config: TableConfig;
}