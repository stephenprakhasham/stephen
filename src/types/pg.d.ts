declare module "pg" {
  export interface QueryResult<R = Record<string, unknown>> {
    rows: R[];
    rowCount: number | null;
  }

  export interface ClientConfig {
    connectionString?: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    ssl?: { rejectUnauthorized?: boolean } | boolean;
    connectionTimeoutMillis?: number;
  }

  export class Client {
    constructor(config?: ClientConfig);
    connect(): Promise<void>;
    query<R = Record<string, unknown>>(
      sql: string,
      params?: unknown[]
    ): Promise<QueryResult<R>>;
    end(): Promise<void>;
  }
}