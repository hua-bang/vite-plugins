interface DataSourceItem {
  interfaceName: string;
  data: Record<string, any>;
}

export interface GenerateJsonTypePluginOptions {
  path: string;
  filename: string;
  dataSource: Array<DataSourceItem>;
}