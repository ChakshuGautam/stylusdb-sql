import { ConnectionInfo, Debug, ok, Queryable, Query, Result, ResultSet, Transaction, TransactionOptions, ColumnType, ColumnTypeEnum, DriverAdapter } from '@prisma/driver-adapter-utils'
import { adaptInsertQuery, convertToPrismaResultSetINSERTQuery, convertToPrismaResultSetSELECTQuery, evaluateQuery } from './queryUtils'
const debug = Debug('prisma:driver-adapter:stylusdb')

const defaultDatabase = 'test'

class RollbackError extends Error {
  constructor() {
    super('ROLLBACK')
    this.name = 'RollbackError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RollbackError)
    }
  }
}

class StylusDBSQLQueryable implements Queryable {
  readonly provider = 'postgres'
  constructor(protected client: any) {}

  /**
   * Execute a query given as SQL, interpolating the given parameters.
   */
  async queryRaw(query: Query): Promise<Result<ResultSet>> {
    debug('PrismaStylusDBSQL: queryRaw Called');
    const tag = '[js::query_raw]'

    const queries = adaptInsertQuery(query)
    let result;

    debug('PrismaStylusDBSQL: queryRaw queries: %O', queries);

    for (const query of queries) {
      debug(`${tag} %O`, query)
      const fixedQuery = adaptInsertQuery({sql: query, args: []})[0] //single query so this works
      result = await this.performIO({sql: fixedQuery, args: []})
    }

    debug('PrismaStylusDBSQL: queryRaw result: %O', result);

    let resultSet: ResultSet;
    if(query.sql.includes('INSERT INTO')) {
      resultSet = convertToPrismaResultSetINSERTQuery(result);
    }else {
      resultSet = convertToPrismaResultSetSELECTQuery(result);
    }
    
    return ok(resultSet)
  }

  /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */
  async executeRaw(query: Query): Promise<Result<number>> {
    const tag = '[js::execute_raw]'
    debug(`${tag} %O`, query)

    const result = await this.performIO(query)
    const rowsAffected = result.rowsAffected as number
    return ok(rowsAffected)
  }

  /**
   * Run a query against the database, returning the result set.
   * Should the query fail due to a connection error, the connection is
   * marked as unhealthy.
   */
  private async performIO(query: Query) {
    const { sql, args: values } = query
    try {
      const result =  await this.client.execute(sql)
      return result;
    } catch (e) {
      const error = e as Error
      debug('Error in performIO: %O', error)
      throw error
    }
  }
}

class StylusDBSQLTransaction extends StylusDBSQLQueryable  implements Transaction {
  finished = false

  constructor(
    tx: any,
    readonly options: TransactionOptions,
  ) {
    super(tx)
  }

  async commit(): Promise<Result<void>> {
    debug(`[js::commit]`)

    this.finished = true
    await this.client.commit()
    return Promise.resolve(ok(undefined))
  }

  async rollback(): Promise<Result<void>> {
    debug(`[js::rollback]`)

    this.finished = true
    await this.client.rollback()
    return Promise.resolve(ok(undefined))
  }

  dispose(): Result<void> {
    if (!this.finished) {
      this.rollback().catch(console.error)
    }
    return ok(undefined)
  }
}

export class PrismaStylusDBSQL extends StylusDBSQLTransaction implements DriverAdapter {
  constructor(client: any, options: any) {
    super(client, options)

    debug('PrismaStylusDBSQL: Client Constructor Called');
  }

  getConnectionInfo(): Result<ConnectionInfo> {
    debug('PrismaStylusDBSQL: getConnectionInfo Called');
    return ok({
      schemaName: undefined,
    })
  }

  async startTransaction() {
    const options: TransactionOptions = {
      usePhantomQuery: true,
    }

    const tag = '[js::startTransaction]'
    debug(`${tag} options: %O`, options)

    const tx = await this.client.begin()
    return ok(new StylusDBSQLTransaction(tx, options))
  }
}
