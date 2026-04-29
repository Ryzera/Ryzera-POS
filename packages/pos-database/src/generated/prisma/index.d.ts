
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Company
 * 
 */
export type Company = $Result.DefaultSelection<Prisma.$CompanyPayload>
/**
 * Model Branch
 * 
 */
export type Branch = $Result.DefaultSelection<Prisma.$BranchPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model UserInfo
 * 
 */
export type UserInfo = $Result.DefaultSelection<Prisma.$UserInfoPayload>
/**
 * Model Role
 * 
 */
export type Role = $Result.DefaultSelection<Prisma.$RolePayload>
/**
 * Model Authority
 * 
 */
export type Authority = $Result.DefaultSelection<Prisma.$AuthorityPayload>
/**
 * Model UserRole
 * 
 */
export type UserRole = $Result.DefaultSelection<Prisma.$UserRolePayload>
/**
 * Model RoleAuthority
 * 
 */
export type RoleAuthority = $Result.DefaultSelection<Prisma.$RoleAuthorityPayload>
/**
 * Model UserLog
 * 
 */
export type UserLog = $Result.DefaultSelection<Prisma.$UserLogPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model Bill
 * 
 */
export type Bill = $Result.DefaultSelection<Prisma.$BillPayload>
/**
 * Model BillItem
 * 
 */
export type BillItem = $Result.DefaultSelection<Prisma.$BillItemPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]


export const UserType: {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF'
};

export type UserType = (typeof UserType)[keyof typeof UserType]


export const LogAction: {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  ROLE_ASSIGNED: 'ROLE_ASSIGNED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED'
};

export type LogAction = (typeof LogAction)[keyof typeof LogAction]


export const LogStatus: {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

export type LogStatus = (typeof LogStatus)[keyof typeof LogStatus]


export const BillStatus: {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus]


export const PaymentMethod: {
  CASH: 'CASH',
  CARD: 'CARD',
  ONLINE: 'ONLINE'
};

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

}

export type UserStatus = $Enums.UserStatus

export const UserStatus: typeof $Enums.UserStatus

export type UserType = $Enums.UserType

export const UserType: typeof $Enums.UserType

export type LogAction = $Enums.LogAction

export const LogAction: typeof $Enums.LogAction

export type LogStatus = $Enums.LogStatus

export const LogStatus: typeof $Enums.LogStatus

export type BillStatus = $Enums.BillStatus

export const BillStatus: typeof $Enums.BillStatus

export type PaymentMethod = $Enums.PaymentMethod

export const PaymentMethod: typeof $Enums.PaymentMethod

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Companies
 * const companies = await prisma.company.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Companies
   * const companies = await prisma.company.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.company`: Exposes CRUD operations for the **Company** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Companies
    * const companies = await prisma.company.findMany()
    * ```
    */
  get company(): Prisma.CompanyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.branch`: Exposes CRUD operations for the **Branch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Branches
    * const branches = await prisma.branch.findMany()
    * ```
    */
  get branch(): Prisma.BranchDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userInfo`: Exposes CRUD operations for the **UserInfo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserInfos
    * const userInfos = await prisma.userInfo.findMany()
    * ```
    */
  get userInfo(): Prisma.UserInfoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.role`: Exposes CRUD operations for the **Role** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Roles
    * const roles = await prisma.role.findMany()
    * ```
    */
  get role(): Prisma.RoleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.authority`: Exposes CRUD operations for the **Authority** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Authorities
    * const authorities = await prisma.authority.findMany()
    * ```
    */
  get authority(): Prisma.AuthorityDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userRole`: Exposes CRUD operations for the **UserRole** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserRoles
    * const userRoles = await prisma.userRole.findMany()
    * ```
    */
  get userRole(): Prisma.UserRoleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.roleAuthority`: Exposes CRUD operations for the **RoleAuthority** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RoleAuthorities
    * const roleAuthorities = await prisma.roleAuthority.findMany()
    * ```
    */
  get roleAuthority(): Prisma.RoleAuthorityDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userLog`: Exposes CRUD operations for the **UserLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserLogs
    * const userLogs = await prisma.userLog.findMany()
    * ```
    */
  get userLog(): Prisma.UserLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bill`: Exposes CRUD operations for the **Bill** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bills
    * const bills = await prisma.bill.findMany()
    * ```
    */
  get bill(): Prisma.BillDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.billItem`: Exposes CRUD operations for the **BillItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BillItems
    * const billItems = await prisma.billItem.findMany()
    * ```
    */
  get billItem(): Prisma.BillItemDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.0
   * Query Engine version: ab56fe763f921d033a6c195e7ddeb3e255bdbb57
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Company: 'Company',
    Branch: 'Branch',
    User: 'User',
    UserInfo: 'UserInfo',
    Role: 'Role',
    Authority: 'Authority',
    UserRole: 'UserRole',
    RoleAuthority: 'RoleAuthority',
    UserLog: 'UserLog',
    Product: 'Product',
    Bill: 'Bill',
    BillItem: 'BillItem'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "company" | "branch" | "user" | "userInfo" | "role" | "authority" | "userRole" | "roleAuthority" | "userLog" | "product" | "bill" | "billItem"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Company: {
        payload: Prisma.$CompanyPayload<ExtArgs>
        fields: Prisma.CompanyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CompanyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CompanyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          findFirst: {
            args: Prisma.CompanyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CompanyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          findMany: {
            args: Prisma.CompanyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          create: {
            args: Prisma.CompanyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          createMany: {
            args: Prisma.CompanyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CompanyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          delete: {
            args: Prisma.CompanyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          update: {
            args: Prisma.CompanyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          deleteMany: {
            args: Prisma.CompanyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CompanyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CompanyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          upsert: {
            args: Prisma.CompanyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          aggregate: {
            args: Prisma.CompanyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCompany>
          }
          groupBy: {
            args: Prisma.CompanyGroupByArgs<ExtArgs>
            result: $Utils.Optional<CompanyGroupByOutputType>[]
          }
          count: {
            args: Prisma.CompanyCountArgs<ExtArgs>
            result: $Utils.Optional<CompanyCountAggregateOutputType> | number
          }
        }
      }
      Branch: {
        payload: Prisma.$BranchPayload<ExtArgs>
        fields: Prisma.BranchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BranchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BranchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          findFirst: {
            args: Prisma.BranchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BranchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          findMany: {
            args: Prisma.BranchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>[]
          }
          create: {
            args: Prisma.BranchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          createMany: {
            args: Prisma.BranchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BranchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>[]
          }
          delete: {
            args: Prisma.BranchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          update: {
            args: Prisma.BranchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          deleteMany: {
            args: Prisma.BranchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BranchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BranchUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>[]
          }
          upsert: {
            args: Prisma.BranchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BranchPayload>
          }
          aggregate: {
            args: Prisma.BranchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBranch>
          }
          groupBy: {
            args: Prisma.BranchGroupByArgs<ExtArgs>
            result: $Utils.Optional<BranchGroupByOutputType>[]
          }
          count: {
            args: Prisma.BranchCountArgs<ExtArgs>
            result: $Utils.Optional<BranchCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      UserInfo: {
        payload: Prisma.$UserInfoPayload<ExtArgs>
        fields: Prisma.UserInfoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserInfoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserInfoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload>
          }
          findFirst: {
            args: Prisma.UserInfoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserInfoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload>
          }
          findMany: {
            args: Prisma.UserInfoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload>[]
          }
          create: {
            args: Prisma.UserInfoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload>
          }
          createMany: {
            args: Prisma.UserInfoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserInfoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload>[]
          }
          delete: {
            args: Prisma.UserInfoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload>
          }
          update: {
            args: Prisma.UserInfoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload>
          }
          deleteMany: {
            args: Prisma.UserInfoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserInfoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserInfoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload>[]
          }
          upsert: {
            args: Prisma.UserInfoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInfoPayload>
          }
          aggregate: {
            args: Prisma.UserInfoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserInfo>
          }
          groupBy: {
            args: Prisma.UserInfoGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserInfoGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserInfoCountArgs<ExtArgs>
            result: $Utils.Optional<UserInfoCountAggregateOutputType> | number
          }
        }
      }
      Role: {
        payload: Prisma.$RolePayload<ExtArgs>
        fields: Prisma.RoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          findFirst: {
            args: Prisma.RoleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          findMany: {
            args: Prisma.RoleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>[]
          }
          create: {
            args: Prisma.RoleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          createMany: {
            args: Prisma.RoleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RoleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>[]
          }
          delete: {
            args: Prisma.RoleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          update: {
            args: Prisma.RoleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          deleteMany: {
            args: Prisma.RoleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RoleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>[]
          }
          upsert: {
            args: Prisma.RoleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          aggregate: {
            args: Prisma.RoleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRole>
          }
          groupBy: {
            args: Prisma.RoleGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoleCountArgs<ExtArgs>
            result: $Utils.Optional<RoleCountAggregateOutputType> | number
          }
        }
      }
      Authority: {
        payload: Prisma.$AuthorityPayload<ExtArgs>
        fields: Prisma.AuthorityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuthorityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuthorityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload>
          }
          findFirst: {
            args: Prisma.AuthorityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuthorityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload>
          }
          findMany: {
            args: Prisma.AuthorityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload>[]
          }
          create: {
            args: Prisma.AuthorityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload>
          }
          createMany: {
            args: Prisma.AuthorityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuthorityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload>[]
          }
          delete: {
            args: Prisma.AuthorityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload>
          }
          update: {
            args: Prisma.AuthorityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload>
          }
          deleteMany: {
            args: Prisma.AuthorityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuthorityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuthorityUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload>[]
          }
          upsert: {
            args: Prisma.AuthorityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorityPayload>
          }
          aggregate: {
            args: Prisma.AuthorityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuthority>
          }
          groupBy: {
            args: Prisma.AuthorityGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuthorityGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuthorityCountArgs<ExtArgs>
            result: $Utils.Optional<AuthorityCountAggregateOutputType> | number
          }
        }
      }
      UserRole: {
        payload: Prisma.$UserRolePayload<ExtArgs>
        fields: Prisma.UserRoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserRoleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserRoleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload>
          }
          findFirst: {
            args: Prisma.UserRoleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserRoleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload>
          }
          findMany: {
            args: Prisma.UserRoleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload>[]
          }
          create: {
            args: Prisma.UserRoleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload>
          }
          createMany: {
            args: Prisma.UserRoleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserRoleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload>[]
          }
          delete: {
            args: Prisma.UserRoleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload>
          }
          update: {
            args: Prisma.UserRoleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload>
          }
          deleteMany: {
            args: Prisma.UserRoleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserRoleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserRoleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload>[]
          }
          upsert: {
            args: Prisma.UserRoleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRolePayload>
          }
          aggregate: {
            args: Prisma.UserRoleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserRole>
          }
          groupBy: {
            args: Prisma.UserRoleGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserRoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserRoleCountArgs<ExtArgs>
            result: $Utils.Optional<UserRoleCountAggregateOutputType> | number
          }
        }
      }
      RoleAuthority: {
        payload: Prisma.$RoleAuthorityPayload<ExtArgs>
        fields: Prisma.RoleAuthorityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoleAuthorityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoleAuthorityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload>
          }
          findFirst: {
            args: Prisma.RoleAuthorityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoleAuthorityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload>
          }
          findMany: {
            args: Prisma.RoleAuthorityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload>[]
          }
          create: {
            args: Prisma.RoleAuthorityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload>
          }
          createMany: {
            args: Prisma.RoleAuthorityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RoleAuthorityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload>[]
          }
          delete: {
            args: Prisma.RoleAuthorityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload>
          }
          update: {
            args: Prisma.RoleAuthorityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload>
          }
          deleteMany: {
            args: Prisma.RoleAuthorityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoleAuthorityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RoleAuthorityUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload>[]
          }
          upsert: {
            args: Prisma.RoleAuthorityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoleAuthorityPayload>
          }
          aggregate: {
            args: Prisma.RoleAuthorityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoleAuthority>
          }
          groupBy: {
            args: Prisma.RoleAuthorityGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoleAuthorityGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoleAuthorityCountArgs<ExtArgs>
            result: $Utils.Optional<RoleAuthorityCountAggregateOutputType> | number
          }
        }
      }
      UserLog: {
        payload: Prisma.$UserLogPayload<ExtArgs>
        fields: Prisma.UserLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload>
          }
          findFirst: {
            args: Prisma.UserLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload>
          }
          findMany: {
            args: Prisma.UserLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload>[]
          }
          create: {
            args: Prisma.UserLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload>
          }
          createMany: {
            args: Prisma.UserLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload>[]
          }
          delete: {
            args: Prisma.UserLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload>
          }
          update: {
            args: Prisma.UserLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload>
          }
          deleteMany: {
            args: Prisma.UserLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload>[]
          }
          upsert: {
            args: Prisma.UserLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserLogPayload>
          }
          aggregate: {
            args: Prisma.UserLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserLog>
          }
          groupBy: {
            args: Prisma.UserLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserLogCountArgs<ExtArgs>
            result: $Utils.Optional<UserLogCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      Bill: {
        payload: Prisma.$BillPayload<ExtArgs>
        fields: Prisma.BillFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BillFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BillFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload>
          }
          findFirst: {
            args: Prisma.BillFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BillFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload>
          }
          findMany: {
            args: Prisma.BillFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload>[]
          }
          create: {
            args: Prisma.BillCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload>
          }
          createMany: {
            args: Prisma.BillCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BillCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload>[]
          }
          delete: {
            args: Prisma.BillDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload>
          }
          update: {
            args: Prisma.BillUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload>
          }
          deleteMany: {
            args: Prisma.BillDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BillUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BillUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload>[]
          }
          upsert: {
            args: Prisma.BillUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillPayload>
          }
          aggregate: {
            args: Prisma.BillAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBill>
          }
          groupBy: {
            args: Prisma.BillGroupByArgs<ExtArgs>
            result: $Utils.Optional<BillGroupByOutputType>[]
          }
          count: {
            args: Prisma.BillCountArgs<ExtArgs>
            result: $Utils.Optional<BillCountAggregateOutputType> | number
          }
        }
      }
      BillItem: {
        payload: Prisma.$BillItemPayload<ExtArgs>
        fields: Prisma.BillItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BillItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BillItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload>
          }
          findFirst: {
            args: Prisma.BillItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BillItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload>
          }
          findMany: {
            args: Prisma.BillItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload>[]
          }
          create: {
            args: Prisma.BillItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload>
          }
          createMany: {
            args: Prisma.BillItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BillItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload>[]
          }
          delete: {
            args: Prisma.BillItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload>
          }
          update: {
            args: Prisma.BillItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload>
          }
          deleteMany: {
            args: Prisma.BillItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BillItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BillItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload>[]
          }
          upsert: {
            args: Prisma.BillItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BillItemPayload>
          }
          aggregate: {
            args: Prisma.BillItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBillItem>
          }
          groupBy: {
            args: Prisma.BillItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<BillItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.BillItemCountArgs<ExtArgs>
            result: $Utils.Optional<BillItemCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    company?: CompanyOmit
    branch?: BranchOmit
    user?: UserOmit
    userInfo?: UserInfoOmit
    role?: RoleOmit
    authority?: AuthorityOmit
    userRole?: UserRoleOmit
    roleAuthority?: RoleAuthorityOmit
    userLog?: UserLogOmit
    product?: ProductOmit
    bill?: BillOmit
    billItem?: BillItemOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CompanyCountOutputType
   */

  export type CompanyCountOutputType = {
    branches: number
    users: number
    products: number
    bills: number
  }

  export type CompanyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    branches?: boolean | CompanyCountOutputTypeCountBranchesArgs
    users?: boolean | CompanyCountOutputTypeCountUsersArgs
    products?: boolean | CompanyCountOutputTypeCountProductsArgs
    bills?: boolean | CompanyCountOutputTypeCountBillsArgs
  }

  // Custom InputTypes
  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompanyCountOutputType
     */
    select?: CompanyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountBranchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BranchWhereInput
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountBillsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillWhereInput
  }


  /**
   * Count Type BranchCountOutputType
   */

  export type BranchCountOutputType = {
    users: number
    logs: number
    products: number
    bills: number
  }

  export type BranchCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | BranchCountOutputTypeCountUsersArgs
    logs?: boolean | BranchCountOutputTypeCountLogsArgs
    products?: boolean | BranchCountOutputTypeCountProductsArgs
    bills?: boolean | BranchCountOutputTypeCountBillsArgs
  }

  // Custom InputTypes
  /**
   * BranchCountOutputType without action
   */
  export type BranchCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BranchCountOutputType
     */
    select?: BranchCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BranchCountOutputType without action
   */
  export type BranchCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * BranchCountOutputType without action
   */
  export type BranchCountOutputTypeCountLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserLogWhereInput
  }

  /**
   * BranchCountOutputType without action
   */
  export type BranchCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }

  /**
   * BranchCountOutputType without action
   */
  export type BranchCountOutputTypeCountBillsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    bills: number
    userRoles: number
    logs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bills?: boolean | UserCountOutputTypeCountBillsArgs
    userRoles?: boolean | UserCountOutputTypeCountUserRolesArgs
    logs?: boolean | UserCountOutputTypeCountLogsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBillsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRoleWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserLogWhereInput
  }


  /**
   * Count Type RoleCountOutputType
   */

  export type RoleCountOutputType = {
    userRoles: number
    authorities: number
  }

  export type RoleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userRoles?: boolean | RoleCountOutputTypeCountUserRolesArgs
    authorities?: boolean | RoleCountOutputTypeCountAuthoritiesArgs
  }

  // Custom InputTypes
  /**
   * RoleCountOutputType without action
   */
  export type RoleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleCountOutputType
     */
    select?: RoleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RoleCountOutputType without action
   */
  export type RoleCountOutputTypeCountUserRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRoleWhereInput
  }

  /**
   * RoleCountOutputType without action
   */
  export type RoleCountOutputTypeCountAuthoritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleAuthorityWhereInput
  }


  /**
   * Count Type AuthorityCountOutputType
   */

  export type AuthorityCountOutputType = {
    roles: number
  }

  export type AuthorityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    roles?: boolean | AuthorityCountOutputTypeCountRolesArgs
  }

  // Custom InputTypes
  /**
   * AuthorityCountOutputType without action
   */
  export type AuthorityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthorityCountOutputType
     */
    select?: AuthorityCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AuthorityCountOutputType without action
   */
  export type AuthorityCountOutputTypeCountRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleAuthorityWhereInput
  }


  /**
   * Count Type ProductCountOutputType
   */

  export type ProductCountOutputType = {
    billItems: number
  }

  export type ProductCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    billItems?: boolean | ProductCountOutputTypeCountBillItemsArgs
  }

  // Custom InputTypes
  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCountOutputType
     */
    select?: ProductCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountBillItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillItemWhereInput
  }


  /**
   * Count Type BillCountOutputType
   */

  export type BillCountOutputType = {
    items: number
  }

  export type BillCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | BillCountOutputTypeCountItemsArgs
  }

  // Custom InputTypes
  /**
   * BillCountOutputType without action
   */
  export type BillCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillCountOutputType
     */
    select?: BillCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BillCountOutputType without action
   */
  export type BillCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillItemWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Company
   */

  export type AggregateCompany = {
    _count: CompanyCountAggregateOutputType | null
    _avg: CompanyAvgAggregateOutputType | null
    _sum: CompanySumAggregateOutputType | null
    _min: CompanyMinAggregateOutputType | null
    _max: CompanyMaxAggregateOutputType | null
  }

  export type CompanyAvgAggregateOutputType = {
    id: number | null
  }

  export type CompanySumAggregateOutputType = {
    id: number | null
  }

  export type CompanyMinAggregateOutputType = {
    id: number | null
    name: string | null
    code: string | null
    email: string | null
    phone: string | null
    address: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CompanyMaxAggregateOutputType = {
    id: number | null
    name: string | null
    code: string | null
    email: string | null
    phone: string | null
    address: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CompanyCountAggregateOutputType = {
    id: number
    name: number
    code: number
    email: number
    phone: number
    address: number
    is_active: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type CompanyAvgAggregateInputType = {
    id?: true
  }

  export type CompanySumAggregateInputType = {
    id?: true
  }

  export type CompanyMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    email?: true
    phone?: true
    address?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type CompanyMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    email?: true
    phone?: true
    address?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type CompanyCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    email?: true
    phone?: true
    address?: true
    is_active?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type CompanyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Company to aggregate.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Companies
    **/
    _count?: true | CompanyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CompanyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CompanySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CompanyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CompanyMaxAggregateInputType
  }

  export type GetCompanyAggregateType<T extends CompanyAggregateArgs> = {
        [P in keyof T & keyof AggregateCompany]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCompany[P]>
      : GetScalarType<T[P], AggregateCompany[P]>
  }




  export type CompanyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CompanyWhereInput
    orderBy?: CompanyOrderByWithAggregationInput | CompanyOrderByWithAggregationInput[]
    by: CompanyScalarFieldEnum[] | CompanyScalarFieldEnum
    having?: CompanyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CompanyCountAggregateInputType | true
    _avg?: CompanyAvgAggregateInputType
    _sum?: CompanySumAggregateInputType
    _min?: CompanyMinAggregateInputType
    _max?: CompanyMaxAggregateInputType
  }

  export type CompanyGroupByOutputType = {
    id: number
    name: string
    code: string
    email: string | null
    phone: string | null
    address: string | null
    is_active: boolean
    created_at: Date
    updated_at: Date
    _count: CompanyCountAggregateOutputType | null
    _avg: CompanyAvgAggregateOutputType | null
    _sum: CompanySumAggregateOutputType | null
    _min: CompanyMinAggregateOutputType | null
    _max: CompanyMaxAggregateOutputType | null
  }

  type GetCompanyGroupByPayload<T extends CompanyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CompanyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CompanyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CompanyGroupByOutputType[P]>
            : GetScalarType<T[P], CompanyGroupByOutputType[P]>
        }
      >
    >


  export type CompanySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    branches?: boolean | Company$branchesArgs<ExtArgs>
    users?: boolean | Company$usersArgs<ExtArgs>
    products?: boolean | Company$productsArgs<ExtArgs>
    bills?: boolean | Company$billsArgs<ExtArgs>
    _count?: boolean | CompanyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["company"]>

  export type CompanySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["company"]>

  export type CompanySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["company"]>

  export type CompanySelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type CompanyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "code" | "email" | "phone" | "address" | "is_active" | "created_at" | "updated_at", ExtArgs["result"]["company"]>
  export type CompanyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    branches?: boolean | Company$branchesArgs<ExtArgs>
    users?: boolean | Company$usersArgs<ExtArgs>
    products?: boolean | Company$productsArgs<ExtArgs>
    bills?: boolean | Company$billsArgs<ExtArgs>
    _count?: boolean | CompanyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CompanyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CompanyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CompanyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Company"
    objects: {
      branches: Prisma.$BranchPayload<ExtArgs>[]
      users: Prisma.$UserPayload<ExtArgs>[]
      products: Prisma.$ProductPayload<ExtArgs>[]
      bills: Prisma.$BillPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      code: string
      email: string | null
      phone: string | null
      address: string | null
      is_active: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["company"]>
    composites: {}
  }

  type CompanyGetPayload<S extends boolean | null | undefined | CompanyDefaultArgs> = $Result.GetResult<Prisma.$CompanyPayload, S>

  type CompanyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CompanyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CompanyCountAggregateInputType | true
    }

  export interface CompanyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Company'], meta: { name: 'Company' } }
    /**
     * Find zero or one Company that matches the filter.
     * @param {CompanyFindUniqueArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CompanyFindUniqueArgs>(args: SelectSubset<T, CompanyFindUniqueArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Company that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CompanyFindUniqueOrThrowArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CompanyFindUniqueOrThrowArgs>(args: SelectSubset<T, CompanyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Company that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindFirstArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CompanyFindFirstArgs>(args?: SelectSubset<T, CompanyFindFirstArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Company that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindFirstOrThrowArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CompanyFindFirstOrThrowArgs>(args?: SelectSubset<T, CompanyFindFirstOrThrowArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Companies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Companies
     * const companies = await prisma.company.findMany()
     * 
     * // Get first 10 Companies
     * const companies = await prisma.company.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const companyWithIdOnly = await prisma.company.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CompanyFindManyArgs>(args?: SelectSubset<T, CompanyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Company.
     * @param {CompanyCreateArgs} args - Arguments to create a Company.
     * @example
     * // Create one Company
     * const Company = await prisma.company.create({
     *   data: {
     *     // ... data to create a Company
     *   }
     * })
     * 
     */
    create<T extends CompanyCreateArgs>(args: SelectSubset<T, CompanyCreateArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Companies.
     * @param {CompanyCreateManyArgs} args - Arguments to create many Companies.
     * @example
     * // Create many Companies
     * const company = await prisma.company.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CompanyCreateManyArgs>(args?: SelectSubset<T, CompanyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Companies and returns the data saved in the database.
     * @param {CompanyCreateManyAndReturnArgs} args - Arguments to create many Companies.
     * @example
     * // Create many Companies
     * const company = await prisma.company.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Companies and only return the `id`
     * const companyWithIdOnly = await prisma.company.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CompanyCreateManyAndReturnArgs>(args?: SelectSubset<T, CompanyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Company.
     * @param {CompanyDeleteArgs} args - Arguments to delete one Company.
     * @example
     * // Delete one Company
     * const Company = await prisma.company.delete({
     *   where: {
     *     // ... filter to delete one Company
     *   }
     * })
     * 
     */
    delete<T extends CompanyDeleteArgs>(args: SelectSubset<T, CompanyDeleteArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Company.
     * @param {CompanyUpdateArgs} args - Arguments to update one Company.
     * @example
     * // Update one Company
     * const company = await prisma.company.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CompanyUpdateArgs>(args: SelectSubset<T, CompanyUpdateArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Companies.
     * @param {CompanyDeleteManyArgs} args - Arguments to filter Companies to delete.
     * @example
     * // Delete a few Companies
     * const { count } = await prisma.company.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CompanyDeleteManyArgs>(args?: SelectSubset<T, CompanyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Companies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Companies
     * const company = await prisma.company.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CompanyUpdateManyArgs>(args: SelectSubset<T, CompanyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Companies and returns the data updated in the database.
     * @param {CompanyUpdateManyAndReturnArgs} args - Arguments to update many Companies.
     * @example
     * // Update many Companies
     * const company = await prisma.company.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Companies and only return the `id`
     * const companyWithIdOnly = await prisma.company.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CompanyUpdateManyAndReturnArgs>(args: SelectSubset<T, CompanyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Company.
     * @param {CompanyUpsertArgs} args - Arguments to update or create a Company.
     * @example
     * // Update or create a Company
     * const company = await prisma.company.upsert({
     *   create: {
     *     // ... data to create a Company
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Company we want to update
     *   }
     * })
     */
    upsert<T extends CompanyUpsertArgs>(args: SelectSubset<T, CompanyUpsertArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Companies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyCountArgs} args - Arguments to filter Companies to count.
     * @example
     * // Count the number of Companies
     * const count = await prisma.company.count({
     *   where: {
     *     // ... the filter for the Companies we want to count
     *   }
     * })
    **/
    count<T extends CompanyCountArgs>(
      args?: Subset<T, CompanyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CompanyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Company.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CompanyAggregateArgs>(args: Subset<T, CompanyAggregateArgs>): Prisma.PrismaPromise<GetCompanyAggregateType<T>>

    /**
     * Group by Company.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CompanyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CompanyGroupByArgs['orderBy'] }
        : { orderBy?: CompanyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CompanyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCompanyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Company model
   */
  readonly fields: CompanyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Company.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CompanyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    branches<T extends Company$branchesArgs<ExtArgs> = {}>(args?: Subset<T, Company$branchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    users<T extends Company$usersArgs<ExtArgs> = {}>(args?: Subset<T, Company$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    products<T extends Company$productsArgs<ExtArgs> = {}>(args?: Subset<T, Company$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    bills<T extends Company$billsArgs<ExtArgs> = {}>(args?: Subset<T, Company$billsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Company model
   */
  interface CompanyFieldRefs {
    readonly id: FieldRef<"Company", 'Int'>
    readonly name: FieldRef<"Company", 'String'>
    readonly code: FieldRef<"Company", 'String'>
    readonly email: FieldRef<"Company", 'String'>
    readonly phone: FieldRef<"Company", 'String'>
    readonly address: FieldRef<"Company", 'String'>
    readonly is_active: FieldRef<"Company", 'Boolean'>
    readonly created_at: FieldRef<"Company", 'DateTime'>
    readonly updated_at: FieldRef<"Company", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Company findUnique
   */
  export type CompanyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company findUniqueOrThrow
   */
  export type CompanyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company findFirst
   */
  export type CompanyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Companies.
     */
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company findFirstOrThrow
   */
  export type CompanyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Companies.
     */
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company findMany
   */
  export type CompanyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Companies to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company create
   */
  export type CompanyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The data needed to create a Company.
     */
    data: XOR<CompanyCreateInput, CompanyUncheckedCreateInput>
  }

  /**
   * Company createMany
   */
  export type CompanyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Companies.
     */
    data: CompanyCreateManyInput | CompanyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Company createManyAndReturn
   */
  export type CompanyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * The data used to create many Companies.
     */
    data: CompanyCreateManyInput | CompanyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Company update
   */
  export type CompanyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The data needed to update a Company.
     */
    data: XOR<CompanyUpdateInput, CompanyUncheckedUpdateInput>
    /**
     * Choose, which Company to update.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company updateMany
   */
  export type CompanyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Companies.
     */
    data: XOR<CompanyUpdateManyMutationInput, CompanyUncheckedUpdateManyInput>
    /**
     * Filter which Companies to update
     */
    where?: CompanyWhereInput
    /**
     * Limit how many Companies to update.
     */
    limit?: number
  }

  /**
   * Company updateManyAndReturn
   */
  export type CompanyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * The data used to update Companies.
     */
    data: XOR<CompanyUpdateManyMutationInput, CompanyUncheckedUpdateManyInput>
    /**
     * Filter which Companies to update
     */
    where?: CompanyWhereInput
    /**
     * Limit how many Companies to update.
     */
    limit?: number
  }

  /**
   * Company upsert
   */
  export type CompanyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The filter to search for the Company to update in case it exists.
     */
    where: CompanyWhereUniqueInput
    /**
     * In case the Company found by the `where` argument doesn't exist, create a new Company with this data.
     */
    create: XOR<CompanyCreateInput, CompanyUncheckedCreateInput>
    /**
     * In case the Company was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CompanyUpdateInput, CompanyUncheckedUpdateInput>
  }

  /**
   * Company delete
   */
  export type CompanyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter which Company to delete.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company deleteMany
   */
  export type CompanyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Companies to delete
     */
    where?: CompanyWhereInput
    /**
     * Limit how many Companies to delete.
     */
    limit?: number
  }

  /**
   * Company.branches
   */
  export type Company$branchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    where?: BranchWhereInput
    orderBy?: BranchOrderByWithRelationInput | BranchOrderByWithRelationInput[]
    cursor?: BranchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BranchScalarFieldEnum | BranchScalarFieldEnum[]
  }

  /**
   * Company.users
   */
  export type Company$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Company.products
   */
  export type Company$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Company.bills
   */
  export type Company$billsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    where?: BillWhereInput
    orderBy?: BillOrderByWithRelationInput | BillOrderByWithRelationInput[]
    cursor?: BillWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BillScalarFieldEnum | BillScalarFieldEnum[]
  }

  /**
   * Company without action
   */
  export type CompanyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Company
     */
    omit?: CompanyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
  }


  /**
   * Model Branch
   */

  export type AggregateBranch = {
    _count: BranchCountAggregateOutputType | null
    _avg: BranchAvgAggregateOutputType | null
    _sum: BranchSumAggregateOutputType | null
    _min: BranchMinAggregateOutputType | null
    _max: BranchMaxAggregateOutputType | null
  }

  export type BranchAvgAggregateOutputType = {
    id: number | null
    company_id: number | null
  }

  export type BranchSumAggregateOutputType = {
    id: number | null
    company_id: number | null
  }

  export type BranchMinAggregateOutputType = {
    id: number | null
    company_id: number | null
    name: string | null
    code: string | null
    address: string | null
    phone: string | null
    email: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type BranchMaxAggregateOutputType = {
    id: number | null
    company_id: number | null
    name: string | null
    code: string | null
    address: string | null
    phone: string | null
    email: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type BranchCountAggregateOutputType = {
    id: number
    company_id: number
    name: number
    code: number
    address: number
    phone: number
    email: number
    is_active: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type BranchAvgAggregateInputType = {
    id?: true
    company_id?: true
  }

  export type BranchSumAggregateInputType = {
    id?: true
    company_id?: true
  }

  export type BranchMinAggregateInputType = {
    id?: true
    company_id?: true
    name?: true
    code?: true
    address?: true
    phone?: true
    email?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type BranchMaxAggregateInputType = {
    id?: true
    company_id?: true
    name?: true
    code?: true
    address?: true
    phone?: true
    email?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type BranchCountAggregateInputType = {
    id?: true
    company_id?: true
    name?: true
    code?: true
    address?: true
    phone?: true
    email?: true
    is_active?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type BranchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Branch to aggregate.
     */
    where?: BranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Branches to fetch.
     */
    orderBy?: BranchOrderByWithRelationInput | BranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Branches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Branches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Branches
    **/
    _count?: true | BranchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BranchAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BranchSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BranchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BranchMaxAggregateInputType
  }

  export type GetBranchAggregateType<T extends BranchAggregateArgs> = {
        [P in keyof T & keyof AggregateBranch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBranch[P]>
      : GetScalarType<T[P], AggregateBranch[P]>
  }




  export type BranchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BranchWhereInput
    orderBy?: BranchOrderByWithAggregationInput | BranchOrderByWithAggregationInput[]
    by: BranchScalarFieldEnum[] | BranchScalarFieldEnum
    having?: BranchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BranchCountAggregateInputType | true
    _avg?: BranchAvgAggregateInputType
    _sum?: BranchSumAggregateInputType
    _min?: BranchMinAggregateInputType
    _max?: BranchMaxAggregateInputType
  }

  export type BranchGroupByOutputType = {
    id: number
    company_id: number
    name: string
    code: string
    address: string | null
    phone: string | null
    email: string | null
    is_active: boolean
    created_at: Date
    updated_at: Date
    _count: BranchCountAggregateOutputType | null
    _avg: BranchAvgAggregateOutputType | null
    _sum: BranchSumAggregateOutputType | null
    _min: BranchMinAggregateOutputType | null
    _max: BranchMaxAggregateOutputType | null
  }

  type GetBranchGroupByPayload<T extends BranchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BranchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BranchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BranchGroupByOutputType[P]>
            : GetScalarType<T[P], BranchGroupByOutputType[P]>
        }
      >
    >


  export type BranchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    company_id?: boolean
    name?: boolean
    code?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    users?: boolean | Branch$usersArgs<ExtArgs>
    logs?: boolean | Branch$logsArgs<ExtArgs>
    products?: boolean | Branch$productsArgs<ExtArgs>
    bills?: boolean | Branch$billsArgs<ExtArgs>
    _count?: boolean | BranchCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["branch"]>

  export type BranchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    company_id?: boolean
    name?: boolean
    code?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["branch"]>

  export type BranchSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    company_id?: boolean
    name?: boolean
    code?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["branch"]>

  export type BranchSelectScalar = {
    id?: boolean
    company_id?: boolean
    name?: boolean
    code?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type BranchOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "company_id" | "name" | "code" | "address" | "phone" | "email" | "is_active" | "created_at" | "updated_at", ExtArgs["result"]["branch"]>
  export type BranchInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    users?: boolean | Branch$usersArgs<ExtArgs>
    logs?: boolean | Branch$logsArgs<ExtArgs>
    products?: boolean | Branch$productsArgs<ExtArgs>
    bills?: boolean | Branch$billsArgs<ExtArgs>
    _count?: boolean | BranchCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BranchIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type BranchIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }

  export type $BranchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Branch"
    objects: {
      company: Prisma.$CompanyPayload<ExtArgs>
      users: Prisma.$UserPayload<ExtArgs>[]
      logs: Prisma.$UserLogPayload<ExtArgs>[]
      products: Prisma.$ProductPayload<ExtArgs>[]
      bills: Prisma.$BillPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      company_id: number
      name: string
      code: string
      address: string | null
      phone: string | null
      email: string | null
      is_active: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["branch"]>
    composites: {}
  }

  type BranchGetPayload<S extends boolean | null | undefined | BranchDefaultArgs> = $Result.GetResult<Prisma.$BranchPayload, S>

  type BranchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BranchFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BranchCountAggregateInputType | true
    }

  export interface BranchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Branch'], meta: { name: 'Branch' } }
    /**
     * Find zero or one Branch that matches the filter.
     * @param {BranchFindUniqueArgs} args - Arguments to find a Branch
     * @example
     * // Get one Branch
     * const branch = await prisma.branch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BranchFindUniqueArgs>(args: SelectSubset<T, BranchFindUniqueArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Branch that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BranchFindUniqueOrThrowArgs} args - Arguments to find a Branch
     * @example
     * // Get one Branch
     * const branch = await prisma.branch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BranchFindUniqueOrThrowArgs>(args: SelectSubset<T, BranchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Branch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchFindFirstArgs} args - Arguments to find a Branch
     * @example
     * // Get one Branch
     * const branch = await prisma.branch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BranchFindFirstArgs>(args?: SelectSubset<T, BranchFindFirstArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Branch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchFindFirstOrThrowArgs} args - Arguments to find a Branch
     * @example
     * // Get one Branch
     * const branch = await prisma.branch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BranchFindFirstOrThrowArgs>(args?: SelectSubset<T, BranchFindFirstOrThrowArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Branches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Branches
     * const branches = await prisma.branch.findMany()
     * 
     * // Get first 10 Branches
     * const branches = await prisma.branch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const branchWithIdOnly = await prisma.branch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BranchFindManyArgs>(args?: SelectSubset<T, BranchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Branch.
     * @param {BranchCreateArgs} args - Arguments to create a Branch.
     * @example
     * // Create one Branch
     * const Branch = await prisma.branch.create({
     *   data: {
     *     // ... data to create a Branch
     *   }
     * })
     * 
     */
    create<T extends BranchCreateArgs>(args: SelectSubset<T, BranchCreateArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Branches.
     * @param {BranchCreateManyArgs} args - Arguments to create many Branches.
     * @example
     * // Create many Branches
     * const branch = await prisma.branch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BranchCreateManyArgs>(args?: SelectSubset<T, BranchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Branches and returns the data saved in the database.
     * @param {BranchCreateManyAndReturnArgs} args - Arguments to create many Branches.
     * @example
     * // Create many Branches
     * const branch = await prisma.branch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Branches and only return the `id`
     * const branchWithIdOnly = await prisma.branch.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BranchCreateManyAndReturnArgs>(args?: SelectSubset<T, BranchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Branch.
     * @param {BranchDeleteArgs} args - Arguments to delete one Branch.
     * @example
     * // Delete one Branch
     * const Branch = await prisma.branch.delete({
     *   where: {
     *     // ... filter to delete one Branch
     *   }
     * })
     * 
     */
    delete<T extends BranchDeleteArgs>(args: SelectSubset<T, BranchDeleteArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Branch.
     * @param {BranchUpdateArgs} args - Arguments to update one Branch.
     * @example
     * // Update one Branch
     * const branch = await prisma.branch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BranchUpdateArgs>(args: SelectSubset<T, BranchUpdateArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Branches.
     * @param {BranchDeleteManyArgs} args - Arguments to filter Branches to delete.
     * @example
     * // Delete a few Branches
     * const { count } = await prisma.branch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BranchDeleteManyArgs>(args?: SelectSubset<T, BranchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Branches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Branches
     * const branch = await prisma.branch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BranchUpdateManyArgs>(args: SelectSubset<T, BranchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Branches and returns the data updated in the database.
     * @param {BranchUpdateManyAndReturnArgs} args - Arguments to update many Branches.
     * @example
     * // Update many Branches
     * const branch = await prisma.branch.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Branches and only return the `id`
     * const branchWithIdOnly = await prisma.branch.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BranchUpdateManyAndReturnArgs>(args: SelectSubset<T, BranchUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Branch.
     * @param {BranchUpsertArgs} args - Arguments to update or create a Branch.
     * @example
     * // Update or create a Branch
     * const branch = await prisma.branch.upsert({
     *   create: {
     *     // ... data to create a Branch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Branch we want to update
     *   }
     * })
     */
    upsert<T extends BranchUpsertArgs>(args: SelectSubset<T, BranchUpsertArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Branches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchCountArgs} args - Arguments to filter Branches to count.
     * @example
     * // Count the number of Branches
     * const count = await prisma.branch.count({
     *   where: {
     *     // ... the filter for the Branches we want to count
     *   }
     * })
    **/
    count<T extends BranchCountArgs>(
      args?: Subset<T, BranchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BranchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Branch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BranchAggregateArgs>(args: Subset<T, BranchAggregateArgs>): Prisma.PrismaPromise<GetBranchAggregateType<T>>

    /**
     * Group by Branch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BranchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BranchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BranchGroupByArgs['orderBy'] }
        : { orderBy?: BranchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BranchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBranchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Branch model
   */
  readonly fields: BranchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Branch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BranchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    users<T extends Branch$usersArgs<ExtArgs> = {}>(args?: Subset<T, Branch$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    logs<T extends Branch$logsArgs<ExtArgs> = {}>(args?: Subset<T, Branch$logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    products<T extends Branch$productsArgs<ExtArgs> = {}>(args?: Subset<T, Branch$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    bills<T extends Branch$billsArgs<ExtArgs> = {}>(args?: Subset<T, Branch$billsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Branch model
   */
  interface BranchFieldRefs {
    readonly id: FieldRef<"Branch", 'Int'>
    readonly company_id: FieldRef<"Branch", 'Int'>
    readonly name: FieldRef<"Branch", 'String'>
    readonly code: FieldRef<"Branch", 'String'>
    readonly address: FieldRef<"Branch", 'String'>
    readonly phone: FieldRef<"Branch", 'String'>
    readonly email: FieldRef<"Branch", 'String'>
    readonly is_active: FieldRef<"Branch", 'Boolean'>
    readonly created_at: FieldRef<"Branch", 'DateTime'>
    readonly updated_at: FieldRef<"Branch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Branch findUnique
   */
  export type BranchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branch to fetch.
     */
    where: BranchWhereUniqueInput
  }

  /**
   * Branch findUniqueOrThrow
   */
  export type BranchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branch to fetch.
     */
    where: BranchWhereUniqueInput
  }

  /**
   * Branch findFirst
   */
  export type BranchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branch to fetch.
     */
    where?: BranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Branches to fetch.
     */
    orderBy?: BranchOrderByWithRelationInput | BranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Branches.
     */
    cursor?: BranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Branches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Branches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Branches.
     */
    distinct?: BranchScalarFieldEnum | BranchScalarFieldEnum[]
  }

  /**
   * Branch findFirstOrThrow
   */
  export type BranchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branch to fetch.
     */
    where?: BranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Branches to fetch.
     */
    orderBy?: BranchOrderByWithRelationInput | BranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Branches.
     */
    cursor?: BranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Branches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Branches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Branches.
     */
    distinct?: BranchScalarFieldEnum | BranchScalarFieldEnum[]
  }

  /**
   * Branch findMany
   */
  export type BranchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter, which Branches to fetch.
     */
    where?: BranchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Branches to fetch.
     */
    orderBy?: BranchOrderByWithRelationInput | BranchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Branches.
     */
    cursor?: BranchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Branches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Branches.
     */
    skip?: number
    distinct?: BranchScalarFieldEnum | BranchScalarFieldEnum[]
  }

  /**
   * Branch create
   */
  export type BranchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * The data needed to create a Branch.
     */
    data: XOR<BranchCreateInput, BranchUncheckedCreateInput>
  }

  /**
   * Branch createMany
   */
  export type BranchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Branches.
     */
    data: BranchCreateManyInput | BranchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Branch createManyAndReturn
   */
  export type BranchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * The data used to create many Branches.
     */
    data: BranchCreateManyInput | BranchCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Branch update
   */
  export type BranchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * The data needed to update a Branch.
     */
    data: XOR<BranchUpdateInput, BranchUncheckedUpdateInput>
    /**
     * Choose, which Branch to update.
     */
    where: BranchWhereUniqueInput
  }

  /**
   * Branch updateMany
   */
  export type BranchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Branches.
     */
    data: XOR<BranchUpdateManyMutationInput, BranchUncheckedUpdateManyInput>
    /**
     * Filter which Branches to update
     */
    where?: BranchWhereInput
    /**
     * Limit how many Branches to update.
     */
    limit?: number
  }

  /**
   * Branch updateManyAndReturn
   */
  export type BranchUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * The data used to update Branches.
     */
    data: XOR<BranchUpdateManyMutationInput, BranchUncheckedUpdateManyInput>
    /**
     * Filter which Branches to update
     */
    where?: BranchWhereInput
    /**
     * Limit how many Branches to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Branch upsert
   */
  export type BranchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * The filter to search for the Branch to update in case it exists.
     */
    where: BranchWhereUniqueInput
    /**
     * In case the Branch found by the `where` argument doesn't exist, create a new Branch with this data.
     */
    create: XOR<BranchCreateInput, BranchUncheckedCreateInput>
    /**
     * In case the Branch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BranchUpdateInput, BranchUncheckedUpdateInput>
  }

  /**
   * Branch delete
   */
  export type BranchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    /**
     * Filter which Branch to delete.
     */
    where: BranchWhereUniqueInput
  }

  /**
   * Branch deleteMany
   */
  export type BranchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Branches to delete
     */
    where?: BranchWhereInput
    /**
     * Limit how many Branches to delete.
     */
    limit?: number
  }

  /**
   * Branch.users
   */
  export type Branch$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Branch.logs
   */
  export type Branch$logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    where?: UserLogWhereInput
    orderBy?: UserLogOrderByWithRelationInput | UserLogOrderByWithRelationInput[]
    cursor?: UserLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserLogScalarFieldEnum | UserLogScalarFieldEnum[]
  }

  /**
   * Branch.products
   */
  export type Branch$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Branch.bills
   */
  export type Branch$billsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    where?: BillWhereInput
    orderBy?: BillOrderByWithRelationInput | BillOrderByWithRelationInput[]
    cursor?: BillWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BillScalarFieldEnum | BillScalarFieldEnum[]
  }

  /**
   * Branch without action
   */
  export type BranchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
    company_id: number | null
    branch_id: number | null
    failed_login_attempts: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
    company_id: number | null
    branch_id: number | null
    failed_login_attempts: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    username: string | null
    password: string | null
    company_id: number | null
    branch_id: number | null
    user_type: $Enums.UserType | null
    status: $Enums.UserStatus | null
    failed_login_attempts: number | null
    last_failed_login: Date | null
    account_locked_until: Date | null
    last_login_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    username: string | null
    password: string | null
    company_id: number | null
    branch_id: number | null
    user_type: $Enums.UserType | null
    status: $Enums.UserStatus | null
    failed_login_attempts: number | null
    last_failed_login: Date | null
    account_locked_until: Date | null
    last_login_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    username: number
    password: number
    company_id: number
    branch_id: number
    user_type: number
    status: number
    failed_login_attempts: number
    last_failed_login: number
    account_locked_until: number
    last_login_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
    company_id?: true
    branch_id?: true
    failed_login_attempts?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
    company_id?: true
    branch_id?: true
    failed_login_attempts?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    username?: true
    password?: true
    company_id?: true
    branch_id?: true
    user_type?: true
    status?: true
    failed_login_attempts?: true
    last_failed_login?: true
    account_locked_until?: true
    last_login_at?: true
    created_at?: true
    updated_at?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    username?: true
    password?: true
    company_id?: true
    branch_id?: true
    user_type?: true
    status?: true
    failed_login_attempts?: true
    last_failed_login?: true
    account_locked_until?: true
    last_login_at?: true
    created_at?: true
    updated_at?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    username?: true
    password?: true
    company_id?: true
    branch_id?: true
    user_type?: true
    status?: true
    failed_login_attempts?: true
    last_failed_login?: true
    account_locked_until?: true
    last_login_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    username: string
    password: string
    company_id: number
    branch_id: number | null
    user_type: $Enums.UserType
    status: $Enums.UserStatus
    failed_login_attempts: number
    last_failed_login: Date | null
    account_locked_until: Date | null
    last_login_at: Date | null
    created_at: Date
    updated_at: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    company_id?: boolean
    branch_id?: boolean
    user_type?: boolean
    status?: boolean
    failed_login_attempts?: boolean
    last_failed_login?: boolean
    account_locked_until?: boolean
    last_login_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | User$branchArgs<ExtArgs>
    bills?: boolean | User$billsArgs<ExtArgs>
    info?: boolean | User$infoArgs<ExtArgs>
    userRoles?: boolean | User$userRolesArgs<ExtArgs>
    logs?: boolean | User$logsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    company_id?: boolean
    branch_id?: boolean
    user_type?: boolean
    status?: boolean
    failed_login_attempts?: boolean
    last_failed_login?: boolean
    account_locked_until?: boolean
    last_login_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | User$branchArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password?: boolean
    company_id?: boolean
    branch_id?: boolean
    user_type?: boolean
    status?: boolean
    failed_login_attempts?: boolean
    last_failed_login?: boolean
    account_locked_until?: boolean
    last_login_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | User$branchArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    username?: boolean
    password?: boolean
    company_id?: boolean
    branch_id?: boolean
    user_type?: boolean
    status?: boolean
    failed_login_attempts?: boolean
    last_failed_login?: boolean
    account_locked_until?: boolean
    last_login_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "password" | "company_id" | "branch_id" | "user_type" | "status" | "failed_login_attempts" | "last_failed_login" | "account_locked_until" | "last_login_at" | "created_at" | "updated_at", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | User$branchArgs<ExtArgs>
    bills?: boolean | User$billsArgs<ExtArgs>
    info?: boolean | User$infoArgs<ExtArgs>
    userRoles?: boolean | User$userRolesArgs<ExtArgs>
    logs?: boolean | User$logsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | User$branchArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | User$branchArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      company: Prisma.$CompanyPayload<ExtArgs>
      branch: Prisma.$BranchPayload<ExtArgs> | null
      bills: Prisma.$BillPayload<ExtArgs>[]
      info: Prisma.$UserInfoPayload<ExtArgs> | null
      userRoles: Prisma.$UserRolePayload<ExtArgs>[]
      logs: Prisma.$UserLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      username: string
      password: string
      company_id: number
      branch_id: number | null
      user_type: $Enums.UserType
      status: $Enums.UserStatus
      failed_login_attempts: number
      last_failed_login: Date | null
      account_locked_until: Date | null
      last_login_at: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    branch<T extends User$branchArgs<ExtArgs> = {}>(args?: Subset<T, User$branchArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    bills<T extends User$billsArgs<ExtArgs> = {}>(args?: Subset<T, User$billsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    info<T extends User$infoArgs<ExtArgs> = {}>(args?: Subset<T, User$infoArgs<ExtArgs>>): Prisma__UserInfoClient<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    userRoles<T extends User$userRolesArgs<ExtArgs> = {}>(args?: Subset<T, User$userRolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    logs<T extends User$logsArgs<ExtArgs> = {}>(args?: Subset<T, User$logsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly username: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly company_id: FieldRef<"User", 'Int'>
    readonly branch_id: FieldRef<"User", 'Int'>
    readonly user_type: FieldRef<"User", 'UserType'>
    readonly status: FieldRef<"User", 'UserStatus'>
    readonly failed_login_attempts: FieldRef<"User", 'Int'>
    readonly last_failed_login: FieldRef<"User", 'DateTime'>
    readonly account_locked_until: FieldRef<"User", 'DateTime'>
    readonly last_login_at: FieldRef<"User", 'DateTime'>
    readonly created_at: FieldRef<"User", 'DateTime'>
    readonly updated_at: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.branch
   */
  export type User$branchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    where?: BranchWhereInput
  }

  /**
   * User.bills
   */
  export type User$billsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    where?: BillWhereInput
    orderBy?: BillOrderByWithRelationInput | BillOrderByWithRelationInput[]
    cursor?: BillWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BillScalarFieldEnum | BillScalarFieldEnum[]
  }

  /**
   * User.info
   */
  export type User$infoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    where?: UserInfoWhereInput
  }

  /**
   * User.userRoles
   */
  export type User$userRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    where?: UserRoleWhereInput
    orderBy?: UserRoleOrderByWithRelationInput | UserRoleOrderByWithRelationInput[]
    cursor?: UserRoleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserRoleScalarFieldEnum | UserRoleScalarFieldEnum[]
  }

  /**
   * User.logs
   */
  export type User$logsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    where?: UserLogWhereInput
    orderBy?: UserLogOrderByWithRelationInput | UserLogOrderByWithRelationInput[]
    cursor?: UserLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserLogScalarFieldEnum | UserLogScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model UserInfo
   */

  export type AggregateUserInfo = {
    _count: UserInfoCountAggregateOutputType | null
    _avg: UserInfoAvgAggregateOutputType | null
    _sum: UserInfoSumAggregateOutputType | null
    _min: UserInfoMinAggregateOutputType | null
    _max: UserInfoMaxAggregateOutputType | null
  }

  export type UserInfoAvgAggregateOutputType = {
    id: number | null
    user_id: number | null
  }

  export type UserInfoSumAggregateOutputType = {
    id: number | null
    user_id: number | null
  }

  export type UserInfoMinAggregateOutputType = {
    id: number | null
    user_id: number | null
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
    address: string | null
    profile_picture: string | null
  }

  export type UserInfoMaxAggregateOutputType = {
    id: number | null
    user_id: number | null
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
    address: string | null
    profile_picture: string | null
  }

  export type UserInfoCountAggregateOutputType = {
    id: number
    user_id: number
    first_name: number
    last_name: number
    email: number
    phone_number: number
    address: number
    profile_picture: number
    _all: number
  }


  export type UserInfoAvgAggregateInputType = {
    id?: true
    user_id?: true
  }

  export type UserInfoSumAggregateInputType = {
    id?: true
    user_id?: true
  }

  export type UserInfoMinAggregateInputType = {
    id?: true
    user_id?: true
    first_name?: true
    last_name?: true
    email?: true
    phone_number?: true
    address?: true
    profile_picture?: true
  }

  export type UserInfoMaxAggregateInputType = {
    id?: true
    user_id?: true
    first_name?: true
    last_name?: true
    email?: true
    phone_number?: true
    address?: true
    profile_picture?: true
  }

  export type UserInfoCountAggregateInputType = {
    id?: true
    user_id?: true
    first_name?: true
    last_name?: true
    email?: true
    phone_number?: true
    address?: true
    profile_picture?: true
    _all?: true
  }

  export type UserInfoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserInfo to aggregate.
     */
    where?: UserInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserInfos to fetch.
     */
    orderBy?: UserInfoOrderByWithRelationInput | UserInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserInfos
    **/
    _count?: true | UserInfoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserInfoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserInfoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserInfoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserInfoMaxAggregateInputType
  }

  export type GetUserInfoAggregateType<T extends UserInfoAggregateArgs> = {
        [P in keyof T & keyof AggregateUserInfo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserInfo[P]>
      : GetScalarType<T[P], AggregateUserInfo[P]>
  }




  export type UserInfoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserInfoWhereInput
    orderBy?: UserInfoOrderByWithAggregationInput | UserInfoOrderByWithAggregationInput[]
    by: UserInfoScalarFieldEnum[] | UserInfoScalarFieldEnum
    having?: UserInfoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserInfoCountAggregateInputType | true
    _avg?: UserInfoAvgAggregateInputType
    _sum?: UserInfoSumAggregateInputType
    _min?: UserInfoMinAggregateInputType
    _max?: UserInfoMaxAggregateInputType
  }

  export type UserInfoGroupByOutputType = {
    id: number
    user_id: number
    first_name: string
    last_name: string
    email: string | null
    phone_number: string | null
    address: string | null
    profile_picture: string | null
    _count: UserInfoCountAggregateOutputType | null
    _avg: UserInfoAvgAggregateOutputType | null
    _sum: UserInfoSumAggregateOutputType | null
    _min: UserInfoMinAggregateOutputType | null
    _max: UserInfoMaxAggregateOutputType | null
  }

  type GetUserInfoGroupByPayload<T extends UserInfoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserInfoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserInfoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserInfoGroupByOutputType[P]>
            : GetScalarType<T[P], UserInfoGroupByOutputType[P]>
        }
      >
    >


  export type UserInfoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    first_name?: boolean
    last_name?: boolean
    email?: boolean
    phone_number?: boolean
    address?: boolean
    profile_picture?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userInfo"]>

  export type UserInfoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    first_name?: boolean
    last_name?: boolean
    email?: boolean
    phone_number?: boolean
    address?: boolean
    profile_picture?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userInfo"]>

  export type UserInfoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    first_name?: boolean
    last_name?: boolean
    email?: boolean
    phone_number?: boolean
    address?: boolean
    profile_picture?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userInfo"]>

  export type UserInfoSelectScalar = {
    id?: boolean
    user_id?: boolean
    first_name?: boolean
    last_name?: boolean
    email?: boolean
    phone_number?: boolean
    address?: boolean
    profile_picture?: boolean
  }

  export type UserInfoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "user_id" | "first_name" | "last_name" | "email" | "phone_number" | "address" | "profile_picture", ExtArgs["result"]["userInfo"]>
  export type UserInfoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserInfoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserInfoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserInfoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserInfo"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      user_id: number
      first_name: string
      last_name: string
      email: string | null
      phone_number: string | null
      address: string | null
      profile_picture: string | null
    }, ExtArgs["result"]["userInfo"]>
    composites: {}
  }

  type UserInfoGetPayload<S extends boolean | null | undefined | UserInfoDefaultArgs> = $Result.GetResult<Prisma.$UserInfoPayload, S>

  type UserInfoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserInfoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserInfoCountAggregateInputType | true
    }

  export interface UserInfoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserInfo'], meta: { name: 'UserInfo' } }
    /**
     * Find zero or one UserInfo that matches the filter.
     * @param {UserInfoFindUniqueArgs} args - Arguments to find a UserInfo
     * @example
     * // Get one UserInfo
     * const userInfo = await prisma.userInfo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserInfoFindUniqueArgs>(args: SelectSubset<T, UserInfoFindUniqueArgs<ExtArgs>>): Prisma__UserInfoClient<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserInfo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserInfoFindUniqueOrThrowArgs} args - Arguments to find a UserInfo
     * @example
     * // Get one UserInfo
     * const userInfo = await prisma.userInfo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserInfoFindUniqueOrThrowArgs>(args: SelectSubset<T, UserInfoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserInfoClient<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserInfo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoFindFirstArgs} args - Arguments to find a UserInfo
     * @example
     * // Get one UserInfo
     * const userInfo = await prisma.userInfo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserInfoFindFirstArgs>(args?: SelectSubset<T, UserInfoFindFirstArgs<ExtArgs>>): Prisma__UserInfoClient<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserInfo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoFindFirstOrThrowArgs} args - Arguments to find a UserInfo
     * @example
     * // Get one UserInfo
     * const userInfo = await prisma.userInfo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserInfoFindFirstOrThrowArgs>(args?: SelectSubset<T, UserInfoFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserInfoClient<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserInfos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserInfos
     * const userInfos = await prisma.userInfo.findMany()
     * 
     * // Get first 10 UserInfos
     * const userInfos = await prisma.userInfo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userInfoWithIdOnly = await prisma.userInfo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserInfoFindManyArgs>(args?: SelectSubset<T, UserInfoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserInfo.
     * @param {UserInfoCreateArgs} args - Arguments to create a UserInfo.
     * @example
     * // Create one UserInfo
     * const UserInfo = await prisma.userInfo.create({
     *   data: {
     *     // ... data to create a UserInfo
     *   }
     * })
     * 
     */
    create<T extends UserInfoCreateArgs>(args: SelectSubset<T, UserInfoCreateArgs<ExtArgs>>): Prisma__UserInfoClient<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserInfos.
     * @param {UserInfoCreateManyArgs} args - Arguments to create many UserInfos.
     * @example
     * // Create many UserInfos
     * const userInfo = await prisma.userInfo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserInfoCreateManyArgs>(args?: SelectSubset<T, UserInfoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserInfos and returns the data saved in the database.
     * @param {UserInfoCreateManyAndReturnArgs} args - Arguments to create many UserInfos.
     * @example
     * // Create many UserInfos
     * const userInfo = await prisma.userInfo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserInfos and only return the `id`
     * const userInfoWithIdOnly = await prisma.userInfo.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserInfoCreateManyAndReturnArgs>(args?: SelectSubset<T, UserInfoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserInfo.
     * @param {UserInfoDeleteArgs} args - Arguments to delete one UserInfo.
     * @example
     * // Delete one UserInfo
     * const UserInfo = await prisma.userInfo.delete({
     *   where: {
     *     // ... filter to delete one UserInfo
     *   }
     * })
     * 
     */
    delete<T extends UserInfoDeleteArgs>(args: SelectSubset<T, UserInfoDeleteArgs<ExtArgs>>): Prisma__UserInfoClient<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserInfo.
     * @param {UserInfoUpdateArgs} args - Arguments to update one UserInfo.
     * @example
     * // Update one UserInfo
     * const userInfo = await prisma.userInfo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserInfoUpdateArgs>(args: SelectSubset<T, UserInfoUpdateArgs<ExtArgs>>): Prisma__UserInfoClient<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserInfos.
     * @param {UserInfoDeleteManyArgs} args - Arguments to filter UserInfos to delete.
     * @example
     * // Delete a few UserInfos
     * const { count } = await prisma.userInfo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserInfoDeleteManyArgs>(args?: SelectSubset<T, UserInfoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserInfos
     * const userInfo = await prisma.userInfo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserInfoUpdateManyArgs>(args: SelectSubset<T, UserInfoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserInfos and returns the data updated in the database.
     * @param {UserInfoUpdateManyAndReturnArgs} args - Arguments to update many UserInfos.
     * @example
     * // Update many UserInfos
     * const userInfo = await prisma.userInfo.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserInfos and only return the `id`
     * const userInfoWithIdOnly = await prisma.userInfo.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserInfoUpdateManyAndReturnArgs>(args: SelectSubset<T, UserInfoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserInfo.
     * @param {UserInfoUpsertArgs} args - Arguments to update or create a UserInfo.
     * @example
     * // Update or create a UserInfo
     * const userInfo = await prisma.userInfo.upsert({
     *   create: {
     *     // ... data to create a UserInfo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserInfo we want to update
     *   }
     * })
     */
    upsert<T extends UserInfoUpsertArgs>(args: SelectSubset<T, UserInfoUpsertArgs<ExtArgs>>): Prisma__UserInfoClient<$Result.GetResult<Prisma.$UserInfoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoCountArgs} args - Arguments to filter UserInfos to count.
     * @example
     * // Count the number of UserInfos
     * const count = await prisma.userInfo.count({
     *   where: {
     *     // ... the filter for the UserInfos we want to count
     *   }
     * })
    **/
    count<T extends UserInfoCountArgs>(
      args?: Subset<T, UserInfoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserInfoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserInfoAggregateArgs>(args: Subset<T, UserInfoAggregateArgs>): Prisma.PrismaPromise<GetUserInfoAggregateType<T>>

    /**
     * Group by UserInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInfoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserInfoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserInfoGroupByArgs['orderBy'] }
        : { orderBy?: UserInfoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserInfoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserInfoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserInfo model
   */
  readonly fields: UserInfoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserInfo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserInfoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserInfo model
   */
  interface UserInfoFieldRefs {
    readonly id: FieldRef<"UserInfo", 'Int'>
    readonly user_id: FieldRef<"UserInfo", 'Int'>
    readonly first_name: FieldRef<"UserInfo", 'String'>
    readonly last_name: FieldRef<"UserInfo", 'String'>
    readonly email: FieldRef<"UserInfo", 'String'>
    readonly phone_number: FieldRef<"UserInfo", 'String'>
    readonly address: FieldRef<"UserInfo", 'String'>
    readonly profile_picture: FieldRef<"UserInfo", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserInfo findUnique
   */
  export type UserInfoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    /**
     * Filter, which UserInfo to fetch.
     */
    where: UserInfoWhereUniqueInput
  }

  /**
   * UserInfo findUniqueOrThrow
   */
  export type UserInfoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    /**
     * Filter, which UserInfo to fetch.
     */
    where: UserInfoWhereUniqueInput
  }

  /**
   * UserInfo findFirst
   */
  export type UserInfoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    /**
     * Filter, which UserInfo to fetch.
     */
    where?: UserInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserInfos to fetch.
     */
    orderBy?: UserInfoOrderByWithRelationInput | UserInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserInfos.
     */
    cursor?: UserInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserInfos.
     */
    distinct?: UserInfoScalarFieldEnum | UserInfoScalarFieldEnum[]
  }

  /**
   * UserInfo findFirstOrThrow
   */
  export type UserInfoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    /**
     * Filter, which UserInfo to fetch.
     */
    where?: UserInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserInfos to fetch.
     */
    orderBy?: UserInfoOrderByWithRelationInput | UserInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserInfos.
     */
    cursor?: UserInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserInfos.
     */
    distinct?: UserInfoScalarFieldEnum | UserInfoScalarFieldEnum[]
  }

  /**
   * UserInfo findMany
   */
  export type UserInfoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    /**
     * Filter, which UserInfos to fetch.
     */
    where?: UserInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserInfos to fetch.
     */
    orderBy?: UserInfoOrderByWithRelationInput | UserInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserInfos.
     */
    cursor?: UserInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserInfos.
     */
    skip?: number
    distinct?: UserInfoScalarFieldEnum | UserInfoScalarFieldEnum[]
  }

  /**
   * UserInfo create
   */
  export type UserInfoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    /**
     * The data needed to create a UserInfo.
     */
    data: XOR<UserInfoCreateInput, UserInfoUncheckedCreateInput>
  }

  /**
   * UserInfo createMany
   */
  export type UserInfoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserInfos.
     */
    data: UserInfoCreateManyInput | UserInfoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserInfo createManyAndReturn
   */
  export type UserInfoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * The data used to create many UserInfos.
     */
    data: UserInfoCreateManyInput | UserInfoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserInfo update
   */
  export type UserInfoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    /**
     * The data needed to update a UserInfo.
     */
    data: XOR<UserInfoUpdateInput, UserInfoUncheckedUpdateInput>
    /**
     * Choose, which UserInfo to update.
     */
    where: UserInfoWhereUniqueInput
  }

  /**
   * UserInfo updateMany
   */
  export type UserInfoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserInfos.
     */
    data: XOR<UserInfoUpdateManyMutationInput, UserInfoUncheckedUpdateManyInput>
    /**
     * Filter which UserInfos to update
     */
    where?: UserInfoWhereInput
    /**
     * Limit how many UserInfos to update.
     */
    limit?: number
  }

  /**
   * UserInfo updateManyAndReturn
   */
  export type UserInfoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * The data used to update UserInfos.
     */
    data: XOR<UserInfoUpdateManyMutationInput, UserInfoUncheckedUpdateManyInput>
    /**
     * Filter which UserInfos to update
     */
    where?: UserInfoWhereInput
    /**
     * Limit how many UserInfos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserInfo upsert
   */
  export type UserInfoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    /**
     * The filter to search for the UserInfo to update in case it exists.
     */
    where: UserInfoWhereUniqueInput
    /**
     * In case the UserInfo found by the `where` argument doesn't exist, create a new UserInfo with this data.
     */
    create: XOR<UserInfoCreateInput, UserInfoUncheckedCreateInput>
    /**
     * In case the UserInfo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserInfoUpdateInput, UserInfoUncheckedUpdateInput>
  }

  /**
   * UserInfo delete
   */
  export type UserInfoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
    /**
     * Filter which UserInfo to delete.
     */
    where: UserInfoWhereUniqueInput
  }

  /**
   * UserInfo deleteMany
   */
  export type UserInfoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserInfos to delete
     */
    where?: UserInfoWhereInput
    /**
     * Limit how many UserInfos to delete.
     */
    limit?: number
  }

  /**
   * UserInfo without action
   */
  export type UserInfoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInfo
     */
    select?: UserInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInfo
     */
    omit?: UserInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInfoInclude<ExtArgs> | null
  }


  /**
   * Model Role
   */

  export type AggregateRole = {
    _count: RoleCountAggregateOutputType | null
    _avg: RoleAvgAggregateOutputType | null
    _sum: RoleSumAggregateOutputType | null
    _min: RoleMinAggregateOutputType | null
    _max: RoleMaxAggregateOutputType | null
  }

  export type RoleAvgAggregateOutputType = {
    id: number | null
  }

  export type RoleSumAggregateOutputType = {
    id: number | null
  }

  export type RoleMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
  }

  export type RoleMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
  }

  export type RoleCountAggregateOutputType = {
    id: number
    name: number
    description: number
    _all: number
  }


  export type RoleAvgAggregateInputType = {
    id?: true
  }

  export type RoleSumAggregateInputType = {
    id?: true
  }

  export type RoleMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
  }

  export type RoleMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
  }

  export type RoleCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    _all?: true
  }

  export type RoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Role to aggregate.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Roles
    **/
    _count?: true | RoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RoleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RoleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoleMaxAggregateInputType
  }

  export type GetRoleAggregateType<T extends RoleAggregateArgs> = {
        [P in keyof T & keyof AggregateRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRole[P]>
      : GetScalarType<T[P], AggregateRole[P]>
  }




  export type RoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleWhereInput
    orderBy?: RoleOrderByWithAggregationInput | RoleOrderByWithAggregationInput[]
    by: RoleScalarFieldEnum[] | RoleScalarFieldEnum
    having?: RoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoleCountAggregateInputType | true
    _avg?: RoleAvgAggregateInputType
    _sum?: RoleSumAggregateInputType
    _min?: RoleMinAggregateInputType
    _max?: RoleMaxAggregateInputType
  }

  export type RoleGroupByOutputType = {
    id: number
    name: string
    description: string | null
    _count: RoleCountAggregateOutputType | null
    _avg: RoleAvgAggregateOutputType | null
    _sum: RoleSumAggregateOutputType | null
    _min: RoleMinAggregateOutputType | null
    _max: RoleMaxAggregateOutputType | null
  }

  type GetRoleGroupByPayload<T extends RoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoleGroupByOutputType[P]>
            : GetScalarType<T[P], RoleGroupByOutputType[P]>
        }
      >
    >


  export type RoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    userRoles?: boolean | Role$userRolesArgs<ExtArgs>
    authorities?: boolean | Role$authoritiesArgs<ExtArgs>
    _count?: boolean | RoleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["role"]>

  export type RoleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
  }, ExtArgs["result"]["role"]>

  export type RoleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
  }, ExtArgs["result"]["role"]>

  export type RoleSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
  }

  export type RoleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description", ExtArgs["result"]["role"]>
  export type RoleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userRoles?: boolean | Role$userRolesArgs<ExtArgs>
    authorities?: boolean | Role$authoritiesArgs<ExtArgs>
    _count?: boolean | RoleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RoleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RoleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Role"
    objects: {
      userRoles: Prisma.$UserRolePayload<ExtArgs>[]
      authorities: Prisma.$RoleAuthorityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string | null
    }, ExtArgs["result"]["role"]>
    composites: {}
  }

  type RoleGetPayload<S extends boolean | null | undefined | RoleDefaultArgs> = $Result.GetResult<Prisma.$RolePayload, S>

  type RoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoleCountAggregateInputType | true
    }

  export interface RoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Role'], meta: { name: 'Role' } }
    /**
     * Find zero or one Role that matches the filter.
     * @param {RoleFindUniqueArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoleFindUniqueArgs>(args: SelectSubset<T, RoleFindUniqueArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Role that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoleFindUniqueOrThrowArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoleFindUniqueOrThrowArgs>(args: SelectSubset<T, RoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Role that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindFirstArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoleFindFirstArgs>(args?: SelectSubset<T, RoleFindFirstArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Role that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindFirstOrThrowArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoleFindFirstOrThrowArgs>(args?: SelectSubset<T, RoleFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Roles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Roles
     * const roles = await prisma.role.findMany()
     * 
     * // Get first 10 Roles
     * const roles = await prisma.role.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roleWithIdOnly = await prisma.role.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RoleFindManyArgs>(args?: SelectSubset<T, RoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Role.
     * @param {RoleCreateArgs} args - Arguments to create a Role.
     * @example
     * // Create one Role
     * const Role = await prisma.role.create({
     *   data: {
     *     // ... data to create a Role
     *   }
     * })
     * 
     */
    create<T extends RoleCreateArgs>(args: SelectSubset<T, RoleCreateArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Roles.
     * @param {RoleCreateManyArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const role = await prisma.role.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoleCreateManyArgs>(args?: SelectSubset<T, RoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Roles and returns the data saved in the database.
     * @param {RoleCreateManyAndReturnArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const role = await prisma.role.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Roles and only return the `id`
     * const roleWithIdOnly = await prisma.role.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RoleCreateManyAndReturnArgs>(args?: SelectSubset<T, RoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Role.
     * @param {RoleDeleteArgs} args - Arguments to delete one Role.
     * @example
     * // Delete one Role
     * const Role = await prisma.role.delete({
     *   where: {
     *     // ... filter to delete one Role
     *   }
     * })
     * 
     */
    delete<T extends RoleDeleteArgs>(args: SelectSubset<T, RoleDeleteArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Role.
     * @param {RoleUpdateArgs} args - Arguments to update one Role.
     * @example
     * // Update one Role
     * const role = await prisma.role.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoleUpdateArgs>(args: SelectSubset<T, RoleUpdateArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Roles.
     * @param {RoleDeleteManyArgs} args - Arguments to filter Roles to delete.
     * @example
     * // Delete a few Roles
     * const { count } = await prisma.role.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoleDeleteManyArgs>(args?: SelectSubset<T, RoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Roles
     * const role = await prisma.role.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoleUpdateManyArgs>(args: SelectSubset<T, RoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles and returns the data updated in the database.
     * @param {RoleUpdateManyAndReturnArgs} args - Arguments to update many Roles.
     * @example
     * // Update many Roles
     * const role = await prisma.role.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Roles and only return the `id`
     * const roleWithIdOnly = await prisma.role.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RoleUpdateManyAndReturnArgs>(args: SelectSubset<T, RoleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Role.
     * @param {RoleUpsertArgs} args - Arguments to update or create a Role.
     * @example
     * // Update or create a Role
     * const role = await prisma.role.upsert({
     *   create: {
     *     // ... data to create a Role
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Role we want to update
     *   }
     * })
     */
    upsert<T extends RoleUpsertArgs>(args: SelectSubset<T, RoleUpsertArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleCountArgs} args - Arguments to filter Roles to count.
     * @example
     * // Count the number of Roles
     * const count = await prisma.role.count({
     *   where: {
     *     // ... the filter for the Roles we want to count
     *   }
     * })
    **/
    count<T extends RoleCountArgs>(
      args?: Subset<T, RoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Role.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoleAggregateArgs>(args: Subset<T, RoleAggregateArgs>): Prisma.PrismaPromise<GetRoleAggregateType<T>>

    /**
     * Group by Role.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoleGroupByArgs['orderBy'] }
        : { orderBy?: RoleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Role model
   */
  readonly fields: RoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Role.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    userRoles<T extends Role$userRolesArgs<ExtArgs> = {}>(args?: Subset<T, Role$userRolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    authorities<T extends Role$authoritiesArgs<ExtArgs> = {}>(args?: Subset<T, Role$authoritiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Role model
   */
  interface RoleFieldRefs {
    readonly id: FieldRef<"Role", 'Int'>
    readonly name: FieldRef<"Role", 'String'>
    readonly description: FieldRef<"Role", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Role findUnique
   */
  export type RoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role findUniqueOrThrow
   */
  export type RoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role findFirst
   */
  export type RoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role findFirstOrThrow
   */
  export type RoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role findMany
   */
  export type RoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Roles to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role create
   */
  export type RoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * The data needed to create a Role.
     */
    data: XOR<RoleCreateInput, RoleUncheckedCreateInput>
  }

  /**
   * Role createMany
   */
  export type RoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Roles.
     */
    data: RoleCreateManyInput | RoleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Role createManyAndReturn
   */
  export type RoleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * The data used to create many Roles.
     */
    data: RoleCreateManyInput | RoleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Role update
   */
  export type RoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * The data needed to update a Role.
     */
    data: XOR<RoleUpdateInput, RoleUncheckedUpdateInput>
    /**
     * Choose, which Role to update.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role updateMany
   */
  export type RoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Roles.
     */
    data: XOR<RoleUpdateManyMutationInput, RoleUncheckedUpdateManyInput>
    /**
     * Filter which Roles to update
     */
    where?: RoleWhereInput
    /**
     * Limit how many Roles to update.
     */
    limit?: number
  }

  /**
   * Role updateManyAndReturn
   */
  export type RoleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * The data used to update Roles.
     */
    data: XOR<RoleUpdateManyMutationInput, RoleUncheckedUpdateManyInput>
    /**
     * Filter which Roles to update
     */
    where?: RoleWhereInput
    /**
     * Limit how many Roles to update.
     */
    limit?: number
  }

  /**
   * Role upsert
   */
  export type RoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * The filter to search for the Role to update in case it exists.
     */
    where: RoleWhereUniqueInput
    /**
     * In case the Role found by the `where` argument doesn't exist, create a new Role with this data.
     */
    create: XOR<RoleCreateInput, RoleUncheckedCreateInput>
    /**
     * In case the Role was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoleUpdateInput, RoleUncheckedUpdateInput>
  }

  /**
   * Role delete
   */
  export type RoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter which Role to delete.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role deleteMany
   */
  export type RoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Roles to delete
     */
    where?: RoleWhereInput
    /**
     * Limit how many Roles to delete.
     */
    limit?: number
  }

  /**
   * Role.userRoles
   */
  export type Role$userRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    where?: UserRoleWhereInput
    orderBy?: UserRoleOrderByWithRelationInput | UserRoleOrderByWithRelationInput[]
    cursor?: UserRoleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserRoleScalarFieldEnum | UserRoleScalarFieldEnum[]
  }

  /**
   * Role.authorities
   */
  export type Role$authoritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    where?: RoleAuthorityWhereInput
    orderBy?: RoleAuthorityOrderByWithRelationInput | RoleAuthorityOrderByWithRelationInput[]
    cursor?: RoleAuthorityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoleAuthorityScalarFieldEnum | RoleAuthorityScalarFieldEnum[]
  }

  /**
   * Role without action
   */
  export type RoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
  }


  /**
   * Model Authority
   */

  export type AggregateAuthority = {
    _count: AuthorityCountAggregateOutputType | null
    _avg: AuthorityAvgAggregateOutputType | null
    _sum: AuthoritySumAggregateOutputType | null
    _min: AuthorityMinAggregateOutputType | null
    _max: AuthorityMaxAggregateOutputType | null
  }

  export type AuthorityAvgAggregateOutputType = {
    id: number | null
  }

  export type AuthoritySumAggregateOutputType = {
    id: number | null
  }

  export type AuthorityMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
  }

  export type AuthorityMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
  }

  export type AuthorityCountAggregateOutputType = {
    id: number
    name: number
    description: number
    _all: number
  }


  export type AuthorityAvgAggregateInputType = {
    id?: true
  }

  export type AuthoritySumAggregateInputType = {
    id?: true
  }

  export type AuthorityMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
  }

  export type AuthorityMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
  }

  export type AuthorityCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    _all?: true
  }

  export type AuthorityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Authority to aggregate.
     */
    where?: AuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Authorities to fetch.
     */
    orderBy?: AuthorityOrderByWithRelationInput | AuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Authorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Authorities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Authorities
    **/
    _count?: true | AuthorityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AuthorityAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AuthoritySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthorityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthorityMaxAggregateInputType
  }

  export type GetAuthorityAggregateType<T extends AuthorityAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthority]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthority[P]>
      : GetScalarType<T[P], AggregateAuthority[P]>
  }




  export type AuthorityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthorityWhereInput
    orderBy?: AuthorityOrderByWithAggregationInput | AuthorityOrderByWithAggregationInput[]
    by: AuthorityScalarFieldEnum[] | AuthorityScalarFieldEnum
    having?: AuthorityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthorityCountAggregateInputType | true
    _avg?: AuthorityAvgAggregateInputType
    _sum?: AuthoritySumAggregateInputType
    _min?: AuthorityMinAggregateInputType
    _max?: AuthorityMaxAggregateInputType
  }

  export type AuthorityGroupByOutputType = {
    id: number
    name: string
    description: string | null
    _count: AuthorityCountAggregateOutputType | null
    _avg: AuthorityAvgAggregateOutputType | null
    _sum: AuthoritySumAggregateOutputType | null
    _min: AuthorityMinAggregateOutputType | null
    _max: AuthorityMaxAggregateOutputType | null
  }

  type GetAuthorityGroupByPayload<T extends AuthorityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthorityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthorityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthorityGroupByOutputType[P]>
            : GetScalarType<T[P], AuthorityGroupByOutputType[P]>
        }
      >
    >


  export type AuthoritySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    roles?: boolean | Authority$rolesArgs<ExtArgs>
    _count?: boolean | AuthorityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authority"]>

  export type AuthoritySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
  }, ExtArgs["result"]["authority"]>

  export type AuthoritySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
  }, ExtArgs["result"]["authority"]>

  export type AuthoritySelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
  }

  export type AuthorityOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description", ExtArgs["result"]["authority"]>
  export type AuthorityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    roles?: boolean | Authority$rolesArgs<ExtArgs>
    _count?: boolean | AuthorityCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AuthorityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AuthorityIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AuthorityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Authority"
    objects: {
      roles: Prisma.$RoleAuthorityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string | null
    }, ExtArgs["result"]["authority"]>
    composites: {}
  }

  type AuthorityGetPayload<S extends boolean | null | undefined | AuthorityDefaultArgs> = $Result.GetResult<Prisma.$AuthorityPayload, S>

  type AuthorityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuthorityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuthorityCountAggregateInputType | true
    }

  export interface AuthorityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Authority'], meta: { name: 'Authority' } }
    /**
     * Find zero or one Authority that matches the filter.
     * @param {AuthorityFindUniqueArgs} args - Arguments to find a Authority
     * @example
     * // Get one Authority
     * const authority = await prisma.authority.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthorityFindUniqueArgs>(args: SelectSubset<T, AuthorityFindUniqueArgs<ExtArgs>>): Prisma__AuthorityClient<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Authority that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuthorityFindUniqueOrThrowArgs} args - Arguments to find a Authority
     * @example
     * // Get one Authority
     * const authority = await prisma.authority.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthorityFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthorityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthorityClient<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Authority that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorityFindFirstArgs} args - Arguments to find a Authority
     * @example
     * // Get one Authority
     * const authority = await prisma.authority.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthorityFindFirstArgs>(args?: SelectSubset<T, AuthorityFindFirstArgs<ExtArgs>>): Prisma__AuthorityClient<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Authority that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorityFindFirstOrThrowArgs} args - Arguments to find a Authority
     * @example
     * // Get one Authority
     * const authority = await prisma.authority.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthorityFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthorityFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthorityClient<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Authorities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Authorities
     * const authorities = await prisma.authority.findMany()
     * 
     * // Get first 10 Authorities
     * const authorities = await prisma.authority.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authorityWithIdOnly = await prisma.authority.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthorityFindManyArgs>(args?: SelectSubset<T, AuthorityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Authority.
     * @param {AuthorityCreateArgs} args - Arguments to create a Authority.
     * @example
     * // Create one Authority
     * const Authority = await prisma.authority.create({
     *   data: {
     *     // ... data to create a Authority
     *   }
     * })
     * 
     */
    create<T extends AuthorityCreateArgs>(args: SelectSubset<T, AuthorityCreateArgs<ExtArgs>>): Prisma__AuthorityClient<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Authorities.
     * @param {AuthorityCreateManyArgs} args - Arguments to create many Authorities.
     * @example
     * // Create many Authorities
     * const authority = await prisma.authority.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthorityCreateManyArgs>(args?: SelectSubset<T, AuthorityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Authorities and returns the data saved in the database.
     * @param {AuthorityCreateManyAndReturnArgs} args - Arguments to create many Authorities.
     * @example
     * // Create many Authorities
     * const authority = await prisma.authority.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Authorities and only return the `id`
     * const authorityWithIdOnly = await prisma.authority.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthorityCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthorityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Authority.
     * @param {AuthorityDeleteArgs} args - Arguments to delete one Authority.
     * @example
     * // Delete one Authority
     * const Authority = await prisma.authority.delete({
     *   where: {
     *     // ... filter to delete one Authority
     *   }
     * })
     * 
     */
    delete<T extends AuthorityDeleteArgs>(args: SelectSubset<T, AuthorityDeleteArgs<ExtArgs>>): Prisma__AuthorityClient<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Authority.
     * @param {AuthorityUpdateArgs} args - Arguments to update one Authority.
     * @example
     * // Update one Authority
     * const authority = await prisma.authority.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthorityUpdateArgs>(args: SelectSubset<T, AuthorityUpdateArgs<ExtArgs>>): Prisma__AuthorityClient<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Authorities.
     * @param {AuthorityDeleteManyArgs} args - Arguments to filter Authorities to delete.
     * @example
     * // Delete a few Authorities
     * const { count } = await prisma.authority.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthorityDeleteManyArgs>(args?: SelectSubset<T, AuthorityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Authorities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Authorities
     * const authority = await prisma.authority.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthorityUpdateManyArgs>(args: SelectSubset<T, AuthorityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Authorities and returns the data updated in the database.
     * @param {AuthorityUpdateManyAndReturnArgs} args - Arguments to update many Authorities.
     * @example
     * // Update many Authorities
     * const authority = await prisma.authority.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Authorities and only return the `id`
     * const authorityWithIdOnly = await prisma.authority.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuthorityUpdateManyAndReturnArgs>(args: SelectSubset<T, AuthorityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Authority.
     * @param {AuthorityUpsertArgs} args - Arguments to update or create a Authority.
     * @example
     * // Update or create a Authority
     * const authority = await prisma.authority.upsert({
     *   create: {
     *     // ... data to create a Authority
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Authority we want to update
     *   }
     * })
     */
    upsert<T extends AuthorityUpsertArgs>(args: SelectSubset<T, AuthorityUpsertArgs<ExtArgs>>): Prisma__AuthorityClient<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Authorities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorityCountArgs} args - Arguments to filter Authorities to count.
     * @example
     * // Count the number of Authorities
     * const count = await prisma.authority.count({
     *   where: {
     *     // ... the filter for the Authorities we want to count
     *   }
     * })
    **/
    count<T extends AuthorityCountArgs>(
      args?: Subset<T, AuthorityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthorityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Authority.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthorityAggregateArgs>(args: Subset<T, AuthorityAggregateArgs>): Prisma.PrismaPromise<GetAuthorityAggregateType<T>>

    /**
     * Group by Authority.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuthorityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuthorityGroupByArgs['orderBy'] }
        : { orderBy?: AuthorityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuthorityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthorityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Authority model
   */
  readonly fields: AuthorityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Authority.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthorityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    roles<T extends Authority$rolesArgs<ExtArgs> = {}>(args?: Subset<T, Authority$rolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Authority model
   */
  interface AuthorityFieldRefs {
    readonly id: FieldRef<"Authority", 'Int'>
    readonly name: FieldRef<"Authority", 'String'>
    readonly description: FieldRef<"Authority", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Authority findUnique
   */
  export type AuthorityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
    /**
     * Filter, which Authority to fetch.
     */
    where: AuthorityWhereUniqueInput
  }

  /**
   * Authority findUniqueOrThrow
   */
  export type AuthorityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
    /**
     * Filter, which Authority to fetch.
     */
    where: AuthorityWhereUniqueInput
  }

  /**
   * Authority findFirst
   */
  export type AuthorityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
    /**
     * Filter, which Authority to fetch.
     */
    where?: AuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Authorities to fetch.
     */
    orderBy?: AuthorityOrderByWithRelationInput | AuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Authorities.
     */
    cursor?: AuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Authorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Authorities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Authorities.
     */
    distinct?: AuthorityScalarFieldEnum | AuthorityScalarFieldEnum[]
  }

  /**
   * Authority findFirstOrThrow
   */
  export type AuthorityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
    /**
     * Filter, which Authority to fetch.
     */
    where?: AuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Authorities to fetch.
     */
    orderBy?: AuthorityOrderByWithRelationInput | AuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Authorities.
     */
    cursor?: AuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Authorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Authorities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Authorities.
     */
    distinct?: AuthorityScalarFieldEnum | AuthorityScalarFieldEnum[]
  }

  /**
   * Authority findMany
   */
  export type AuthorityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
    /**
     * Filter, which Authorities to fetch.
     */
    where?: AuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Authorities to fetch.
     */
    orderBy?: AuthorityOrderByWithRelationInput | AuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Authorities.
     */
    cursor?: AuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Authorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Authorities.
     */
    skip?: number
    distinct?: AuthorityScalarFieldEnum | AuthorityScalarFieldEnum[]
  }

  /**
   * Authority create
   */
  export type AuthorityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
    /**
     * The data needed to create a Authority.
     */
    data: XOR<AuthorityCreateInput, AuthorityUncheckedCreateInput>
  }

  /**
   * Authority createMany
   */
  export type AuthorityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Authorities.
     */
    data: AuthorityCreateManyInput | AuthorityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Authority createManyAndReturn
   */
  export type AuthorityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * The data used to create many Authorities.
     */
    data: AuthorityCreateManyInput | AuthorityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Authority update
   */
  export type AuthorityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
    /**
     * The data needed to update a Authority.
     */
    data: XOR<AuthorityUpdateInput, AuthorityUncheckedUpdateInput>
    /**
     * Choose, which Authority to update.
     */
    where: AuthorityWhereUniqueInput
  }

  /**
   * Authority updateMany
   */
  export type AuthorityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Authorities.
     */
    data: XOR<AuthorityUpdateManyMutationInput, AuthorityUncheckedUpdateManyInput>
    /**
     * Filter which Authorities to update
     */
    where?: AuthorityWhereInput
    /**
     * Limit how many Authorities to update.
     */
    limit?: number
  }

  /**
   * Authority updateManyAndReturn
   */
  export type AuthorityUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * The data used to update Authorities.
     */
    data: XOR<AuthorityUpdateManyMutationInput, AuthorityUncheckedUpdateManyInput>
    /**
     * Filter which Authorities to update
     */
    where?: AuthorityWhereInput
    /**
     * Limit how many Authorities to update.
     */
    limit?: number
  }

  /**
   * Authority upsert
   */
  export type AuthorityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
    /**
     * The filter to search for the Authority to update in case it exists.
     */
    where: AuthorityWhereUniqueInput
    /**
     * In case the Authority found by the `where` argument doesn't exist, create a new Authority with this data.
     */
    create: XOR<AuthorityCreateInput, AuthorityUncheckedCreateInput>
    /**
     * In case the Authority was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthorityUpdateInput, AuthorityUncheckedUpdateInput>
  }

  /**
   * Authority delete
   */
  export type AuthorityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
    /**
     * Filter which Authority to delete.
     */
    where: AuthorityWhereUniqueInput
  }

  /**
   * Authority deleteMany
   */
  export type AuthorityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Authorities to delete
     */
    where?: AuthorityWhereInput
    /**
     * Limit how many Authorities to delete.
     */
    limit?: number
  }

  /**
   * Authority.roles
   */
  export type Authority$rolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    where?: RoleAuthorityWhereInput
    orderBy?: RoleAuthorityOrderByWithRelationInput | RoleAuthorityOrderByWithRelationInput[]
    cursor?: RoleAuthorityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RoleAuthorityScalarFieldEnum | RoleAuthorityScalarFieldEnum[]
  }

  /**
   * Authority without action
   */
  export type AuthorityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Authority
     */
    select?: AuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Authority
     */
    omit?: AuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorityInclude<ExtArgs> | null
  }


  /**
   * Model UserRole
   */

  export type AggregateUserRole = {
    _count: UserRoleCountAggregateOutputType | null
    _avg: UserRoleAvgAggregateOutputType | null
    _sum: UserRoleSumAggregateOutputType | null
    _min: UserRoleMinAggregateOutputType | null
    _max: UserRoleMaxAggregateOutputType | null
  }

  export type UserRoleAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    roleId: number | null
  }

  export type UserRoleSumAggregateOutputType = {
    id: number | null
    userId: number | null
    roleId: number | null
  }

  export type UserRoleMinAggregateOutputType = {
    id: number | null
    userId: number | null
    roleId: number | null
  }

  export type UserRoleMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    roleId: number | null
  }

  export type UserRoleCountAggregateOutputType = {
    id: number
    userId: number
    roleId: number
    _all: number
  }


  export type UserRoleAvgAggregateInputType = {
    id?: true
    userId?: true
    roleId?: true
  }

  export type UserRoleSumAggregateInputType = {
    id?: true
    userId?: true
    roleId?: true
  }

  export type UserRoleMinAggregateInputType = {
    id?: true
    userId?: true
    roleId?: true
  }

  export type UserRoleMaxAggregateInputType = {
    id?: true
    userId?: true
    roleId?: true
  }

  export type UserRoleCountAggregateInputType = {
    id?: true
    userId?: true
    roleId?: true
    _all?: true
  }

  export type UserRoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRole to aggregate.
     */
    where?: UserRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRoles to fetch.
     */
    orderBy?: UserRoleOrderByWithRelationInput | UserRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserRoles
    **/
    _count?: true | UserRoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserRoleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserRoleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserRoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserRoleMaxAggregateInputType
  }

  export type GetUserRoleAggregateType<T extends UserRoleAggregateArgs> = {
        [P in keyof T & keyof AggregateUserRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserRole[P]>
      : GetScalarType<T[P], AggregateUserRole[P]>
  }




  export type UserRoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRoleWhereInput
    orderBy?: UserRoleOrderByWithAggregationInput | UserRoleOrderByWithAggregationInput[]
    by: UserRoleScalarFieldEnum[] | UserRoleScalarFieldEnum
    having?: UserRoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserRoleCountAggregateInputType | true
    _avg?: UserRoleAvgAggregateInputType
    _sum?: UserRoleSumAggregateInputType
    _min?: UserRoleMinAggregateInputType
    _max?: UserRoleMaxAggregateInputType
  }

  export type UserRoleGroupByOutputType = {
    id: number
    userId: number
    roleId: number
    _count: UserRoleCountAggregateOutputType | null
    _avg: UserRoleAvgAggregateOutputType | null
    _sum: UserRoleSumAggregateOutputType | null
    _min: UserRoleMinAggregateOutputType | null
    _max: UserRoleMaxAggregateOutputType | null
  }

  type GetUserRoleGroupByPayload<T extends UserRoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserRoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserRoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserRoleGroupByOutputType[P]>
            : GetScalarType<T[P], UserRoleGroupByOutputType[P]>
        }
      >
    >


  export type UserRoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    roleId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userRole"]>

  export type UserRoleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    roleId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userRole"]>

  export type UserRoleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    roleId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userRole"]>

  export type UserRoleSelectScalar = {
    id?: boolean
    userId?: boolean
    roleId?: boolean
  }

  export type UserRoleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "roleId", ExtArgs["result"]["userRole"]>
  export type UserRoleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }
  export type UserRoleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }
  export type UserRoleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }

  export type $UserRolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserRole"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      role: Prisma.$RolePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      roleId: number
    }, ExtArgs["result"]["userRole"]>
    composites: {}
  }

  type UserRoleGetPayload<S extends boolean | null | undefined | UserRoleDefaultArgs> = $Result.GetResult<Prisma.$UserRolePayload, S>

  type UserRoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserRoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserRoleCountAggregateInputType | true
    }

  export interface UserRoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserRole'], meta: { name: 'UserRole' } }
    /**
     * Find zero or one UserRole that matches the filter.
     * @param {UserRoleFindUniqueArgs} args - Arguments to find a UserRole
     * @example
     * // Get one UserRole
     * const userRole = await prisma.userRole.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserRoleFindUniqueArgs>(args: SelectSubset<T, UserRoleFindUniqueArgs<ExtArgs>>): Prisma__UserRoleClient<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserRole that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserRoleFindUniqueOrThrowArgs} args - Arguments to find a UserRole
     * @example
     * // Get one UserRole
     * const userRole = await prisma.userRole.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserRoleFindUniqueOrThrowArgs>(args: SelectSubset<T, UserRoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserRoleClient<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserRole that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleFindFirstArgs} args - Arguments to find a UserRole
     * @example
     * // Get one UserRole
     * const userRole = await prisma.userRole.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserRoleFindFirstArgs>(args?: SelectSubset<T, UserRoleFindFirstArgs<ExtArgs>>): Prisma__UserRoleClient<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserRole that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleFindFirstOrThrowArgs} args - Arguments to find a UserRole
     * @example
     * // Get one UserRole
     * const userRole = await prisma.userRole.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserRoleFindFirstOrThrowArgs>(args?: SelectSubset<T, UserRoleFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserRoleClient<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserRoles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserRoles
     * const userRoles = await prisma.userRole.findMany()
     * 
     * // Get first 10 UserRoles
     * const userRoles = await prisma.userRole.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userRoleWithIdOnly = await prisma.userRole.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserRoleFindManyArgs>(args?: SelectSubset<T, UserRoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserRole.
     * @param {UserRoleCreateArgs} args - Arguments to create a UserRole.
     * @example
     * // Create one UserRole
     * const UserRole = await prisma.userRole.create({
     *   data: {
     *     // ... data to create a UserRole
     *   }
     * })
     * 
     */
    create<T extends UserRoleCreateArgs>(args: SelectSubset<T, UserRoleCreateArgs<ExtArgs>>): Prisma__UserRoleClient<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserRoles.
     * @param {UserRoleCreateManyArgs} args - Arguments to create many UserRoles.
     * @example
     * // Create many UserRoles
     * const userRole = await prisma.userRole.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserRoleCreateManyArgs>(args?: SelectSubset<T, UserRoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserRoles and returns the data saved in the database.
     * @param {UserRoleCreateManyAndReturnArgs} args - Arguments to create many UserRoles.
     * @example
     * // Create many UserRoles
     * const userRole = await prisma.userRole.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserRoles and only return the `id`
     * const userRoleWithIdOnly = await prisma.userRole.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserRoleCreateManyAndReturnArgs>(args?: SelectSubset<T, UserRoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserRole.
     * @param {UserRoleDeleteArgs} args - Arguments to delete one UserRole.
     * @example
     * // Delete one UserRole
     * const UserRole = await prisma.userRole.delete({
     *   where: {
     *     // ... filter to delete one UserRole
     *   }
     * })
     * 
     */
    delete<T extends UserRoleDeleteArgs>(args: SelectSubset<T, UserRoleDeleteArgs<ExtArgs>>): Prisma__UserRoleClient<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserRole.
     * @param {UserRoleUpdateArgs} args - Arguments to update one UserRole.
     * @example
     * // Update one UserRole
     * const userRole = await prisma.userRole.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserRoleUpdateArgs>(args: SelectSubset<T, UserRoleUpdateArgs<ExtArgs>>): Prisma__UserRoleClient<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserRoles.
     * @param {UserRoleDeleteManyArgs} args - Arguments to filter UserRoles to delete.
     * @example
     * // Delete a few UserRoles
     * const { count } = await prisma.userRole.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserRoleDeleteManyArgs>(args?: SelectSubset<T, UserRoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserRoles
     * const userRole = await prisma.userRole.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserRoleUpdateManyArgs>(args: SelectSubset<T, UserRoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserRoles and returns the data updated in the database.
     * @param {UserRoleUpdateManyAndReturnArgs} args - Arguments to update many UserRoles.
     * @example
     * // Update many UserRoles
     * const userRole = await prisma.userRole.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserRoles and only return the `id`
     * const userRoleWithIdOnly = await prisma.userRole.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserRoleUpdateManyAndReturnArgs>(args: SelectSubset<T, UserRoleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserRole.
     * @param {UserRoleUpsertArgs} args - Arguments to update or create a UserRole.
     * @example
     * // Update or create a UserRole
     * const userRole = await prisma.userRole.upsert({
     *   create: {
     *     // ... data to create a UserRole
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserRole we want to update
     *   }
     * })
     */
    upsert<T extends UserRoleUpsertArgs>(args: SelectSubset<T, UserRoleUpsertArgs<ExtArgs>>): Prisma__UserRoleClient<$Result.GetResult<Prisma.$UserRolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleCountArgs} args - Arguments to filter UserRoles to count.
     * @example
     * // Count the number of UserRoles
     * const count = await prisma.userRole.count({
     *   where: {
     *     // ... the filter for the UserRoles we want to count
     *   }
     * })
    **/
    count<T extends UserRoleCountArgs>(
      args?: Subset<T, UserRoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserRoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserRoleAggregateArgs>(args: Subset<T, UserRoleAggregateArgs>): Prisma.PrismaPromise<GetUserRoleAggregateType<T>>

    /**
     * Group by UserRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRoleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserRoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserRoleGroupByArgs['orderBy'] }
        : { orderBy?: UserRoleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserRoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserRole model
   */
  readonly fields: UserRoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserRole.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserRoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    role<T extends RoleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RoleDefaultArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserRole model
   */
  interface UserRoleFieldRefs {
    readonly id: FieldRef<"UserRole", 'Int'>
    readonly userId: FieldRef<"UserRole", 'Int'>
    readonly roleId: FieldRef<"UserRole", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * UserRole findUnique
   */
  export type UserRoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    /**
     * Filter, which UserRole to fetch.
     */
    where: UserRoleWhereUniqueInput
  }

  /**
   * UserRole findUniqueOrThrow
   */
  export type UserRoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    /**
     * Filter, which UserRole to fetch.
     */
    where: UserRoleWhereUniqueInput
  }

  /**
   * UserRole findFirst
   */
  export type UserRoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    /**
     * Filter, which UserRole to fetch.
     */
    where?: UserRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRoles to fetch.
     */
    orderBy?: UserRoleOrderByWithRelationInput | UserRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRoles.
     */
    cursor?: UserRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRoles.
     */
    distinct?: UserRoleScalarFieldEnum | UserRoleScalarFieldEnum[]
  }

  /**
   * UserRole findFirstOrThrow
   */
  export type UserRoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    /**
     * Filter, which UserRole to fetch.
     */
    where?: UserRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRoles to fetch.
     */
    orderBy?: UserRoleOrderByWithRelationInput | UserRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRoles.
     */
    cursor?: UserRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRoles.
     */
    distinct?: UserRoleScalarFieldEnum | UserRoleScalarFieldEnum[]
  }

  /**
   * UserRole findMany
   */
  export type UserRoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    /**
     * Filter, which UserRoles to fetch.
     */
    where?: UserRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRoles to fetch.
     */
    orderBy?: UserRoleOrderByWithRelationInput | UserRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserRoles.
     */
    cursor?: UserRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRoles.
     */
    skip?: number
    distinct?: UserRoleScalarFieldEnum | UserRoleScalarFieldEnum[]
  }

  /**
   * UserRole create
   */
  export type UserRoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    /**
     * The data needed to create a UserRole.
     */
    data: XOR<UserRoleCreateInput, UserRoleUncheckedCreateInput>
  }

  /**
   * UserRole createMany
   */
  export type UserRoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserRoles.
     */
    data: UserRoleCreateManyInput | UserRoleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserRole createManyAndReturn
   */
  export type UserRoleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * The data used to create many UserRoles.
     */
    data: UserRoleCreateManyInput | UserRoleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserRole update
   */
  export type UserRoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    /**
     * The data needed to update a UserRole.
     */
    data: XOR<UserRoleUpdateInput, UserRoleUncheckedUpdateInput>
    /**
     * Choose, which UserRole to update.
     */
    where: UserRoleWhereUniqueInput
  }

  /**
   * UserRole updateMany
   */
  export type UserRoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserRoles.
     */
    data: XOR<UserRoleUpdateManyMutationInput, UserRoleUncheckedUpdateManyInput>
    /**
     * Filter which UserRoles to update
     */
    where?: UserRoleWhereInput
    /**
     * Limit how many UserRoles to update.
     */
    limit?: number
  }

  /**
   * UserRole updateManyAndReturn
   */
  export type UserRoleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * The data used to update UserRoles.
     */
    data: XOR<UserRoleUpdateManyMutationInput, UserRoleUncheckedUpdateManyInput>
    /**
     * Filter which UserRoles to update
     */
    where?: UserRoleWhereInput
    /**
     * Limit how many UserRoles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserRole upsert
   */
  export type UserRoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    /**
     * The filter to search for the UserRole to update in case it exists.
     */
    where: UserRoleWhereUniqueInput
    /**
     * In case the UserRole found by the `where` argument doesn't exist, create a new UserRole with this data.
     */
    create: XOR<UserRoleCreateInput, UserRoleUncheckedCreateInput>
    /**
     * In case the UserRole was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserRoleUpdateInput, UserRoleUncheckedUpdateInput>
  }

  /**
   * UserRole delete
   */
  export type UserRoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
    /**
     * Filter which UserRole to delete.
     */
    where: UserRoleWhereUniqueInput
  }

  /**
   * UserRole deleteMany
   */
  export type UserRoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRoles to delete
     */
    where?: UserRoleWhereInput
    /**
     * Limit how many UserRoles to delete.
     */
    limit?: number
  }

  /**
   * UserRole without action
   */
  export type UserRoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRole
     */
    select?: UserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRole
     */
    omit?: UserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRoleInclude<ExtArgs> | null
  }


  /**
   * Model RoleAuthority
   */

  export type AggregateRoleAuthority = {
    _count: RoleAuthorityCountAggregateOutputType | null
    _avg: RoleAuthorityAvgAggregateOutputType | null
    _sum: RoleAuthoritySumAggregateOutputType | null
    _min: RoleAuthorityMinAggregateOutputType | null
    _max: RoleAuthorityMaxAggregateOutputType | null
  }

  export type RoleAuthorityAvgAggregateOutputType = {
    id: number | null
    roleId: number | null
    authorityId: number | null
  }

  export type RoleAuthoritySumAggregateOutputType = {
    id: number | null
    roleId: number | null
    authorityId: number | null
  }

  export type RoleAuthorityMinAggregateOutputType = {
    id: number | null
    roleId: number | null
    authorityId: number | null
  }

  export type RoleAuthorityMaxAggregateOutputType = {
    id: number | null
    roleId: number | null
    authorityId: number | null
  }

  export type RoleAuthorityCountAggregateOutputType = {
    id: number
    roleId: number
    authorityId: number
    _all: number
  }


  export type RoleAuthorityAvgAggregateInputType = {
    id?: true
    roleId?: true
    authorityId?: true
  }

  export type RoleAuthoritySumAggregateInputType = {
    id?: true
    roleId?: true
    authorityId?: true
  }

  export type RoleAuthorityMinAggregateInputType = {
    id?: true
    roleId?: true
    authorityId?: true
  }

  export type RoleAuthorityMaxAggregateInputType = {
    id?: true
    roleId?: true
    authorityId?: true
  }

  export type RoleAuthorityCountAggregateInputType = {
    id?: true
    roleId?: true
    authorityId?: true
    _all?: true
  }

  export type RoleAuthorityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RoleAuthority to aggregate.
     */
    where?: RoleAuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoleAuthorities to fetch.
     */
    orderBy?: RoleAuthorityOrderByWithRelationInput | RoleAuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoleAuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoleAuthorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoleAuthorities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RoleAuthorities
    **/
    _count?: true | RoleAuthorityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RoleAuthorityAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RoleAuthoritySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoleAuthorityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoleAuthorityMaxAggregateInputType
  }

  export type GetRoleAuthorityAggregateType<T extends RoleAuthorityAggregateArgs> = {
        [P in keyof T & keyof AggregateRoleAuthority]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoleAuthority[P]>
      : GetScalarType<T[P], AggregateRoleAuthority[P]>
  }




  export type RoleAuthorityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleAuthorityWhereInput
    orderBy?: RoleAuthorityOrderByWithAggregationInput | RoleAuthorityOrderByWithAggregationInput[]
    by: RoleAuthorityScalarFieldEnum[] | RoleAuthorityScalarFieldEnum
    having?: RoleAuthorityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoleAuthorityCountAggregateInputType | true
    _avg?: RoleAuthorityAvgAggregateInputType
    _sum?: RoleAuthoritySumAggregateInputType
    _min?: RoleAuthorityMinAggregateInputType
    _max?: RoleAuthorityMaxAggregateInputType
  }

  export type RoleAuthorityGroupByOutputType = {
    id: number
    roleId: number
    authorityId: number
    _count: RoleAuthorityCountAggregateOutputType | null
    _avg: RoleAuthorityAvgAggregateOutputType | null
    _sum: RoleAuthoritySumAggregateOutputType | null
    _min: RoleAuthorityMinAggregateOutputType | null
    _max: RoleAuthorityMaxAggregateOutputType | null
  }

  type GetRoleAuthorityGroupByPayload<T extends RoleAuthorityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoleAuthorityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoleAuthorityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoleAuthorityGroupByOutputType[P]>
            : GetScalarType<T[P], RoleAuthorityGroupByOutputType[P]>
        }
      >
    >


  export type RoleAuthoritySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    roleId?: boolean
    authorityId?: boolean
    role?: boolean | RoleDefaultArgs<ExtArgs>
    authority?: boolean | AuthorityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roleAuthority"]>

  export type RoleAuthoritySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    roleId?: boolean
    authorityId?: boolean
    role?: boolean | RoleDefaultArgs<ExtArgs>
    authority?: boolean | AuthorityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roleAuthority"]>

  export type RoleAuthoritySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    roleId?: boolean
    authorityId?: boolean
    role?: boolean | RoleDefaultArgs<ExtArgs>
    authority?: boolean | AuthorityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roleAuthority"]>

  export type RoleAuthoritySelectScalar = {
    id?: boolean
    roleId?: boolean
    authorityId?: boolean
  }

  export type RoleAuthorityOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "roleId" | "authorityId", ExtArgs["result"]["roleAuthority"]>
  export type RoleAuthorityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    role?: boolean | RoleDefaultArgs<ExtArgs>
    authority?: boolean | AuthorityDefaultArgs<ExtArgs>
  }
  export type RoleAuthorityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    role?: boolean | RoleDefaultArgs<ExtArgs>
    authority?: boolean | AuthorityDefaultArgs<ExtArgs>
  }
  export type RoleAuthorityIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    role?: boolean | RoleDefaultArgs<ExtArgs>
    authority?: boolean | AuthorityDefaultArgs<ExtArgs>
  }

  export type $RoleAuthorityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RoleAuthority"
    objects: {
      role: Prisma.$RolePayload<ExtArgs>
      authority: Prisma.$AuthorityPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      roleId: number
      authorityId: number
    }, ExtArgs["result"]["roleAuthority"]>
    composites: {}
  }

  type RoleAuthorityGetPayload<S extends boolean | null | undefined | RoleAuthorityDefaultArgs> = $Result.GetResult<Prisma.$RoleAuthorityPayload, S>

  type RoleAuthorityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RoleAuthorityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoleAuthorityCountAggregateInputType | true
    }

  export interface RoleAuthorityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RoleAuthority'], meta: { name: 'RoleAuthority' } }
    /**
     * Find zero or one RoleAuthority that matches the filter.
     * @param {RoleAuthorityFindUniqueArgs} args - Arguments to find a RoleAuthority
     * @example
     * // Get one RoleAuthority
     * const roleAuthority = await prisma.roleAuthority.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoleAuthorityFindUniqueArgs>(args: SelectSubset<T, RoleAuthorityFindUniqueArgs<ExtArgs>>): Prisma__RoleAuthorityClient<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RoleAuthority that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoleAuthorityFindUniqueOrThrowArgs} args - Arguments to find a RoleAuthority
     * @example
     * // Get one RoleAuthority
     * const roleAuthority = await prisma.roleAuthority.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoleAuthorityFindUniqueOrThrowArgs>(args: SelectSubset<T, RoleAuthorityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoleAuthorityClient<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RoleAuthority that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAuthorityFindFirstArgs} args - Arguments to find a RoleAuthority
     * @example
     * // Get one RoleAuthority
     * const roleAuthority = await prisma.roleAuthority.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoleAuthorityFindFirstArgs>(args?: SelectSubset<T, RoleAuthorityFindFirstArgs<ExtArgs>>): Prisma__RoleAuthorityClient<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RoleAuthority that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAuthorityFindFirstOrThrowArgs} args - Arguments to find a RoleAuthority
     * @example
     * // Get one RoleAuthority
     * const roleAuthority = await prisma.roleAuthority.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoleAuthorityFindFirstOrThrowArgs>(args?: SelectSubset<T, RoleAuthorityFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoleAuthorityClient<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RoleAuthorities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAuthorityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RoleAuthorities
     * const roleAuthorities = await prisma.roleAuthority.findMany()
     * 
     * // Get first 10 RoleAuthorities
     * const roleAuthorities = await prisma.roleAuthority.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roleAuthorityWithIdOnly = await prisma.roleAuthority.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RoleAuthorityFindManyArgs>(args?: SelectSubset<T, RoleAuthorityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RoleAuthority.
     * @param {RoleAuthorityCreateArgs} args - Arguments to create a RoleAuthority.
     * @example
     * // Create one RoleAuthority
     * const RoleAuthority = await prisma.roleAuthority.create({
     *   data: {
     *     // ... data to create a RoleAuthority
     *   }
     * })
     * 
     */
    create<T extends RoleAuthorityCreateArgs>(args: SelectSubset<T, RoleAuthorityCreateArgs<ExtArgs>>): Prisma__RoleAuthorityClient<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RoleAuthorities.
     * @param {RoleAuthorityCreateManyArgs} args - Arguments to create many RoleAuthorities.
     * @example
     * // Create many RoleAuthorities
     * const roleAuthority = await prisma.roleAuthority.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoleAuthorityCreateManyArgs>(args?: SelectSubset<T, RoleAuthorityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RoleAuthorities and returns the data saved in the database.
     * @param {RoleAuthorityCreateManyAndReturnArgs} args - Arguments to create many RoleAuthorities.
     * @example
     * // Create many RoleAuthorities
     * const roleAuthority = await prisma.roleAuthority.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RoleAuthorities and only return the `id`
     * const roleAuthorityWithIdOnly = await prisma.roleAuthority.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RoleAuthorityCreateManyAndReturnArgs>(args?: SelectSubset<T, RoleAuthorityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RoleAuthority.
     * @param {RoleAuthorityDeleteArgs} args - Arguments to delete one RoleAuthority.
     * @example
     * // Delete one RoleAuthority
     * const RoleAuthority = await prisma.roleAuthority.delete({
     *   where: {
     *     // ... filter to delete one RoleAuthority
     *   }
     * })
     * 
     */
    delete<T extends RoleAuthorityDeleteArgs>(args: SelectSubset<T, RoleAuthorityDeleteArgs<ExtArgs>>): Prisma__RoleAuthorityClient<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RoleAuthority.
     * @param {RoleAuthorityUpdateArgs} args - Arguments to update one RoleAuthority.
     * @example
     * // Update one RoleAuthority
     * const roleAuthority = await prisma.roleAuthority.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoleAuthorityUpdateArgs>(args: SelectSubset<T, RoleAuthorityUpdateArgs<ExtArgs>>): Prisma__RoleAuthorityClient<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RoleAuthorities.
     * @param {RoleAuthorityDeleteManyArgs} args - Arguments to filter RoleAuthorities to delete.
     * @example
     * // Delete a few RoleAuthorities
     * const { count } = await prisma.roleAuthority.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoleAuthorityDeleteManyArgs>(args?: SelectSubset<T, RoleAuthorityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RoleAuthorities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAuthorityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RoleAuthorities
     * const roleAuthority = await prisma.roleAuthority.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoleAuthorityUpdateManyArgs>(args: SelectSubset<T, RoleAuthorityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RoleAuthorities and returns the data updated in the database.
     * @param {RoleAuthorityUpdateManyAndReturnArgs} args - Arguments to update many RoleAuthorities.
     * @example
     * // Update many RoleAuthorities
     * const roleAuthority = await prisma.roleAuthority.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RoleAuthorities and only return the `id`
     * const roleAuthorityWithIdOnly = await prisma.roleAuthority.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RoleAuthorityUpdateManyAndReturnArgs>(args: SelectSubset<T, RoleAuthorityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RoleAuthority.
     * @param {RoleAuthorityUpsertArgs} args - Arguments to update or create a RoleAuthority.
     * @example
     * // Update or create a RoleAuthority
     * const roleAuthority = await prisma.roleAuthority.upsert({
     *   create: {
     *     // ... data to create a RoleAuthority
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RoleAuthority we want to update
     *   }
     * })
     */
    upsert<T extends RoleAuthorityUpsertArgs>(args: SelectSubset<T, RoleAuthorityUpsertArgs<ExtArgs>>): Prisma__RoleAuthorityClient<$Result.GetResult<Prisma.$RoleAuthorityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RoleAuthorities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAuthorityCountArgs} args - Arguments to filter RoleAuthorities to count.
     * @example
     * // Count the number of RoleAuthorities
     * const count = await prisma.roleAuthority.count({
     *   where: {
     *     // ... the filter for the RoleAuthorities we want to count
     *   }
     * })
    **/
    count<T extends RoleAuthorityCountArgs>(
      args?: Subset<T, RoleAuthorityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoleAuthorityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RoleAuthority.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAuthorityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoleAuthorityAggregateArgs>(args: Subset<T, RoleAuthorityAggregateArgs>): Prisma.PrismaPromise<GetRoleAuthorityAggregateType<T>>

    /**
     * Group by RoleAuthority.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAuthorityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoleAuthorityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoleAuthorityGroupByArgs['orderBy'] }
        : { orderBy?: RoleAuthorityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoleAuthorityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoleAuthorityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RoleAuthority model
   */
  readonly fields: RoleAuthorityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RoleAuthority.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoleAuthorityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    role<T extends RoleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RoleDefaultArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    authority<T extends AuthorityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AuthorityDefaultArgs<ExtArgs>>): Prisma__AuthorityClient<$Result.GetResult<Prisma.$AuthorityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RoleAuthority model
   */
  interface RoleAuthorityFieldRefs {
    readonly id: FieldRef<"RoleAuthority", 'Int'>
    readonly roleId: FieldRef<"RoleAuthority", 'Int'>
    readonly authorityId: FieldRef<"RoleAuthority", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * RoleAuthority findUnique
   */
  export type RoleAuthorityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which RoleAuthority to fetch.
     */
    where: RoleAuthorityWhereUniqueInput
  }

  /**
   * RoleAuthority findUniqueOrThrow
   */
  export type RoleAuthorityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which RoleAuthority to fetch.
     */
    where: RoleAuthorityWhereUniqueInput
  }

  /**
   * RoleAuthority findFirst
   */
  export type RoleAuthorityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which RoleAuthority to fetch.
     */
    where?: RoleAuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoleAuthorities to fetch.
     */
    orderBy?: RoleAuthorityOrderByWithRelationInput | RoleAuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RoleAuthorities.
     */
    cursor?: RoleAuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoleAuthorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoleAuthorities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RoleAuthorities.
     */
    distinct?: RoleAuthorityScalarFieldEnum | RoleAuthorityScalarFieldEnum[]
  }

  /**
   * RoleAuthority findFirstOrThrow
   */
  export type RoleAuthorityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which RoleAuthority to fetch.
     */
    where?: RoleAuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoleAuthorities to fetch.
     */
    orderBy?: RoleAuthorityOrderByWithRelationInput | RoleAuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RoleAuthorities.
     */
    cursor?: RoleAuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoleAuthorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoleAuthorities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RoleAuthorities.
     */
    distinct?: RoleAuthorityScalarFieldEnum | RoleAuthorityScalarFieldEnum[]
  }

  /**
   * RoleAuthority findMany
   */
  export type RoleAuthorityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which RoleAuthorities to fetch.
     */
    where?: RoleAuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RoleAuthorities to fetch.
     */
    orderBy?: RoleAuthorityOrderByWithRelationInput | RoleAuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RoleAuthorities.
     */
    cursor?: RoleAuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RoleAuthorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RoleAuthorities.
     */
    skip?: number
    distinct?: RoleAuthorityScalarFieldEnum | RoleAuthorityScalarFieldEnum[]
  }

  /**
   * RoleAuthority create
   */
  export type RoleAuthorityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    /**
     * The data needed to create a RoleAuthority.
     */
    data: XOR<RoleAuthorityCreateInput, RoleAuthorityUncheckedCreateInput>
  }

  /**
   * RoleAuthority createMany
   */
  export type RoleAuthorityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RoleAuthorities.
     */
    data: RoleAuthorityCreateManyInput | RoleAuthorityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RoleAuthority createManyAndReturn
   */
  export type RoleAuthorityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * The data used to create many RoleAuthorities.
     */
    data: RoleAuthorityCreateManyInput | RoleAuthorityCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RoleAuthority update
   */
  export type RoleAuthorityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    /**
     * The data needed to update a RoleAuthority.
     */
    data: XOR<RoleAuthorityUpdateInput, RoleAuthorityUncheckedUpdateInput>
    /**
     * Choose, which RoleAuthority to update.
     */
    where: RoleAuthorityWhereUniqueInput
  }

  /**
   * RoleAuthority updateMany
   */
  export type RoleAuthorityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RoleAuthorities.
     */
    data: XOR<RoleAuthorityUpdateManyMutationInput, RoleAuthorityUncheckedUpdateManyInput>
    /**
     * Filter which RoleAuthorities to update
     */
    where?: RoleAuthorityWhereInput
    /**
     * Limit how many RoleAuthorities to update.
     */
    limit?: number
  }

  /**
   * RoleAuthority updateManyAndReturn
   */
  export type RoleAuthorityUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * The data used to update RoleAuthorities.
     */
    data: XOR<RoleAuthorityUpdateManyMutationInput, RoleAuthorityUncheckedUpdateManyInput>
    /**
     * Filter which RoleAuthorities to update
     */
    where?: RoleAuthorityWhereInput
    /**
     * Limit how many RoleAuthorities to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RoleAuthority upsert
   */
  export type RoleAuthorityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    /**
     * The filter to search for the RoleAuthority to update in case it exists.
     */
    where: RoleAuthorityWhereUniqueInput
    /**
     * In case the RoleAuthority found by the `where` argument doesn't exist, create a new RoleAuthority with this data.
     */
    create: XOR<RoleAuthorityCreateInput, RoleAuthorityUncheckedCreateInput>
    /**
     * In case the RoleAuthority was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoleAuthorityUpdateInput, RoleAuthorityUncheckedUpdateInput>
  }

  /**
   * RoleAuthority delete
   */
  export type RoleAuthorityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
    /**
     * Filter which RoleAuthority to delete.
     */
    where: RoleAuthorityWhereUniqueInput
  }

  /**
   * RoleAuthority deleteMany
   */
  export type RoleAuthorityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RoleAuthorities to delete
     */
    where?: RoleAuthorityWhereInput
    /**
     * Limit how many RoleAuthorities to delete.
     */
    limit?: number
  }

  /**
   * RoleAuthority without action
   */
  export type RoleAuthorityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleAuthority
     */
    select?: RoleAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the RoleAuthority
     */
    omit?: RoleAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleAuthorityInclude<ExtArgs> | null
  }


  /**
   * Model UserLog
   */

  export type AggregateUserLog = {
    _count: UserLogCountAggregateOutputType | null
    _avg: UserLogAvgAggregateOutputType | null
    _sum: UserLogSumAggregateOutputType | null
    _min: UserLogMinAggregateOutputType | null
    _max: UserLogMaxAggregateOutputType | null
  }

  export type UserLogAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    branch_id: number | null
  }

  export type UserLogSumAggregateOutputType = {
    id: number | null
    userId: number | null
    branch_id: number | null
  }

  export type UserLogMinAggregateOutputType = {
    id: number | null
    userId: number | null
    branch_id: number | null
    action: $Enums.LogAction | null
    status: $Enums.LogStatus | null
    ip_address: string | null
    user_agent: string | null
    device_info: string | null
    created_at: Date | null
  }

  export type UserLogMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    branch_id: number | null
    action: $Enums.LogAction | null
    status: $Enums.LogStatus | null
    ip_address: string | null
    user_agent: string | null
    device_info: string | null
    created_at: Date | null
  }

  export type UserLogCountAggregateOutputType = {
    id: number
    userId: number
    branch_id: number
    action: number
    status: number
    ip_address: number
    user_agent: number
    device_info: number
    created_at: number
    _all: number
  }


  export type UserLogAvgAggregateInputType = {
    id?: true
    userId?: true
    branch_id?: true
  }

  export type UserLogSumAggregateInputType = {
    id?: true
    userId?: true
    branch_id?: true
  }

  export type UserLogMinAggregateInputType = {
    id?: true
    userId?: true
    branch_id?: true
    action?: true
    status?: true
    ip_address?: true
    user_agent?: true
    device_info?: true
    created_at?: true
  }

  export type UserLogMaxAggregateInputType = {
    id?: true
    userId?: true
    branch_id?: true
    action?: true
    status?: true
    ip_address?: true
    user_agent?: true
    device_info?: true
    created_at?: true
  }

  export type UserLogCountAggregateInputType = {
    id?: true
    userId?: true
    branch_id?: true
    action?: true
    status?: true
    ip_address?: true
    user_agent?: true
    device_info?: true
    created_at?: true
    _all?: true
  }

  export type UserLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserLog to aggregate.
     */
    where?: UserLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserLogs to fetch.
     */
    orderBy?: UserLogOrderByWithRelationInput | UserLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserLogs
    **/
    _count?: true | UserLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserLogMaxAggregateInputType
  }

  export type GetUserLogAggregateType<T extends UserLogAggregateArgs> = {
        [P in keyof T & keyof AggregateUserLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserLog[P]>
      : GetScalarType<T[P], AggregateUserLog[P]>
  }




  export type UserLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserLogWhereInput
    orderBy?: UserLogOrderByWithAggregationInput | UserLogOrderByWithAggregationInput[]
    by: UserLogScalarFieldEnum[] | UserLogScalarFieldEnum
    having?: UserLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserLogCountAggregateInputType | true
    _avg?: UserLogAvgAggregateInputType
    _sum?: UserLogSumAggregateInputType
    _min?: UserLogMinAggregateInputType
    _max?: UserLogMaxAggregateInputType
  }

  export type UserLogGroupByOutputType = {
    id: number
    userId: number
    branch_id: number | null
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address: string | null
    user_agent: string | null
    device_info: string | null
    created_at: Date
    _count: UserLogCountAggregateOutputType | null
    _avg: UserLogAvgAggregateOutputType | null
    _sum: UserLogSumAggregateOutputType | null
    _min: UserLogMinAggregateOutputType | null
    _max: UserLogMaxAggregateOutputType | null
  }

  type GetUserLogGroupByPayload<T extends UserLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserLogGroupByOutputType[P]>
            : GetScalarType<T[P], UserLogGroupByOutputType[P]>
        }
      >
    >


  export type UserLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    branch_id?: boolean
    action?: boolean
    status?: boolean
    ip_address?: boolean
    user_agent?: boolean
    device_info?: boolean
    created_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    branch?: boolean | UserLog$branchArgs<ExtArgs>
  }, ExtArgs["result"]["userLog"]>

  export type UserLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    branch_id?: boolean
    action?: boolean
    status?: boolean
    ip_address?: boolean
    user_agent?: boolean
    device_info?: boolean
    created_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    branch?: boolean | UserLog$branchArgs<ExtArgs>
  }, ExtArgs["result"]["userLog"]>

  export type UserLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    branch_id?: boolean
    action?: boolean
    status?: boolean
    ip_address?: boolean
    user_agent?: boolean
    device_info?: boolean
    created_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    branch?: boolean | UserLog$branchArgs<ExtArgs>
  }, ExtArgs["result"]["userLog"]>

  export type UserLogSelectScalar = {
    id?: boolean
    userId?: boolean
    branch_id?: boolean
    action?: boolean
    status?: boolean
    ip_address?: boolean
    user_agent?: boolean
    device_info?: boolean
    created_at?: boolean
  }

  export type UserLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "branch_id" | "action" | "status" | "ip_address" | "user_agent" | "device_info" | "created_at", ExtArgs["result"]["userLog"]>
  export type UserLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    branch?: boolean | UserLog$branchArgs<ExtArgs>
  }
  export type UserLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    branch?: boolean | UserLog$branchArgs<ExtArgs>
  }
  export type UserLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    branch?: boolean | UserLog$branchArgs<ExtArgs>
  }

  export type $UserLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserLog"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      branch: Prisma.$BranchPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      branch_id: number | null
      action: $Enums.LogAction
      status: $Enums.LogStatus
      ip_address: string | null
      user_agent: string | null
      device_info: string | null
      created_at: Date
    }, ExtArgs["result"]["userLog"]>
    composites: {}
  }

  type UserLogGetPayload<S extends boolean | null | undefined | UserLogDefaultArgs> = $Result.GetResult<Prisma.$UserLogPayload, S>

  type UserLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserLogCountAggregateInputType | true
    }

  export interface UserLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserLog'], meta: { name: 'UserLog' } }
    /**
     * Find zero or one UserLog that matches the filter.
     * @param {UserLogFindUniqueArgs} args - Arguments to find a UserLog
     * @example
     * // Get one UserLog
     * const userLog = await prisma.userLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserLogFindUniqueArgs>(args: SelectSubset<T, UserLogFindUniqueArgs<ExtArgs>>): Prisma__UserLogClient<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserLogFindUniqueOrThrowArgs} args - Arguments to find a UserLog
     * @example
     * // Get one UserLog
     * const userLog = await prisma.userLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserLogFindUniqueOrThrowArgs>(args: SelectSubset<T, UserLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserLogClient<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLogFindFirstArgs} args - Arguments to find a UserLog
     * @example
     * // Get one UserLog
     * const userLog = await prisma.userLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserLogFindFirstArgs>(args?: SelectSubset<T, UserLogFindFirstArgs<ExtArgs>>): Prisma__UserLogClient<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLogFindFirstOrThrowArgs} args - Arguments to find a UserLog
     * @example
     * // Get one UserLog
     * const userLog = await prisma.userLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserLogFindFirstOrThrowArgs>(args?: SelectSubset<T, UserLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserLogClient<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserLogs
     * const userLogs = await prisma.userLog.findMany()
     * 
     * // Get first 10 UserLogs
     * const userLogs = await prisma.userLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userLogWithIdOnly = await prisma.userLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserLogFindManyArgs>(args?: SelectSubset<T, UserLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserLog.
     * @param {UserLogCreateArgs} args - Arguments to create a UserLog.
     * @example
     * // Create one UserLog
     * const UserLog = await prisma.userLog.create({
     *   data: {
     *     // ... data to create a UserLog
     *   }
     * })
     * 
     */
    create<T extends UserLogCreateArgs>(args: SelectSubset<T, UserLogCreateArgs<ExtArgs>>): Prisma__UserLogClient<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserLogs.
     * @param {UserLogCreateManyArgs} args - Arguments to create many UserLogs.
     * @example
     * // Create many UserLogs
     * const userLog = await prisma.userLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserLogCreateManyArgs>(args?: SelectSubset<T, UserLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserLogs and returns the data saved in the database.
     * @param {UserLogCreateManyAndReturnArgs} args - Arguments to create many UserLogs.
     * @example
     * // Create many UserLogs
     * const userLog = await prisma.userLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserLogs and only return the `id`
     * const userLogWithIdOnly = await prisma.userLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserLogCreateManyAndReturnArgs>(args?: SelectSubset<T, UserLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserLog.
     * @param {UserLogDeleteArgs} args - Arguments to delete one UserLog.
     * @example
     * // Delete one UserLog
     * const UserLog = await prisma.userLog.delete({
     *   where: {
     *     // ... filter to delete one UserLog
     *   }
     * })
     * 
     */
    delete<T extends UserLogDeleteArgs>(args: SelectSubset<T, UserLogDeleteArgs<ExtArgs>>): Prisma__UserLogClient<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserLog.
     * @param {UserLogUpdateArgs} args - Arguments to update one UserLog.
     * @example
     * // Update one UserLog
     * const userLog = await prisma.userLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserLogUpdateArgs>(args: SelectSubset<T, UserLogUpdateArgs<ExtArgs>>): Prisma__UserLogClient<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserLogs.
     * @param {UserLogDeleteManyArgs} args - Arguments to filter UserLogs to delete.
     * @example
     * // Delete a few UserLogs
     * const { count } = await prisma.userLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserLogDeleteManyArgs>(args?: SelectSubset<T, UserLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserLogs
     * const userLog = await prisma.userLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserLogUpdateManyArgs>(args: SelectSubset<T, UserLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserLogs and returns the data updated in the database.
     * @param {UserLogUpdateManyAndReturnArgs} args - Arguments to update many UserLogs.
     * @example
     * // Update many UserLogs
     * const userLog = await prisma.userLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserLogs and only return the `id`
     * const userLogWithIdOnly = await prisma.userLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserLogUpdateManyAndReturnArgs>(args: SelectSubset<T, UserLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserLog.
     * @param {UserLogUpsertArgs} args - Arguments to update or create a UserLog.
     * @example
     * // Update or create a UserLog
     * const userLog = await prisma.userLog.upsert({
     *   create: {
     *     // ... data to create a UserLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserLog we want to update
     *   }
     * })
     */
    upsert<T extends UserLogUpsertArgs>(args: SelectSubset<T, UserLogUpsertArgs<ExtArgs>>): Prisma__UserLogClient<$Result.GetResult<Prisma.$UserLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLogCountArgs} args - Arguments to filter UserLogs to count.
     * @example
     * // Count the number of UserLogs
     * const count = await prisma.userLog.count({
     *   where: {
     *     // ... the filter for the UserLogs we want to count
     *   }
     * })
    **/
    count<T extends UserLogCountArgs>(
      args?: Subset<T, UserLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserLogAggregateArgs>(args: Subset<T, UserLogAggregateArgs>): Prisma.PrismaPromise<GetUserLogAggregateType<T>>

    /**
     * Group by UserLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserLogGroupByArgs['orderBy'] }
        : { orderBy?: UserLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserLog model
   */
  readonly fields: UserLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    branch<T extends UserLog$branchArgs<ExtArgs> = {}>(args?: Subset<T, UserLog$branchArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserLog model
   */
  interface UserLogFieldRefs {
    readonly id: FieldRef<"UserLog", 'Int'>
    readonly userId: FieldRef<"UserLog", 'Int'>
    readonly branch_id: FieldRef<"UserLog", 'Int'>
    readonly action: FieldRef<"UserLog", 'LogAction'>
    readonly status: FieldRef<"UserLog", 'LogStatus'>
    readonly ip_address: FieldRef<"UserLog", 'String'>
    readonly user_agent: FieldRef<"UserLog", 'String'>
    readonly device_info: FieldRef<"UserLog", 'String'>
    readonly created_at: FieldRef<"UserLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserLog findUnique
   */
  export type UserLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    /**
     * Filter, which UserLog to fetch.
     */
    where: UserLogWhereUniqueInput
  }

  /**
   * UserLog findUniqueOrThrow
   */
  export type UserLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    /**
     * Filter, which UserLog to fetch.
     */
    where: UserLogWhereUniqueInput
  }

  /**
   * UserLog findFirst
   */
  export type UserLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    /**
     * Filter, which UserLog to fetch.
     */
    where?: UserLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserLogs to fetch.
     */
    orderBy?: UserLogOrderByWithRelationInput | UserLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserLogs.
     */
    cursor?: UserLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserLogs.
     */
    distinct?: UserLogScalarFieldEnum | UserLogScalarFieldEnum[]
  }

  /**
   * UserLog findFirstOrThrow
   */
  export type UserLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    /**
     * Filter, which UserLog to fetch.
     */
    where?: UserLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserLogs to fetch.
     */
    orderBy?: UserLogOrderByWithRelationInput | UserLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserLogs.
     */
    cursor?: UserLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserLogs.
     */
    distinct?: UserLogScalarFieldEnum | UserLogScalarFieldEnum[]
  }

  /**
   * UserLog findMany
   */
  export type UserLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    /**
     * Filter, which UserLogs to fetch.
     */
    where?: UserLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserLogs to fetch.
     */
    orderBy?: UserLogOrderByWithRelationInput | UserLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserLogs.
     */
    cursor?: UserLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserLogs.
     */
    skip?: number
    distinct?: UserLogScalarFieldEnum | UserLogScalarFieldEnum[]
  }

  /**
   * UserLog create
   */
  export type UserLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    /**
     * The data needed to create a UserLog.
     */
    data: XOR<UserLogCreateInput, UserLogUncheckedCreateInput>
  }

  /**
   * UserLog createMany
   */
  export type UserLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserLogs.
     */
    data: UserLogCreateManyInput | UserLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserLog createManyAndReturn
   */
  export type UserLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * The data used to create many UserLogs.
     */
    data: UserLogCreateManyInput | UserLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserLog update
   */
  export type UserLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    /**
     * The data needed to update a UserLog.
     */
    data: XOR<UserLogUpdateInput, UserLogUncheckedUpdateInput>
    /**
     * Choose, which UserLog to update.
     */
    where: UserLogWhereUniqueInput
  }

  /**
   * UserLog updateMany
   */
  export type UserLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserLogs.
     */
    data: XOR<UserLogUpdateManyMutationInput, UserLogUncheckedUpdateManyInput>
    /**
     * Filter which UserLogs to update
     */
    where?: UserLogWhereInput
    /**
     * Limit how many UserLogs to update.
     */
    limit?: number
  }

  /**
   * UserLog updateManyAndReturn
   */
  export type UserLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * The data used to update UserLogs.
     */
    data: XOR<UserLogUpdateManyMutationInput, UserLogUncheckedUpdateManyInput>
    /**
     * Filter which UserLogs to update
     */
    where?: UserLogWhereInput
    /**
     * Limit how many UserLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserLog upsert
   */
  export type UserLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    /**
     * The filter to search for the UserLog to update in case it exists.
     */
    where: UserLogWhereUniqueInput
    /**
     * In case the UserLog found by the `where` argument doesn't exist, create a new UserLog with this data.
     */
    create: XOR<UserLogCreateInput, UserLogUncheckedCreateInput>
    /**
     * In case the UserLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserLogUpdateInput, UserLogUncheckedUpdateInput>
  }

  /**
   * UserLog delete
   */
  export type UserLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
    /**
     * Filter which UserLog to delete.
     */
    where: UserLogWhereUniqueInput
  }

  /**
   * UserLog deleteMany
   */
  export type UserLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserLogs to delete
     */
    where?: UserLogWhereInput
    /**
     * Limit how many UserLogs to delete.
     */
    limit?: number
  }

  /**
   * UserLog.branch
   */
  export type UserLog$branchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    where?: BranchWhereInput
  }

  /**
   * UserLog without action
   */
  export type UserLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserLog
     */
    select?: UserLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserLog
     */
    omit?: UserLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserLogInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    id: number | null
    price: Decimal | null
    cost_price: Decimal | null
    quantity: number | null
    min_quantity: number | null
    company_id: number | null
    branch_id: number | null
  }

  export type ProductSumAggregateOutputType = {
    id: number | null
    price: Decimal | null
    cost_price: Decimal | null
    quantity: number | null
    min_quantity: number | null
    company_id: number | null
    branch_id: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: number | null
    name: string | null
    code: string | null
    description: string | null
    price: Decimal | null
    cost_price: Decimal | null
    quantity: number | null
    min_quantity: number | null
    company_id: number | null
    branch_id: number | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProductMaxAggregateOutputType = {
    id: number | null
    name: string | null
    code: string | null
    description: string | null
    price: Decimal | null
    cost_price: Decimal | null
    quantity: number | null
    min_quantity: number | null
    company_id: number | null
    branch_id: number | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    name: number
    code: number
    description: number
    price: number
    cost_price: number
    quantity: number
    min_quantity: number
    company_id: number
    branch_id: number
    is_active: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    id?: true
    price?: true
    cost_price?: true
    quantity?: true
    min_quantity?: true
    company_id?: true
    branch_id?: true
  }

  export type ProductSumAggregateInputType = {
    id?: true
    price?: true
    cost_price?: true
    quantity?: true
    min_quantity?: true
    company_id?: true
    branch_id?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    description?: true
    price?: true
    cost_price?: true
    quantity?: true
    min_quantity?: true
    company_id?: true
    branch_id?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    description?: true
    price?: true
    cost_price?: true
    quantity?: true
    min_quantity?: true
    company_id?: true
    branch_id?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    description?: true
    price?: true
    cost_price?: true
    quantity?: true
    min_quantity?: true
    company_id?: true
    branch_id?: true
    is_active?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: number
    name: string
    code: string
    description: string | null
    price: Decimal
    cost_price: Decimal | null
    quantity: number
    min_quantity: number
    company_id: number
    branch_id: number | null
    is_active: boolean
    created_at: Date
    updated_at: Date
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    price?: boolean
    cost_price?: boolean
    quantity?: boolean
    min_quantity?: boolean
    company_id?: boolean
    branch_id?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    billItems?: boolean | Product$billItemsArgs<ExtArgs>
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | Product$branchArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    price?: boolean
    cost_price?: boolean
    quantity?: boolean
    min_quantity?: boolean
    company_id?: boolean
    branch_id?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | Product$branchArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    price?: boolean
    cost_price?: boolean
    quantity?: boolean
    min_quantity?: boolean
    company_id?: boolean
    branch_id?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | Product$branchArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    price?: boolean
    cost_price?: boolean
    quantity?: boolean
    min_quantity?: boolean
    company_id?: boolean
    branch_id?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "code" | "description" | "price" | "cost_price" | "quantity" | "min_quantity" | "company_id" | "branch_id" | "is_active" | "created_at" | "updated_at", ExtArgs["result"]["product"]>
  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    billItems?: boolean | Product$billItemsArgs<ExtArgs>
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | Product$branchArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | Product$branchArgs<ExtArgs>
  }
  export type ProductIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | Product$branchArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      billItems: Prisma.$BillItemPayload<ExtArgs>[]
      company: Prisma.$CompanyPayload<ExtArgs>
      branch: Prisma.$BranchPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      code: string
      description: string | null
      price: Prisma.Decimal
      cost_price: Prisma.Decimal | null
      quantity: number
      min_quantity: number
      company_id: number
      branch_id: number | null
      is_active: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {ProductUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `id`
     * const productWithIdOnly = await prisma.product.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    billItems<T extends Product$billItemsArgs<ExtArgs> = {}>(args?: Subset<T, Product$billItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    branch<T extends Product$branchArgs<ExtArgs> = {}>(args?: Subset<T, Product$branchArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'Int'>
    readonly name: FieldRef<"Product", 'String'>
    readonly code: FieldRef<"Product", 'String'>
    readonly description: FieldRef<"Product", 'String'>
    readonly price: FieldRef<"Product", 'Decimal'>
    readonly cost_price: FieldRef<"Product", 'Decimal'>
    readonly quantity: FieldRef<"Product", 'Int'>
    readonly min_quantity: FieldRef<"Product", 'Int'>
    readonly company_id: FieldRef<"Product", 'Int'>
    readonly branch_id: FieldRef<"Product", 'Int'>
    readonly is_active: FieldRef<"Product", 'Boolean'>
    readonly created_at: FieldRef<"Product", 'DateTime'>
    readonly updated_at: FieldRef<"Product", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product updateManyAndReturn
   */
  export type ProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product.billItems
   */
  export type Product$billItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    where?: BillItemWhereInput
    orderBy?: BillItemOrderByWithRelationInput | BillItemOrderByWithRelationInput[]
    cursor?: BillItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BillItemScalarFieldEnum | BillItemScalarFieldEnum[]
  }

  /**
   * Product.branch
   */
  export type Product$branchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Branch
     */
    select?: BranchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Branch
     */
    omit?: BranchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BranchInclude<ExtArgs> | null
    where?: BranchWhereInput
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model Bill
   */

  export type AggregateBill = {
    _count: BillCountAggregateOutputType | null
    _avg: BillAvgAggregateOutputType | null
    _sum: BillSumAggregateOutputType | null
    _min: BillMinAggregateOutputType | null
    _max: BillMaxAggregateOutputType | null
  }

  export type BillAvgAggregateOutputType = {
    id: number | null
    company_id: number | null
    branch_id: number | null
    cashier_id: number | null
    subtotal: Decimal | null
    discount: Decimal | null
    tax: Decimal | null
    total: Decimal | null
  }

  export type BillSumAggregateOutputType = {
    id: number | null
    company_id: number | null
    branch_id: number | null
    cashier_id: number | null
    subtotal: Decimal | null
    discount: Decimal | null
    tax: Decimal | null
    total: Decimal | null
  }

  export type BillMinAggregateOutputType = {
    id: number | null
    bill_number: string | null
    company_id: number | null
    branch_id: number | null
    cashier_id: number | null
    status: $Enums.BillStatus | null
    payment_method: $Enums.PaymentMethod | null
    subtotal: Decimal | null
    discount: Decimal | null
    tax: Decimal | null
    total: Decimal | null
    notes: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type BillMaxAggregateOutputType = {
    id: number | null
    bill_number: string | null
    company_id: number | null
    branch_id: number | null
    cashier_id: number | null
    status: $Enums.BillStatus | null
    payment_method: $Enums.PaymentMethod | null
    subtotal: Decimal | null
    discount: Decimal | null
    tax: Decimal | null
    total: Decimal | null
    notes: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type BillCountAggregateOutputType = {
    id: number
    bill_number: number
    company_id: number
    branch_id: number
    cashier_id: number
    status: number
    payment_method: number
    subtotal: number
    discount: number
    tax: number
    total: number
    notes: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type BillAvgAggregateInputType = {
    id?: true
    company_id?: true
    branch_id?: true
    cashier_id?: true
    subtotal?: true
    discount?: true
    tax?: true
    total?: true
  }

  export type BillSumAggregateInputType = {
    id?: true
    company_id?: true
    branch_id?: true
    cashier_id?: true
    subtotal?: true
    discount?: true
    tax?: true
    total?: true
  }

  export type BillMinAggregateInputType = {
    id?: true
    bill_number?: true
    company_id?: true
    branch_id?: true
    cashier_id?: true
    status?: true
    payment_method?: true
    subtotal?: true
    discount?: true
    tax?: true
    total?: true
    notes?: true
    created_at?: true
    updated_at?: true
  }

  export type BillMaxAggregateInputType = {
    id?: true
    bill_number?: true
    company_id?: true
    branch_id?: true
    cashier_id?: true
    status?: true
    payment_method?: true
    subtotal?: true
    discount?: true
    tax?: true
    total?: true
    notes?: true
    created_at?: true
    updated_at?: true
  }

  export type BillCountAggregateInputType = {
    id?: true
    bill_number?: true
    company_id?: true
    branch_id?: true
    cashier_id?: true
    status?: true
    payment_method?: true
    subtotal?: true
    discount?: true
    tax?: true
    total?: true
    notes?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type BillAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bill to aggregate.
     */
    where?: BillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bills to fetch.
     */
    orderBy?: BillOrderByWithRelationInput | BillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bills
    **/
    _count?: true | BillCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BillAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BillSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BillMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BillMaxAggregateInputType
  }

  export type GetBillAggregateType<T extends BillAggregateArgs> = {
        [P in keyof T & keyof AggregateBill]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBill[P]>
      : GetScalarType<T[P], AggregateBill[P]>
  }




  export type BillGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillWhereInput
    orderBy?: BillOrderByWithAggregationInput | BillOrderByWithAggregationInput[]
    by: BillScalarFieldEnum[] | BillScalarFieldEnum
    having?: BillScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BillCountAggregateInputType | true
    _avg?: BillAvgAggregateInputType
    _sum?: BillSumAggregateInputType
    _min?: BillMinAggregateInputType
    _max?: BillMaxAggregateInputType
  }

  export type BillGroupByOutputType = {
    id: number
    bill_number: string
    company_id: number
    branch_id: number
    cashier_id: number
    status: $Enums.BillStatus
    payment_method: $Enums.PaymentMethod
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal
    notes: string | null
    created_at: Date
    updated_at: Date
    _count: BillCountAggregateOutputType | null
    _avg: BillAvgAggregateOutputType | null
    _sum: BillSumAggregateOutputType | null
    _min: BillMinAggregateOutputType | null
    _max: BillMaxAggregateOutputType | null
  }

  type GetBillGroupByPayload<T extends BillGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BillGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BillGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BillGroupByOutputType[P]>
            : GetScalarType<T[P], BillGroupByOutputType[P]>
        }
      >
    >


  export type BillSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bill_number?: boolean
    company_id?: boolean
    branch_id?: boolean
    cashier_id?: boolean
    status?: boolean
    payment_method?: boolean
    subtotal?: boolean
    discount?: boolean
    tax?: boolean
    total?: boolean
    notes?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | BranchDefaultArgs<ExtArgs>
    cashier?: boolean | UserDefaultArgs<ExtArgs>
    items?: boolean | Bill$itemsArgs<ExtArgs>
    _count?: boolean | BillCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bill"]>

  export type BillSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bill_number?: boolean
    company_id?: boolean
    branch_id?: boolean
    cashier_id?: boolean
    status?: boolean
    payment_method?: boolean
    subtotal?: boolean
    discount?: boolean
    tax?: boolean
    total?: boolean
    notes?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | BranchDefaultArgs<ExtArgs>
    cashier?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bill"]>

  export type BillSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bill_number?: boolean
    company_id?: boolean
    branch_id?: boolean
    cashier_id?: boolean
    status?: boolean
    payment_method?: boolean
    subtotal?: boolean
    discount?: boolean
    tax?: boolean
    total?: boolean
    notes?: boolean
    created_at?: boolean
    updated_at?: boolean
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | BranchDefaultArgs<ExtArgs>
    cashier?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bill"]>

  export type BillSelectScalar = {
    id?: boolean
    bill_number?: boolean
    company_id?: boolean
    branch_id?: boolean
    cashier_id?: boolean
    status?: boolean
    payment_method?: boolean
    subtotal?: boolean
    discount?: boolean
    tax?: boolean
    total?: boolean
    notes?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type BillOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bill_number" | "company_id" | "branch_id" | "cashier_id" | "status" | "payment_method" | "subtotal" | "discount" | "tax" | "total" | "notes" | "created_at" | "updated_at", ExtArgs["result"]["bill"]>
  export type BillInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | BranchDefaultArgs<ExtArgs>
    cashier?: boolean | UserDefaultArgs<ExtArgs>
    items?: boolean | Bill$itemsArgs<ExtArgs>
    _count?: boolean | BillCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BillIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | BranchDefaultArgs<ExtArgs>
    cashier?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BillIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | CompanyDefaultArgs<ExtArgs>
    branch?: boolean | BranchDefaultArgs<ExtArgs>
    cashier?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $BillPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bill"
    objects: {
      company: Prisma.$CompanyPayload<ExtArgs>
      branch: Prisma.$BranchPayload<ExtArgs>
      cashier: Prisma.$UserPayload<ExtArgs>
      items: Prisma.$BillItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      bill_number: string
      company_id: number
      branch_id: number
      cashier_id: number
      status: $Enums.BillStatus
      payment_method: $Enums.PaymentMethod
      subtotal: Prisma.Decimal
      discount: Prisma.Decimal
      tax: Prisma.Decimal
      total: Prisma.Decimal
      notes: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["bill"]>
    composites: {}
  }

  type BillGetPayload<S extends boolean | null | undefined | BillDefaultArgs> = $Result.GetResult<Prisma.$BillPayload, S>

  type BillCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BillFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BillCountAggregateInputType | true
    }

  export interface BillDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bill'], meta: { name: 'Bill' } }
    /**
     * Find zero or one Bill that matches the filter.
     * @param {BillFindUniqueArgs} args - Arguments to find a Bill
     * @example
     * // Get one Bill
     * const bill = await prisma.bill.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BillFindUniqueArgs>(args: SelectSubset<T, BillFindUniqueArgs<ExtArgs>>): Prisma__BillClient<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Bill that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BillFindUniqueOrThrowArgs} args - Arguments to find a Bill
     * @example
     * // Get one Bill
     * const bill = await prisma.bill.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BillFindUniqueOrThrowArgs>(args: SelectSubset<T, BillFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BillClient<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bill that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillFindFirstArgs} args - Arguments to find a Bill
     * @example
     * // Get one Bill
     * const bill = await prisma.bill.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BillFindFirstArgs>(args?: SelectSubset<T, BillFindFirstArgs<ExtArgs>>): Prisma__BillClient<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bill that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillFindFirstOrThrowArgs} args - Arguments to find a Bill
     * @example
     * // Get one Bill
     * const bill = await prisma.bill.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BillFindFirstOrThrowArgs>(args?: SelectSubset<T, BillFindFirstOrThrowArgs<ExtArgs>>): Prisma__BillClient<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bills that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bills
     * const bills = await prisma.bill.findMany()
     * 
     * // Get first 10 Bills
     * const bills = await prisma.bill.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const billWithIdOnly = await prisma.bill.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BillFindManyArgs>(args?: SelectSubset<T, BillFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Bill.
     * @param {BillCreateArgs} args - Arguments to create a Bill.
     * @example
     * // Create one Bill
     * const Bill = await prisma.bill.create({
     *   data: {
     *     // ... data to create a Bill
     *   }
     * })
     * 
     */
    create<T extends BillCreateArgs>(args: SelectSubset<T, BillCreateArgs<ExtArgs>>): Prisma__BillClient<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Bills.
     * @param {BillCreateManyArgs} args - Arguments to create many Bills.
     * @example
     * // Create many Bills
     * const bill = await prisma.bill.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BillCreateManyArgs>(args?: SelectSubset<T, BillCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bills and returns the data saved in the database.
     * @param {BillCreateManyAndReturnArgs} args - Arguments to create many Bills.
     * @example
     * // Create many Bills
     * const bill = await prisma.bill.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bills and only return the `id`
     * const billWithIdOnly = await prisma.bill.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BillCreateManyAndReturnArgs>(args?: SelectSubset<T, BillCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Bill.
     * @param {BillDeleteArgs} args - Arguments to delete one Bill.
     * @example
     * // Delete one Bill
     * const Bill = await prisma.bill.delete({
     *   where: {
     *     // ... filter to delete one Bill
     *   }
     * })
     * 
     */
    delete<T extends BillDeleteArgs>(args: SelectSubset<T, BillDeleteArgs<ExtArgs>>): Prisma__BillClient<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Bill.
     * @param {BillUpdateArgs} args - Arguments to update one Bill.
     * @example
     * // Update one Bill
     * const bill = await prisma.bill.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BillUpdateArgs>(args: SelectSubset<T, BillUpdateArgs<ExtArgs>>): Prisma__BillClient<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Bills.
     * @param {BillDeleteManyArgs} args - Arguments to filter Bills to delete.
     * @example
     * // Delete a few Bills
     * const { count } = await prisma.bill.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BillDeleteManyArgs>(args?: SelectSubset<T, BillDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bills
     * const bill = await prisma.bill.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BillUpdateManyArgs>(args: SelectSubset<T, BillUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bills and returns the data updated in the database.
     * @param {BillUpdateManyAndReturnArgs} args - Arguments to update many Bills.
     * @example
     * // Update many Bills
     * const bill = await prisma.bill.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Bills and only return the `id`
     * const billWithIdOnly = await prisma.bill.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BillUpdateManyAndReturnArgs>(args: SelectSubset<T, BillUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Bill.
     * @param {BillUpsertArgs} args - Arguments to update or create a Bill.
     * @example
     * // Update or create a Bill
     * const bill = await prisma.bill.upsert({
     *   create: {
     *     // ... data to create a Bill
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bill we want to update
     *   }
     * })
     */
    upsert<T extends BillUpsertArgs>(args: SelectSubset<T, BillUpsertArgs<ExtArgs>>): Prisma__BillClient<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Bills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillCountArgs} args - Arguments to filter Bills to count.
     * @example
     * // Count the number of Bills
     * const count = await prisma.bill.count({
     *   where: {
     *     // ... the filter for the Bills we want to count
     *   }
     * })
    **/
    count<T extends BillCountArgs>(
      args?: Subset<T, BillCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BillCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BillAggregateArgs>(args: Subset<T, BillAggregateArgs>): Prisma.PrismaPromise<GetBillAggregateType<T>>

    /**
     * Group by Bill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BillGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BillGroupByArgs['orderBy'] }
        : { orderBy?: BillGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BillGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBillGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bill model
   */
  readonly fields: BillFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bill.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BillClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    branch<T extends BranchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BranchDefaultArgs<ExtArgs>>): Prisma__BranchClient<$Result.GetResult<Prisma.$BranchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    cashier<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    items<T extends Bill$itemsArgs<ExtArgs> = {}>(args?: Subset<T, Bill$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bill model
   */
  interface BillFieldRefs {
    readonly id: FieldRef<"Bill", 'Int'>
    readonly bill_number: FieldRef<"Bill", 'String'>
    readonly company_id: FieldRef<"Bill", 'Int'>
    readonly branch_id: FieldRef<"Bill", 'Int'>
    readonly cashier_id: FieldRef<"Bill", 'Int'>
    readonly status: FieldRef<"Bill", 'BillStatus'>
    readonly payment_method: FieldRef<"Bill", 'PaymentMethod'>
    readonly subtotal: FieldRef<"Bill", 'Decimal'>
    readonly discount: FieldRef<"Bill", 'Decimal'>
    readonly tax: FieldRef<"Bill", 'Decimal'>
    readonly total: FieldRef<"Bill", 'Decimal'>
    readonly notes: FieldRef<"Bill", 'String'>
    readonly created_at: FieldRef<"Bill", 'DateTime'>
    readonly updated_at: FieldRef<"Bill", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Bill findUnique
   */
  export type BillFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    /**
     * Filter, which Bill to fetch.
     */
    where: BillWhereUniqueInput
  }

  /**
   * Bill findUniqueOrThrow
   */
  export type BillFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    /**
     * Filter, which Bill to fetch.
     */
    where: BillWhereUniqueInput
  }

  /**
   * Bill findFirst
   */
  export type BillFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    /**
     * Filter, which Bill to fetch.
     */
    where?: BillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bills to fetch.
     */
    orderBy?: BillOrderByWithRelationInput | BillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bills.
     */
    cursor?: BillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bills.
     */
    distinct?: BillScalarFieldEnum | BillScalarFieldEnum[]
  }

  /**
   * Bill findFirstOrThrow
   */
  export type BillFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    /**
     * Filter, which Bill to fetch.
     */
    where?: BillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bills to fetch.
     */
    orderBy?: BillOrderByWithRelationInput | BillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bills.
     */
    cursor?: BillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bills.
     */
    distinct?: BillScalarFieldEnum | BillScalarFieldEnum[]
  }

  /**
   * Bill findMany
   */
  export type BillFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    /**
     * Filter, which Bills to fetch.
     */
    where?: BillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bills to fetch.
     */
    orderBy?: BillOrderByWithRelationInput | BillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bills.
     */
    cursor?: BillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bills.
     */
    skip?: number
    distinct?: BillScalarFieldEnum | BillScalarFieldEnum[]
  }

  /**
   * Bill create
   */
  export type BillCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    /**
     * The data needed to create a Bill.
     */
    data: XOR<BillCreateInput, BillUncheckedCreateInput>
  }

  /**
   * Bill createMany
   */
  export type BillCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bills.
     */
    data: BillCreateManyInput | BillCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bill createManyAndReturn
   */
  export type BillCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * The data used to create many Bills.
     */
    data: BillCreateManyInput | BillCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bill update
   */
  export type BillUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    /**
     * The data needed to update a Bill.
     */
    data: XOR<BillUpdateInput, BillUncheckedUpdateInput>
    /**
     * Choose, which Bill to update.
     */
    where: BillWhereUniqueInput
  }

  /**
   * Bill updateMany
   */
  export type BillUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bills.
     */
    data: XOR<BillUpdateManyMutationInput, BillUncheckedUpdateManyInput>
    /**
     * Filter which Bills to update
     */
    where?: BillWhereInput
    /**
     * Limit how many Bills to update.
     */
    limit?: number
  }

  /**
   * Bill updateManyAndReturn
   */
  export type BillUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * The data used to update Bills.
     */
    data: XOR<BillUpdateManyMutationInput, BillUncheckedUpdateManyInput>
    /**
     * Filter which Bills to update
     */
    where?: BillWhereInput
    /**
     * Limit how many Bills to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bill upsert
   */
  export type BillUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    /**
     * The filter to search for the Bill to update in case it exists.
     */
    where: BillWhereUniqueInput
    /**
     * In case the Bill found by the `where` argument doesn't exist, create a new Bill with this data.
     */
    create: XOR<BillCreateInput, BillUncheckedCreateInput>
    /**
     * In case the Bill was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BillUpdateInput, BillUncheckedUpdateInput>
  }

  /**
   * Bill delete
   */
  export type BillDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
    /**
     * Filter which Bill to delete.
     */
    where: BillWhereUniqueInput
  }

  /**
   * Bill deleteMany
   */
  export type BillDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bills to delete
     */
    where?: BillWhereInput
    /**
     * Limit how many Bills to delete.
     */
    limit?: number
  }

  /**
   * Bill.items
   */
  export type Bill$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    where?: BillItemWhereInput
    orderBy?: BillItemOrderByWithRelationInput | BillItemOrderByWithRelationInput[]
    cursor?: BillItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BillItemScalarFieldEnum | BillItemScalarFieldEnum[]
  }

  /**
   * Bill without action
   */
  export type BillDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bill
     */
    select?: BillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bill
     */
    omit?: BillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillInclude<ExtArgs> | null
  }


  /**
   * Model BillItem
   */

  export type AggregateBillItem = {
    _count: BillItemCountAggregateOutputType | null
    _avg: BillItemAvgAggregateOutputType | null
    _sum: BillItemSumAggregateOutputType | null
    _min: BillItemMinAggregateOutputType | null
    _max: BillItemMaxAggregateOutputType | null
  }

  export type BillItemAvgAggregateOutputType = {
    id: number | null
    bill_id: number | null
    product_id: number | null
    quantity: number | null
    unit_price: Decimal | null
    total: Decimal | null
  }

  export type BillItemSumAggregateOutputType = {
    id: number | null
    bill_id: number | null
    product_id: number | null
    quantity: number | null
    unit_price: Decimal | null
    total: Decimal | null
  }

  export type BillItemMinAggregateOutputType = {
    id: number | null
    bill_id: number | null
    product_id: number | null
    quantity: number | null
    unit_price: Decimal | null
    total: Decimal | null
  }

  export type BillItemMaxAggregateOutputType = {
    id: number | null
    bill_id: number | null
    product_id: number | null
    quantity: number | null
    unit_price: Decimal | null
    total: Decimal | null
  }

  export type BillItemCountAggregateOutputType = {
    id: number
    bill_id: number
    product_id: number
    quantity: number
    unit_price: number
    total: number
    _all: number
  }


  export type BillItemAvgAggregateInputType = {
    id?: true
    bill_id?: true
    product_id?: true
    quantity?: true
    unit_price?: true
    total?: true
  }

  export type BillItemSumAggregateInputType = {
    id?: true
    bill_id?: true
    product_id?: true
    quantity?: true
    unit_price?: true
    total?: true
  }

  export type BillItemMinAggregateInputType = {
    id?: true
    bill_id?: true
    product_id?: true
    quantity?: true
    unit_price?: true
    total?: true
  }

  export type BillItemMaxAggregateInputType = {
    id?: true
    bill_id?: true
    product_id?: true
    quantity?: true
    unit_price?: true
    total?: true
  }

  export type BillItemCountAggregateInputType = {
    id?: true
    bill_id?: true
    product_id?: true
    quantity?: true
    unit_price?: true
    total?: true
    _all?: true
  }

  export type BillItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BillItem to aggregate.
     */
    where?: BillItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BillItems to fetch.
     */
    orderBy?: BillItemOrderByWithRelationInput | BillItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BillItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BillItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BillItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BillItems
    **/
    _count?: true | BillItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BillItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BillItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BillItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BillItemMaxAggregateInputType
  }

  export type GetBillItemAggregateType<T extends BillItemAggregateArgs> = {
        [P in keyof T & keyof AggregateBillItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBillItem[P]>
      : GetScalarType<T[P], AggregateBillItem[P]>
  }




  export type BillItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BillItemWhereInput
    orderBy?: BillItemOrderByWithAggregationInput | BillItemOrderByWithAggregationInput[]
    by: BillItemScalarFieldEnum[] | BillItemScalarFieldEnum
    having?: BillItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BillItemCountAggregateInputType | true
    _avg?: BillItemAvgAggregateInputType
    _sum?: BillItemSumAggregateInputType
    _min?: BillItemMinAggregateInputType
    _max?: BillItemMaxAggregateInputType
  }

  export type BillItemGroupByOutputType = {
    id: number
    bill_id: number
    product_id: number
    quantity: number
    unit_price: Decimal
    total: Decimal
    _count: BillItemCountAggregateOutputType | null
    _avg: BillItemAvgAggregateOutputType | null
    _sum: BillItemSumAggregateOutputType | null
    _min: BillItemMinAggregateOutputType | null
    _max: BillItemMaxAggregateOutputType | null
  }

  type GetBillItemGroupByPayload<T extends BillItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BillItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BillItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BillItemGroupByOutputType[P]>
            : GetScalarType<T[P], BillItemGroupByOutputType[P]>
        }
      >
    >


  export type BillItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bill_id?: boolean
    product_id?: boolean
    quantity?: boolean
    unit_price?: boolean
    total?: boolean
    bill?: boolean | BillDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["billItem"]>

  export type BillItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bill_id?: boolean
    product_id?: boolean
    quantity?: boolean
    unit_price?: boolean
    total?: boolean
    bill?: boolean | BillDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["billItem"]>

  export type BillItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bill_id?: boolean
    product_id?: boolean
    quantity?: boolean
    unit_price?: boolean
    total?: boolean
    bill?: boolean | BillDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["billItem"]>

  export type BillItemSelectScalar = {
    id?: boolean
    bill_id?: boolean
    product_id?: boolean
    quantity?: boolean
    unit_price?: boolean
    total?: boolean
  }

  export type BillItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bill_id" | "product_id" | "quantity" | "unit_price" | "total", ExtArgs["result"]["billItem"]>
  export type BillItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bill?: boolean | BillDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type BillItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bill?: boolean | BillDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type BillItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bill?: boolean | BillDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $BillItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BillItem"
    objects: {
      bill: Prisma.$BillPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      bill_id: number
      product_id: number
      quantity: number
      unit_price: Prisma.Decimal
      total: Prisma.Decimal
    }, ExtArgs["result"]["billItem"]>
    composites: {}
  }

  type BillItemGetPayload<S extends boolean | null | undefined | BillItemDefaultArgs> = $Result.GetResult<Prisma.$BillItemPayload, S>

  type BillItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BillItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BillItemCountAggregateInputType | true
    }

  export interface BillItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BillItem'], meta: { name: 'BillItem' } }
    /**
     * Find zero or one BillItem that matches the filter.
     * @param {BillItemFindUniqueArgs} args - Arguments to find a BillItem
     * @example
     * // Get one BillItem
     * const billItem = await prisma.billItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BillItemFindUniqueArgs>(args: SelectSubset<T, BillItemFindUniqueArgs<ExtArgs>>): Prisma__BillItemClient<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BillItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BillItemFindUniqueOrThrowArgs} args - Arguments to find a BillItem
     * @example
     * // Get one BillItem
     * const billItem = await prisma.billItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BillItemFindUniqueOrThrowArgs>(args: SelectSubset<T, BillItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BillItemClient<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BillItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillItemFindFirstArgs} args - Arguments to find a BillItem
     * @example
     * // Get one BillItem
     * const billItem = await prisma.billItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BillItemFindFirstArgs>(args?: SelectSubset<T, BillItemFindFirstArgs<ExtArgs>>): Prisma__BillItemClient<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BillItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillItemFindFirstOrThrowArgs} args - Arguments to find a BillItem
     * @example
     * // Get one BillItem
     * const billItem = await prisma.billItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BillItemFindFirstOrThrowArgs>(args?: SelectSubset<T, BillItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__BillItemClient<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BillItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BillItems
     * const billItems = await prisma.billItem.findMany()
     * 
     * // Get first 10 BillItems
     * const billItems = await prisma.billItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const billItemWithIdOnly = await prisma.billItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BillItemFindManyArgs>(args?: SelectSubset<T, BillItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BillItem.
     * @param {BillItemCreateArgs} args - Arguments to create a BillItem.
     * @example
     * // Create one BillItem
     * const BillItem = await prisma.billItem.create({
     *   data: {
     *     // ... data to create a BillItem
     *   }
     * })
     * 
     */
    create<T extends BillItemCreateArgs>(args: SelectSubset<T, BillItemCreateArgs<ExtArgs>>): Prisma__BillItemClient<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BillItems.
     * @param {BillItemCreateManyArgs} args - Arguments to create many BillItems.
     * @example
     * // Create many BillItems
     * const billItem = await prisma.billItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BillItemCreateManyArgs>(args?: SelectSubset<T, BillItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BillItems and returns the data saved in the database.
     * @param {BillItemCreateManyAndReturnArgs} args - Arguments to create many BillItems.
     * @example
     * // Create many BillItems
     * const billItem = await prisma.billItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BillItems and only return the `id`
     * const billItemWithIdOnly = await prisma.billItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BillItemCreateManyAndReturnArgs>(args?: SelectSubset<T, BillItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BillItem.
     * @param {BillItemDeleteArgs} args - Arguments to delete one BillItem.
     * @example
     * // Delete one BillItem
     * const BillItem = await prisma.billItem.delete({
     *   where: {
     *     // ... filter to delete one BillItem
     *   }
     * })
     * 
     */
    delete<T extends BillItemDeleteArgs>(args: SelectSubset<T, BillItemDeleteArgs<ExtArgs>>): Prisma__BillItemClient<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BillItem.
     * @param {BillItemUpdateArgs} args - Arguments to update one BillItem.
     * @example
     * // Update one BillItem
     * const billItem = await prisma.billItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BillItemUpdateArgs>(args: SelectSubset<T, BillItemUpdateArgs<ExtArgs>>): Prisma__BillItemClient<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BillItems.
     * @param {BillItemDeleteManyArgs} args - Arguments to filter BillItems to delete.
     * @example
     * // Delete a few BillItems
     * const { count } = await prisma.billItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BillItemDeleteManyArgs>(args?: SelectSubset<T, BillItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BillItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BillItems
     * const billItem = await prisma.billItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BillItemUpdateManyArgs>(args: SelectSubset<T, BillItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BillItems and returns the data updated in the database.
     * @param {BillItemUpdateManyAndReturnArgs} args - Arguments to update many BillItems.
     * @example
     * // Update many BillItems
     * const billItem = await prisma.billItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BillItems and only return the `id`
     * const billItemWithIdOnly = await prisma.billItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BillItemUpdateManyAndReturnArgs>(args: SelectSubset<T, BillItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BillItem.
     * @param {BillItemUpsertArgs} args - Arguments to update or create a BillItem.
     * @example
     * // Update or create a BillItem
     * const billItem = await prisma.billItem.upsert({
     *   create: {
     *     // ... data to create a BillItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BillItem we want to update
     *   }
     * })
     */
    upsert<T extends BillItemUpsertArgs>(args: SelectSubset<T, BillItemUpsertArgs<ExtArgs>>): Prisma__BillItemClient<$Result.GetResult<Prisma.$BillItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BillItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillItemCountArgs} args - Arguments to filter BillItems to count.
     * @example
     * // Count the number of BillItems
     * const count = await prisma.billItem.count({
     *   where: {
     *     // ... the filter for the BillItems we want to count
     *   }
     * })
    **/
    count<T extends BillItemCountArgs>(
      args?: Subset<T, BillItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BillItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BillItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BillItemAggregateArgs>(args: Subset<T, BillItemAggregateArgs>): Prisma.PrismaPromise<GetBillItemAggregateType<T>>

    /**
     * Group by BillItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BillItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BillItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BillItemGroupByArgs['orderBy'] }
        : { orderBy?: BillItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BillItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBillItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BillItem model
   */
  readonly fields: BillItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BillItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BillItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bill<T extends BillDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BillDefaultArgs<ExtArgs>>): Prisma__BillClient<$Result.GetResult<Prisma.$BillPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BillItem model
   */
  interface BillItemFieldRefs {
    readonly id: FieldRef<"BillItem", 'Int'>
    readonly bill_id: FieldRef<"BillItem", 'Int'>
    readonly product_id: FieldRef<"BillItem", 'Int'>
    readonly quantity: FieldRef<"BillItem", 'Int'>
    readonly unit_price: FieldRef<"BillItem", 'Decimal'>
    readonly total: FieldRef<"BillItem", 'Decimal'>
  }
    

  // Custom InputTypes
  /**
   * BillItem findUnique
   */
  export type BillItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    /**
     * Filter, which BillItem to fetch.
     */
    where: BillItemWhereUniqueInput
  }

  /**
   * BillItem findUniqueOrThrow
   */
  export type BillItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    /**
     * Filter, which BillItem to fetch.
     */
    where: BillItemWhereUniqueInput
  }

  /**
   * BillItem findFirst
   */
  export type BillItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    /**
     * Filter, which BillItem to fetch.
     */
    where?: BillItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BillItems to fetch.
     */
    orderBy?: BillItemOrderByWithRelationInput | BillItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BillItems.
     */
    cursor?: BillItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BillItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BillItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BillItems.
     */
    distinct?: BillItemScalarFieldEnum | BillItemScalarFieldEnum[]
  }

  /**
   * BillItem findFirstOrThrow
   */
  export type BillItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    /**
     * Filter, which BillItem to fetch.
     */
    where?: BillItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BillItems to fetch.
     */
    orderBy?: BillItemOrderByWithRelationInput | BillItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BillItems.
     */
    cursor?: BillItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BillItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BillItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BillItems.
     */
    distinct?: BillItemScalarFieldEnum | BillItemScalarFieldEnum[]
  }

  /**
   * BillItem findMany
   */
  export type BillItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    /**
     * Filter, which BillItems to fetch.
     */
    where?: BillItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BillItems to fetch.
     */
    orderBy?: BillItemOrderByWithRelationInput | BillItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BillItems.
     */
    cursor?: BillItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BillItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BillItems.
     */
    skip?: number
    distinct?: BillItemScalarFieldEnum | BillItemScalarFieldEnum[]
  }

  /**
   * BillItem create
   */
  export type BillItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    /**
     * The data needed to create a BillItem.
     */
    data: XOR<BillItemCreateInput, BillItemUncheckedCreateInput>
  }

  /**
   * BillItem createMany
   */
  export type BillItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BillItems.
     */
    data: BillItemCreateManyInput | BillItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BillItem createManyAndReturn
   */
  export type BillItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * The data used to create many BillItems.
     */
    data: BillItemCreateManyInput | BillItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BillItem update
   */
  export type BillItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    /**
     * The data needed to update a BillItem.
     */
    data: XOR<BillItemUpdateInput, BillItemUncheckedUpdateInput>
    /**
     * Choose, which BillItem to update.
     */
    where: BillItemWhereUniqueInput
  }

  /**
   * BillItem updateMany
   */
  export type BillItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BillItems.
     */
    data: XOR<BillItemUpdateManyMutationInput, BillItemUncheckedUpdateManyInput>
    /**
     * Filter which BillItems to update
     */
    where?: BillItemWhereInput
    /**
     * Limit how many BillItems to update.
     */
    limit?: number
  }

  /**
   * BillItem updateManyAndReturn
   */
  export type BillItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * The data used to update BillItems.
     */
    data: XOR<BillItemUpdateManyMutationInput, BillItemUncheckedUpdateManyInput>
    /**
     * Filter which BillItems to update
     */
    where?: BillItemWhereInput
    /**
     * Limit how many BillItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BillItem upsert
   */
  export type BillItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    /**
     * The filter to search for the BillItem to update in case it exists.
     */
    where: BillItemWhereUniqueInput
    /**
     * In case the BillItem found by the `where` argument doesn't exist, create a new BillItem with this data.
     */
    create: XOR<BillItemCreateInput, BillItemUncheckedCreateInput>
    /**
     * In case the BillItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BillItemUpdateInput, BillItemUncheckedUpdateInput>
  }

  /**
   * BillItem delete
   */
  export type BillItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
    /**
     * Filter which BillItem to delete.
     */
    where: BillItemWhereUniqueInput
  }

  /**
   * BillItem deleteMany
   */
  export type BillItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BillItems to delete
     */
    where?: BillItemWhereInput
    /**
     * Limit how many BillItems to delete.
     */
    limit?: number
  }

  /**
   * BillItem without action
   */
  export type BillItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BillItem
     */
    select?: BillItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BillItem
     */
    omit?: BillItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BillItemInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CompanyScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    email: 'email',
    phone: 'phone',
    address: 'address',
    is_active: 'is_active',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type CompanyScalarFieldEnum = (typeof CompanyScalarFieldEnum)[keyof typeof CompanyScalarFieldEnum]


  export const BranchScalarFieldEnum: {
    id: 'id',
    company_id: 'company_id',
    name: 'name',
    code: 'code',
    address: 'address',
    phone: 'phone',
    email: 'email',
    is_active: 'is_active',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type BranchScalarFieldEnum = (typeof BranchScalarFieldEnum)[keyof typeof BranchScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    password: 'password',
    company_id: 'company_id',
    branch_id: 'branch_id',
    user_type: 'user_type',
    status: 'status',
    failed_login_attempts: 'failed_login_attempts',
    last_failed_login: 'last_failed_login',
    account_locked_until: 'account_locked_until',
    last_login_at: 'last_login_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const UserInfoScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    phone_number: 'phone_number',
    address: 'address',
    profile_picture: 'profile_picture'
  };

  export type UserInfoScalarFieldEnum = (typeof UserInfoScalarFieldEnum)[keyof typeof UserInfoScalarFieldEnum]


  export const RoleScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description'
  };

  export type RoleScalarFieldEnum = (typeof RoleScalarFieldEnum)[keyof typeof RoleScalarFieldEnum]


  export const AuthorityScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description'
  };

  export type AuthorityScalarFieldEnum = (typeof AuthorityScalarFieldEnum)[keyof typeof AuthorityScalarFieldEnum]


  export const UserRoleScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    roleId: 'roleId'
  };

  export type UserRoleScalarFieldEnum = (typeof UserRoleScalarFieldEnum)[keyof typeof UserRoleScalarFieldEnum]


  export const RoleAuthorityScalarFieldEnum: {
    id: 'id',
    roleId: 'roleId',
    authorityId: 'authorityId'
  };

  export type RoleAuthorityScalarFieldEnum = (typeof RoleAuthorityScalarFieldEnum)[keyof typeof RoleAuthorityScalarFieldEnum]


  export const UserLogScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    branch_id: 'branch_id',
    action: 'action',
    status: 'status',
    ip_address: 'ip_address',
    user_agent: 'user_agent',
    device_info: 'device_info',
    created_at: 'created_at'
  };

  export type UserLogScalarFieldEnum = (typeof UserLogScalarFieldEnum)[keyof typeof UserLogScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    description: 'description',
    price: 'price',
    cost_price: 'cost_price',
    quantity: 'quantity',
    min_quantity: 'min_quantity',
    company_id: 'company_id',
    branch_id: 'branch_id',
    is_active: 'is_active',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const BillScalarFieldEnum: {
    id: 'id',
    bill_number: 'bill_number',
    company_id: 'company_id',
    branch_id: 'branch_id',
    cashier_id: 'cashier_id',
    status: 'status',
    payment_method: 'payment_method',
    subtotal: 'subtotal',
    discount: 'discount',
    tax: 'tax',
    total: 'total',
    notes: 'notes',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type BillScalarFieldEnum = (typeof BillScalarFieldEnum)[keyof typeof BillScalarFieldEnum]


  export const BillItemScalarFieldEnum: {
    id: 'id',
    bill_id: 'bill_id',
    product_id: 'product_id',
    quantity: 'quantity',
    unit_price: 'unit_price',
    total: 'total'
  };

  export type BillItemScalarFieldEnum = (typeof BillItemScalarFieldEnum)[keyof typeof BillItemScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'UserType'
   */
  export type EnumUserTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserType'>
    


  /**
   * Reference to a field of type 'UserType[]'
   */
  export type ListEnumUserTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserType[]'>
    


  /**
   * Reference to a field of type 'UserStatus'
   */
  export type EnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus'>
    


  /**
   * Reference to a field of type 'UserStatus[]'
   */
  export type ListEnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus[]'>
    


  /**
   * Reference to a field of type 'LogAction'
   */
  export type EnumLogActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LogAction'>
    


  /**
   * Reference to a field of type 'LogAction[]'
   */
  export type ListEnumLogActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LogAction[]'>
    


  /**
   * Reference to a field of type 'LogStatus'
   */
  export type EnumLogStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LogStatus'>
    


  /**
   * Reference to a field of type 'LogStatus[]'
   */
  export type ListEnumLogStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LogStatus[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'BillStatus'
   */
  export type EnumBillStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BillStatus'>
    


  /**
   * Reference to a field of type 'BillStatus[]'
   */
  export type ListEnumBillStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BillStatus[]'>
    


  /**
   * Reference to a field of type 'PaymentMethod'
   */
  export type EnumPaymentMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentMethod'>
    


  /**
   * Reference to a field of type 'PaymentMethod[]'
   */
  export type ListEnumPaymentMethodFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentMethod[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CompanyWhereInput = {
    AND?: CompanyWhereInput | CompanyWhereInput[]
    OR?: CompanyWhereInput[]
    NOT?: CompanyWhereInput | CompanyWhereInput[]
    id?: IntFilter<"Company"> | number
    name?: StringFilter<"Company"> | string
    code?: StringFilter<"Company"> | string
    email?: StringNullableFilter<"Company"> | string | null
    phone?: StringNullableFilter<"Company"> | string | null
    address?: StringNullableFilter<"Company"> | string | null
    is_active?: BoolFilter<"Company"> | boolean
    created_at?: DateTimeFilter<"Company"> | Date | string
    updated_at?: DateTimeFilter<"Company"> | Date | string
    branches?: BranchListRelationFilter
    users?: UserListRelationFilter
    products?: ProductListRelationFilter
    bills?: BillListRelationFilter
  }

  export type CompanyOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    email?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    branches?: BranchOrderByRelationAggregateInput
    users?: UserOrderByRelationAggregateInput
    products?: ProductOrderByRelationAggregateInput
    bills?: BillOrderByRelationAggregateInput
  }

  export type CompanyWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    code?: string
    AND?: CompanyWhereInput | CompanyWhereInput[]
    OR?: CompanyWhereInput[]
    NOT?: CompanyWhereInput | CompanyWhereInput[]
    name?: StringFilter<"Company"> | string
    email?: StringNullableFilter<"Company"> | string | null
    phone?: StringNullableFilter<"Company"> | string | null
    address?: StringNullableFilter<"Company"> | string | null
    is_active?: BoolFilter<"Company"> | boolean
    created_at?: DateTimeFilter<"Company"> | Date | string
    updated_at?: DateTimeFilter<"Company"> | Date | string
    branches?: BranchListRelationFilter
    users?: UserListRelationFilter
    products?: ProductListRelationFilter
    bills?: BillListRelationFilter
  }, "id" | "code">

  export type CompanyOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    email?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: CompanyCountOrderByAggregateInput
    _avg?: CompanyAvgOrderByAggregateInput
    _max?: CompanyMaxOrderByAggregateInput
    _min?: CompanyMinOrderByAggregateInput
    _sum?: CompanySumOrderByAggregateInput
  }

  export type CompanyScalarWhereWithAggregatesInput = {
    AND?: CompanyScalarWhereWithAggregatesInput | CompanyScalarWhereWithAggregatesInput[]
    OR?: CompanyScalarWhereWithAggregatesInput[]
    NOT?: CompanyScalarWhereWithAggregatesInput | CompanyScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Company"> | number
    name?: StringWithAggregatesFilter<"Company"> | string
    code?: StringWithAggregatesFilter<"Company"> | string
    email?: StringNullableWithAggregatesFilter<"Company"> | string | null
    phone?: StringNullableWithAggregatesFilter<"Company"> | string | null
    address?: StringNullableWithAggregatesFilter<"Company"> | string | null
    is_active?: BoolWithAggregatesFilter<"Company"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"Company"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Company"> | Date | string
  }

  export type BranchWhereInput = {
    AND?: BranchWhereInput | BranchWhereInput[]
    OR?: BranchWhereInput[]
    NOT?: BranchWhereInput | BranchWhereInput[]
    id?: IntFilter<"Branch"> | number
    company_id?: IntFilter<"Branch"> | number
    name?: StringFilter<"Branch"> | string
    code?: StringFilter<"Branch"> | string
    address?: StringNullableFilter<"Branch"> | string | null
    phone?: StringNullableFilter<"Branch"> | string | null
    email?: StringNullableFilter<"Branch"> | string | null
    is_active?: BoolFilter<"Branch"> | boolean
    created_at?: DateTimeFilter<"Branch"> | Date | string
    updated_at?: DateTimeFilter<"Branch"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    users?: UserListRelationFilter
    logs?: UserLogListRelationFilter
    products?: ProductListRelationFilter
    bills?: BillListRelationFilter
  }

  export type BranchOrderByWithRelationInput = {
    id?: SortOrder
    company_id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    company?: CompanyOrderByWithRelationInput
    users?: UserOrderByRelationAggregateInput
    logs?: UserLogOrderByRelationAggregateInput
    products?: ProductOrderByRelationAggregateInput
    bills?: BillOrderByRelationAggregateInput
  }

  export type BranchWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    company_id_code?: BranchCompany_idCodeCompoundUniqueInput
    AND?: BranchWhereInput | BranchWhereInput[]
    OR?: BranchWhereInput[]
    NOT?: BranchWhereInput | BranchWhereInput[]
    company_id?: IntFilter<"Branch"> | number
    name?: StringFilter<"Branch"> | string
    code?: StringFilter<"Branch"> | string
    address?: StringNullableFilter<"Branch"> | string | null
    phone?: StringNullableFilter<"Branch"> | string | null
    email?: StringNullableFilter<"Branch"> | string | null
    is_active?: BoolFilter<"Branch"> | boolean
    created_at?: DateTimeFilter<"Branch"> | Date | string
    updated_at?: DateTimeFilter<"Branch"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    users?: UserListRelationFilter
    logs?: UserLogListRelationFilter
    products?: ProductListRelationFilter
    bills?: BillListRelationFilter
  }, "id" | "company_id_code">

  export type BranchOrderByWithAggregationInput = {
    id?: SortOrder
    company_id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: BranchCountOrderByAggregateInput
    _avg?: BranchAvgOrderByAggregateInput
    _max?: BranchMaxOrderByAggregateInput
    _min?: BranchMinOrderByAggregateInput
    _sum?: BranchSumOrderByAggregateInput
  }

  export type BranchScalarWhereWithAggregatesInput = {
    AND?: BranchScalarWhereWithAggregatesInput | BranchScalarWhereWithAggregatesInput[]
    OR?: BranchScalarWhereWithAggregatesInput[]
    NOT?: BranchScalarWhereWithAggregatesInput | BranchScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Branch"> | number
    company_id?: IntWithAggregatesFilter<"Branch"> | number
    name?: StringWithAggregatesFilter<"Branch"> | string
    code?: StringWithAggregatesFilter<"Branch"> | string
    address?: StringNullableWithAggregatesFilter<"Branch"> | string | null
    phone?: StringNullableWithAggregatesFilter<"Branch"> | string | null
    email?: StringNullableWithAggregatesFilter<"Branch"> | string | null
    is_active?: BoolWithAggregatesFilter<"Branch"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"Branch"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Branch"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    company_id?: IntFilter<"User"> | number
    branch_id?: IntNullableFilter<"User"> | number | null
    user_type?: EnumUserTypeFilter<"User"> | $Enums.UserType
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    failed_login_attempts?: IntFilter<"User"> | number
    last_failed_login?: DateTimeNullableFilter<"User"> | Date | string | null
    account_locked_until?: DateTimeNullableFilter<"User"> | Date | string | null
    last_login_at?: DateTimeNullableFilter<"User"> | Date | string | null
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    branch?: XOR<BranchNullableScalarRelationFilter, BranchWhereInput> | null
    bills?: BillListRelationFilter
    info?: XOR<UserInfoNullableScalarRelationFilter, UserInfoWhereInput> | null
    userRoles?: UserRoleListRelationFilter
    logs?: UserLogListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrderInput | SortOrder
    user_type?: SortOrder
    status?: SortOrder
    failed_login_attempts?: SortOrder
    last_failed_login?: SortOrderInput | SortOrder
    account_locked_until?: SortOrderInput | SortOrder
    last_login_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    company?: CompanyOrderByWithRelationInput
    branch?: BranchOrderByWithRelationInput
    bills?: BillOrderByRelationAggregateInput
    info?: UserInfoOrderByWithRelationInput
    userRoles?: UserRoleOrderByRelationAggregateInput
    logs?: UserLogOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    company_id?: IntFilter<"User"> | number
    branch_id?: IntNullableFilter<"User"> | number | null
    user_type?: EnumUserTypeFilter<"User"> | $Enums.UserType
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    failed_login_attempts?: IntFilter<"User"> | number
    last_failed_login?: DateTimeNullableFilter<"User"> | Date | string | null
    account_locked_until?: DateTimeNullableFilter<"User"> | Date | string | null
    last_login_at?: DateTimeNullableFilter<"User"> | Date | string | null
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    branch?: XOR<BranchNullableScalarRelationFilter, BranchWhereInput> | null
    bills?: BillListRelationFilter
    info?: XOR<UserInfoNullableScalarRelationFilter, UserInfoWhereInput> | null
    userRoles?: UserRoleListRelationFilter
    logs?: UserLogListRelationFilter
  }, "id" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrderInput | SortOrder
    user_type?: SortOrder
    status?: SortOrder
    failed_login_attempts?: SortOrder
    last_failed_login?: SortOrderInput | SortOrder
    account_locked_until?: SortOrderInput | SortOrder
    last_login_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    username?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    company_id?: IntWithAggregatesFilter<"User"> | number
    branch_id?: IntNullableWithAggregatesFilter<"User"> | number | null
    user_type?: EnumUserTypeWithAggregatesFilter<"User"> | $Enums.UserType
    status?: EnumUserStatusWithAggregatesFilter<"User"> | $Enums.UserStatus
    failed_login_attempts?: IntWithAggregatesFilter<"User"> | number
    last_failed_login?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    account_locked_until?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    last_login_at?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type UserInfoWhereInput = {
    AND?: UserInfoWhereInput | UserInfoWhereInput[]
    OR?: UserInfoWhereInput[]
    NOT?: UserInfoWhereInput | UserInfoWhereInput[]
    id?: IntFilter<"UserInfo"> | number
    user_id?: IntFilter<"UserInfo"> | number
    first_name?: StringFilter<"UserInfo"> | string
    last_name?: StringFilter<"UserInfo"> | string
    email?: StringNullableFilter<"UserInfo"> | string | null
    phone_number?: StringNullableFilter<"UserInfo"> | string | null
    address?: StringNullableFilter<"UserInfo"> | string | null
    profile_picture?: StringNullableFilter<"UserInfo"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserInfoOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrder
    first_name?: SortOrder
    last_name?: SortOrder
    email?: SortOrderInput | SortOrder
    phone_number?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    profile_picture?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserInfoWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    user_id?: number
    AND?: UserInfoWhereInput | UserInfoWhereInput[]
    OR?: UserInfoWhereInput[]
    NOT?: UserInfoWhereInput | UserInfoWhereInput[]
    first_name?: StringFilter<"UserInfo"> | string
    last_name?: StringFilter<"UserInfo"> | string
    email?: StringNullableFilter<"UserInfo"> | string | null
    phone_number?: StringNullableFilter<"UserInfo"> | string | null
    address?: StringNullableFilter<"UserInfo"> | string | null
    profile_picture?: StringNullableFilter<"UserInfo"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "user_id">

  export type UserInfoOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrder
    first_name?: SortOrder
    last_name?: SortOrder
    email?: SortOrderInput | SortOrder
    phone_number?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    profile_picture?: SortOrderInput | SortOrder
    _count?: UserInfoCountOrderByAggregateInput
    _avg?: UserInfoAvgOrderByAggregateInput
    _max?: UserInfoMaxOrderByAggregateInput
    _min?: UserInfoMinOrderByAggregateInput
    _sum?: UserInfoSumOrderByAggregateInput
  }

  export type UserInfoScalarWhereWithAggregatesInput = {
    AND?: UserInfoScalarWhereWithAggregatesInput | UserInfoScalarWhereWithAggregatesInput[]
    OR?: UserInfoScalarWhereWithAggregatesInput[]
    NOT?: UserInfoScalarWhereWithAggregatesInput | UserInfoScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserInfo"> | number
    user_id?: IntWithAggregatesFilter<"UserInfo"> | number
    first_name?: StringWithAggregatesFilter<"UserInfo"> | string
    last_name?: StringWithAggregatesFilter<"UserInfo"> | string
    email?: StringNullableWithAggregatesFilter<"UserInfo"> | string | null
    phone_number?: StringNullableWithAggregatesFilter<"UserInfo"> | string | null
    address?: StringNullableWithAggregatesFilter<"UserInfo"> | string | null
    profile_picture?: StringNullableWithAggregatesFilter<"UserInfo"> | string | null
  }

  export type RoleWhereInput = {
    AND?: RoleWhereInput | RoleWhereInput[]
    OR?: RoleWhereInput[]
    NOT?: RoleWhereInput | RoleWhereInput[]
    id?: IntFilter<"Role"> | number
    name?: StringFilter<"Role"> | string
    description?: StringNullableFilter<"Role"> | string | null
    userRoles?: UserRoleListRelationFilter
    authorities?: RoleAuthorityListRelationFilter
  }

  export type RoleOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    userRoles?: UserRoleOrderByRelationAggregateInput
    authorities?: RoleAuthorityOrderByRelationAggregateInput
  }

  export type RoleWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: RoleWhereInput | RoleWhereInput[]
    OR?: RoleWhereInput[]
    NOT?: RoleWhereInput | RoleWhereInput[]
    description?: StringNullableFilter<"Role"> | string | null
    userRoles?: UserRoleListRelationFilter
    authorities?: RoleAuthorityListRelationFilter
  }, "id" | "name">

  export type RoleOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    _count?: RoleCountOrderByAggregateInput
    _avg?: RoleAvgOrderByAggregateInput
    _max?: RoleMaxOrderByAggregateInput
    _min?: RoleMinOrderByAggregateInput
    _sum?: RoleSumOrderByAggregateInput
  }

  export type RoleScalarWhereWithAggregatesInput = {
    AND?: RoleScalarWhereWithAggregatesInput | RoleScalarWhereWithAggregatesInput[]
    OR?: RoleScalarWhereWithAggregatesInput[]
    NOT?: RoleScalarWhereWithAggregatesInput | RoleScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Role"> | number
    name?: StringWithAggregatesFilter<"Role"> | string
    description?: StringNullableWithAggregatesFilter<"Role"> | string | null
  }

  export type AuthorityWhereInput = {
    AND?: AuthorityWhereInput | AuthorityWhereInput[]
    OR?: AuthorityWhereInput[]
    NOT?: AuthorityWhereInput | AuthorityWhereInput[]
    id?: IntFilter<"Authority"> | number
    name?: StringFilter<"Authority"> | string
    description?: StringNullableFilter<"Authority"> | string | null
    roles?: RoleAuthorityListRelationFilter
  }

  export type AuthorityOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    roles?: RoleAuthorityOrderByRelationAggregateInput
  }

  export type AuthorityWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: AuthorityWhereInput | AuthorityWhereInput[]
    OR?: AuthorityWhereInput[]
    NOT?: AuthorityWhereInput | AuthorityWhereInput[]
    description?: StringNullableFilter<"Authority"> | string | null
    roles?: RoleAuthorityListRelationFilter
  }, "id" | "name">

  export type AuthorityOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    _count?: AuthorityCountOrderByAggregateInput
    _avg?: AuthorityAvgOrderByAggregateInput
    _max?: AuthorityMaxOrderByAggregateInput
    _min?: AuthorityMinOrderByAggregateInput
    _sum?: AuthoritySumOrderByAggregateInput
  }

  export type AuthorityScalarWhereWithAggregatesInput = {
    AND?: AuthorityScalarWhereWithAggregatesInput | AuthorityScalarWhereWithAggregatesInput[]
    OR?: AuthorityScalarWhereWithAggregatesInput[]
    NOT?: AuthorityScalarWhereWithAggregatesInput | AuthorityScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Authority"> | number
    name?: StringWithAggregatesFilter<"Authority"> | string
    description?: StringNullableWithAggregatesFilter<"Authority"> | string | null
  }

  export type UserRoleWhereInput = {
    AND?: UserRoleWhereInput | UserRoleWhereInput[]
    OR?: UserRoleWhereInput[]
    NOT?: UserRoleWhereInput | UserRoleWhereInput[]
    id?: IntFilter<"UserRole"> | number
    userId?: IntFilter<"UserRole"> | number
    roleId?: IntFilter<"UserRole"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
  }

  export type UserRoleOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    roleId?: SortOrder
    user?: UserOrderByWithRelationInput
    role?: RoleOrderByWithRelationInput
  }

  export type UserRoleWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId_roleId?: UserRoleUserIdRoleIdCompoundUniqueInput
    AND?: UserRoleWhereInput | UserRoleWhereInput[]
    OR?: UserRoleWhereInput[]
    NOT?: UserRoleWhereInput | UserRoleWhereInput[]
    userId?: IntFilter<"UserRole"> | number
    roleId?: IntFilter<"UserRole"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
  }, "id" | "userId_roleId">

  export type UserRoleOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    roleId?: SortOrder
    _count?: UserRoleCountOrderByAggregateInput
    _avg?: UserRoleAvgOrderByAggregateInput
    _max?: UserRoleMaxOrderByAggregateInput
    _min?: UserRoleMinOrderByAggregateInput
    _sum?: UserRoleSumOrderByAggregateInput
  }

  export type UserRoleScalarWhereWithAggregatesInput = {
    AND?: UserRoleScalarWhereWithAggregatesInput | UserRoleScalarWhereWithAggregatesInput[]
    OR?: UserRoleScalarWhereWithAggregatesInput[]
    NOT?: UserRoleScalarWhereWithAggregatesInput | UserRoleScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserRole"> | number
    userId?: IntWithAggregatesFilter<"UserRole"> | number
    roleId?: IntWithAggregatesFilter<"UserRole"> | number
  }

  export type RoleAuthorityWhereInput = {
    AND?: RoleAuthorityWhereInput | RoleAuthorityWhereInput[]
    OR?: RoleAuthorityWhereInput[]
    NOT?: RoleAuthorityWhereInput | RoleAuthorityWhereInput[]
    id?: IntFilter<"RoleAuthority"> | number
    roleId?: IntFilter<"RoleAuthority"> | number
    authorityId?: IntFilter<"RoleAuthority"> | number
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
    authority?: XOR<AuthorityScalarRelationFilter, AuthorityWhereInput>
  }

  export type RoleAuthorityOrderByWithRelationInput = {
    id?: SortOrder
    roleId?: SortOrder
    authorityId?: SortOrder
    role?: RoleOrderByWithRelationInput
    authority?: AuthorityOrderByWithRelationInput
  }

  export type RoleAuthorityWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    roleId_authorityId?: RoleAuthorityRoleIdAuthorityIdCompoundUniqueInput
    AND?: RoleAuthorityWhereInput | RoleAuthorityWhereInput[]
    OR?: RoleAuthorityWhereInput[]
    NOT?: RoleAuthorityWhereInput | RoleAuthorityWhereInput[]
    roleId?: IntFilter<"RoleAuthority"> | number
    authorityId?: IntFilter<"RoleAuthority"> | number
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
    authority?: XOR<AuthorityScalarRelationFilter, AuthorityWhereInput>
  }, "id" | "roleId_authorityId">

  export type RoleAuthorityOrderByWithAggregationInput = {
    id?: SortOrder
    roleId?: SortOrder
    authorityId?: SortOrder
    _count?: RoleAuthorityCountOrderByAggregateInput
    _avg?: RoleAuthorityAvgOrderByAggregateInput
    _max?: RoleAuthorityMaxOrderByAggregateInput
    _min?: RoleAuthorityMinOrderByAggregateInput
    _sum?: RoleAuthoritySumOrderByAggregateInput
  }

  export type RoleAuthorityScalarWhereWithAggregatesInput = {
    AND?: RoleAuthorityScalarWhereWithAggregatesInput | RoleAuthorityScalarWhereWithAggregatesInput[]
    OR?: RoleAuthorityScalarWhereWithAggregatesInput[]
    NOT?: RoleAuthorityScalarWhereWithAggregatesInput | RoleAuthorityScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"RoleAuthority"> | number
    roleId?: IntWithAggregatesFilter<"RoleAuthority"> | number
    authorityId?: IntWithAggregatesFilter<"RoleAuthority"> | number
  }

  export type UserLogWhereInput = {
    AND?: UserLogWhereInput | UserLogWhereInput[]
    OR?: UserLogWhereInput[]
    NOT?: UserLogWhereInput | UserLogWhereInput[]
    id?: IntFilter<"UserLog"> | number
    userId?: IntFilter<"UserLog"> | number
    branch_id?: IntNullableFilter<"UserLog"> | number | null
    action?: EnumLogActionFilter<"UserLog"> | $Enums.LogAction
    status?: EnumLogStatusFilter<"UserLog"> | $Enums.LogStatus
    ip_address?: StringNullableFilter<"UserLog"> | string | null
    user_agent?: StringNullableFilter<"UserLog"> | string | null
    device_info?: StringNullableFilter<"UserLog"> | string | null
    created_at?: DateTimeFilter<"UserLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    branch?: XOR<BranchNullableScalarRelationFilter, BranchWhereInput> | null
  }

  export type UserLogOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    branch_id?: SortOrderInput | SortOrder
    action?: SortOrder
    status?: SortOrder
    ip_address?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    device_info?: SortOrderInput | SortOrder
    created_at?: SortOrder
    user?: UserOrderByWithRelationInput
    branch?: BranchOrderByWithRelationInput
  }

  export type UserLogWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: UserLogWhereInput | UserLogWhereInput[]
    OR?: UserLogWhereInput[]
    NOT?: UserLogWhereInput | UserLogWhereInput[]
    userId?: IntFilter<"UserLog"> | number
    branch_id?: IntNullableFilter<"UserLog"> | number | null
    action?: EnumLogActionFilter<"UserLog"> | $Enums.LogAction
    status?: EnumLogStatusFilter<"UserLog"> | $Enums.LogStatus
    ip_address?: StringNullableFilter<"UserLog"> | string | null
    user_agent?: StringNullableFilter<"UserLog"> | string | null
    device_info?: StringNullableFilter<"UserLog"> | string | null
    created_at?: DateTimeFilter<"UserLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    branch?: XOR<BranchNullableScalarRelationFilter, BranchWhereInput> | null
  }, "id">

  export type UserLogOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    branch_id?: SortOrderInput | SortOrder
    action?: SortOrder
    status?: SortOrder
    ip_address?: SortOrderInput | SortOrder
    user_agent?: SortOrderInput | SortOrder
    device_info?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: UserLogCountOrderByAggregateInput
    _avg?: UserLogAvgOrderByAggregateInput
    _max?: UserLogMaxOrderByAggregateInput
    _min?: UserLogMinOrderByAggregateInput
    _sum?: UserLogSumOrderByAggregateInput
  }

  export type UserLogScalarWhereWithAggregatesInput = {
    AND?: UserLogScalarWhereWithAggregatesInput | UserLogScalarWhereWithAggregatesInput[]
    OR?: UserLogScalarWhereWithAggregatesInput[]
    NOT?: UserLogScalarWhereWithAggregatesInput | UserLogScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserLog"> | number
    userId?: IntWithAggregatesFilter<"UserLog"> | number
    branch_id?: IntNullableWithAggregatesFilter<"UserLog"> | number | null
    action?: EnumLogActionWithAggregatesFilter<"UserLog"> | $Enums.LogAction
    status?: EnumLogStatusWithAggregatesFilter<"UserLog"> | $Enums.LogStatus
    ip_address?: StringNullableWithAggregatesFilter<"UserLog"> | string | null
    user_agent?: StringNullableWithAggregatesFilter<"UserLog"> | string | null
    device_info?: StringNullableWithAggregatesFilter<"UserLog"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"UserLog"> | Date | string
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: IntFilter<"Product"> | number
    name?: StringFilter<"Product"> | string
    code?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    price?: DecimalFilter<"Product"> | Decimal | DecimalJsLike | number | string
    cost_price?: DecimalNullableFilter<"Product"> | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFilter<"Product"> | number
    min_quantity?: IntFilter<"Product"> | number
    company_id?: IntFilter<"Product"> | number
    branch_id?: IntNullableFilter<"Product"> | number | null
    is_active?: BoolFilter<"Product"> | boolean
    created_at?: DateTimeFilter<"Product"> | Date | string
    updated_at?: DateTimeFilter<"Product"> | Date | string
    billItems?: BillItemListRelationFilter
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    branch?: XOR<BranchNullableScalarRelationFilter, BranchWhereInput> | null
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    cost_price?: SortOrderInput | SortOrder
    quantity?: SortOrder
    min_quantity?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrderInput | SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    billItems?: BillItemOrderByRelationAggregateInput
    company?: CompanyOrderByWithRelationInput
    branch?: BranchOrderByWithRelationInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    code?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    price?: DecimalFilter<"Product"> | Decimal | DecimalJsLike | number | string
    cost_price?: DecimalNullableFilter<"Product"> | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFilter<"Product"> | number
    min_quantity?: IntFilter<"Product"> | number
    company_id?: IntFilter<"Product"> | number
    branch_id?: IntNullableFilter<"Product"> | number | null
    is_active?: BoolFilter<"Product"> | boolean
    created_at?: DateTimeFilter<"Product"> | Date | string
    updated_at?: DateTimeFilter<"Product"> | Date | string
    billItems?: BillItemListRelationFilter
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    branch?: XOR<BranchNullableScalarRelationFilter, BranchWhereInput> | null
  }, "id">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    cost_price?: SortOrderInput | SortOrder
    quantity?: SortOrder
    min_quantity?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrderInput | SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Product"> | number
    name?: StringWithAggregatesFilter<"Product"> | string
    code?: StringWithAggregatesFilter<"Product"> | string
    description?: StringNullableWithAggregatesFilter<"Product"> | string | null
    price?: DecimalWithAggregatesFilter<"Product"> | Decimal | DecimalJsLike | number | string
    cost_price?: DecimalNullableWithAggregatesFilter<"Product"> | Decimal | DecimalJsLike | number | string | null
    quantity?: IntWithAggregatesFilter<"Product"> | number
    min_quantity?: IntWithAggregatesFilter<"Product"> | number
    company_id?: IntWithAggregatesFilter<"Product"> | number
    branch_id?: IntNullableWithAggregatesFilter<"Product"> | number | null
    is_active?: BoolWithAggregatesFilter<"Product"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Product"> | Date | string
  }

  export type BillWhereInput = {
    AND?: BillWhereInput | BillWhereInput[]
    OR?: BillWhereInput[]
    NOT?: BillWhereInput | BillWhereInput[]
    id?: IntFilter<"Bill"> | number
    bill_number?: StringFilter<"Bill"> | string
    company_id?: IntFilter<"Bill"> | number
    branch_id?: IntFilter<"Bill"> | number
    cashier_id?: IntFilter<"Bill"> | number
    status?: EnumBillStatusFilter<"Bill"> | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFilter<"Bill"> | $Enums.PaymentMethod
    subtotal?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    discount?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    tax?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    notes?: StringNullableFilter<"Bill"> | string | null
    created_at?: DateTimeFilter<"Bill"> | Date | string
    updated_at?: DateTimeFilter<"Bill"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    branch?: XOR<BranchScalarRelationFilter, BranchWhereInput>
    cashier?: XOR<UserScalarRelationFilter, UserWhereInput>
    items?: BillItemListRelationFilter
  }

  export type BillOrderByWithRelationInput = {
    id?: SortOrder
    bill_number?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    cashier_id?: SortOrder
    status?: SortOrder
    payment_method?: SortOrder
    subtotal?: SortOrder
    discount?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    notes?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    company?: CompanyOrderByWithRelationInput
    branch?: BranchOrderByWithRelationInput
    cashier?: UserOrderByWithRelationInput
    items?: BillItemOrderByRelationAggregateInput
  }

  export type BillWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    bill_number?: string
    AND?: BillWhereInput | BillWhereInput[]
    OR?: BillWhereInput[]
    NOT?: BillWhereInput | BillWhereInput[]
    company_id?: IntFilter<"Bill"> | number
    branch_id?: IntFilter<"Bill"> | number
    cashier_id?: IntFilter<"Bill"> | number
    status?: EnumBillStatusFilter<"Bill"> | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFilter<"Bill"> | $Enums.PaymentMethod
    subtotal?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    discount?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    tax?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    notes?: StringNullableFilter<"Bill"> | string | null
    created_at?: DateTimeFilter<"Bill"> | Date | string
    updated_at?: DateTimeFilter<"Bill"> | Date | string
    company?: XOR<CompanyScalarRelationFilter, CompanyWhereInput>
    branch?: XOR<BranchScalarRelationFilter, BranchWhereInput>
    cashier?: XOR<UserScalarRelationFilter, UserWhereInput>
    items?: BillItemListRelationFilter
  }, "id" | "bill_number">

  export type BillOrderByWithAggregationInput = {
    id?: SortOrder
    bill_number?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    cashier_id?: SortOrder
    status?: SortOrder
    payment_method?: SortOrder
    subtotal?: SortOrder
    discount?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    notes?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: BillCountOrderByAggregateInput
    _avg?: BillAvgOrderByAggregateInput
    _max?: BillMaxOrderByAggregateInput
    _min?: BillMinOrderByAggregateInput
    _sum?: BillSumOrderByAggregateInput
  }

  export type BillScalarWhereWithAggregatesInput = {
    AND?: BillScalarWhereWithAggregatesInput | BillScalarWhereWithAggregatesInput[]
    OR?: BillScalarWhereWithAggregatesInput[]
    NOT?: BillScalarWhereWithAggregatesInput | BillScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Bill"> | number
    bill_number?: StringWithAggregatesFilter<"Bill"> | string
    company_id?: IntWithAggregatesFilter<"Bill"> | number
    branch_id?: IntWithAggregatesFilter<"Bill"> | number
    cashier_id?: IntWithAggregatesFilter<"Bill"> | number
    status?: EnumBillStatusWithAggregatesFilter<"Bill"> | $Enums.BillStatus
    payment_method?: EnumPaymentMethodWithAggregatesFilter<"Bill"> | $Enums.PaymentMethod
    subtotal?: DecimalWithAggregatesFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    discount?: DecimalWithAggregatesFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    tax?: DecimalWithAggregatesFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    total?: DecimalWithAggregatesFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    notes?: StringNullableWithAggregatesFilter<"Bill"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Bill"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Bill"> | Date | string
  }

  export type BillItemWhereInput = {
    AND?: BillItemWhereInput | BillItemWhereInput[]
    OR?: BillItemWhereInput[]
    NOT?: BillItemWhereInput | BillItemWhereInput[]
    id?: IntFilter<"BillItem"> | number
    bill_id?: IntFilter<"BillItem"> | number
    product_id?: IntFilter<"BillItem"> | number
    quantity?: IntFilter<"BillItem"> | number
    unit_price?: DecimalFilter<"BillItem"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"BillItem"> | Decimal | DecimalJsLike | number | string
    bill?: XOR<BillScalarRelationFilter, BillWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }

  export type BillItemOrderByWithRelationInput = {
    id?: SortOrder
    bill_id?: SortOrder
    product_id?: SortOrder
    quantity?: SortOrder
    unit_price?: SortOrder
    total?: SortOrder
    bill?: BillOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
  }

  export type BillItemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: BillItemWhereInput | BillItemWhereInput[]
    OR?: BillItemWhereInput[]
    NOT?: BillItemWhereInput | BillItemWhereInput[]
    bill_id?: IntFilter<"BillItem"> | number
    product_id?: IntFilter<"BillItem"> | number
    quantity?: IntFilter<"BillItem"> | number
    unit_price?: DecimalFilter<"BillItem"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"BillItem"> | Decimal | DecimalJsLike | number | string
    bill?: XOR<BillScalarRelationFilter, BillWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }, "id">

  export type BillItemOrderByWithAggregationInput = {
    id?: SortOrder
    bill_id?: SortOrder
    product_id?: SortOrder
    quantity?: SortOrder
    unit_price?: SortOrder
    total?: SortOrder
    _count?: BillItemCountOrderByAggregateInput
    _avg?: BillItemAvgOrderByAggregateInput
    _max?: BillItemMaxOrderByAggregateInput
    _min?: BillItemMinOrderByAggregateInput
    _sum?: BillItemSumOrderByAggregateInput
  }

  export type BillItemScalarWhereWithAggregatesInput = {
    AND?: BillItemScalarWhereWithAggregatesInput | BillItemScalarWhereWithAggregatesInput[]
    OR?: BillItemScalarWhereWithAggregatesInput[]
    NOT?: BillItemScalarWhereWithAggregatesInput | BillItemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"BillItem"> | number
    bill_id?: IntWithAggregatesFilter<"BillItem"> | number
    product_id?: IntWithAggregatesFilter<"BillItem"> | number
    quantity?: IntWithAggregatesFilter<"BillItem"> | number
    unit_price?: DecimalWithAggregatesFilter<"BillItem"> | Decimal | DecimalJsLike | number | string
    total?: DecimalWithAggregatesFilter<"BillItem"> | Decimal | DecimalJsLike | number | string
  }

  export type CompanyCreateInput = {
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    branches?: BranchCreateNestedManyWithoutCompanyInput
    users?: UserCreateNestedManyWithoutCompanyInput
    products?: ProductCreateNestedManyWithoutCompanyInput
    bills?: BillCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateInput = {
    id?: number
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    branches?: BranchUncheckedCreateNestedManyWithoutCompanyInput
    users?: UserUncheckedCreateNestedManyWithoutCompanyInput
    products?: ProductUncheckedCreateNestedManyWithoutCompanyInput
    bills?: BillUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branches?: BranchUpdateManyWithoutCompanyNestedInput
    users?: UserUpdateManyWithoutCompanyNestedInput
    products?: ProductUpdateManyWithoutCompanyNestedInput
    bills?: BillUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branches?: BranchUncheckedUpdateManyWithoutCompanyNestedInput
    users?: UserUncheckedUpdateManyWithoutCompanyNestedInput
    products?: ProductUncheckedUpdateManyWithoutCompanyNestedInput
    bills?: BillUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyCreateManyInput = {
    id?: number
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CompanyUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CompanyUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BranchCreateInput = {
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutBranchesInput
    users?: UserCreateNestedManyWithoutBranchInput
    logs?: UserLogCreateNestedManyWithoutBranchInput
    products?: ProductCreateNestedManyWithoutBranchInput
    bills?: BillCreateNestedManyWithoutBranchInput
  }

  export type BranchUncheckedCreateInput = {
    id?: number
    company_id: number
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutBranchInput
    logs?: UserLogUncheckedCreateNestedManyWithoutBranchInput
    products?: ProductUncheckedCreateNestedManyWithoutBranchInput
    bills?: BillUncheckedCreateNestedManyWithoutBranchInput
  }

  export type BranchUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutBranchesNestedInput
    users?: UserUpdateManyWithoutBranchNestedInput
    logs?: UserLogUpdateManyWithoutBranchNestedInput
    products?: ProductUpdateManyWithoutBranchNestedInput
    bills?: BillUpdateManyWithoutBranchNestedInput
  }

  export type BranchUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutBranchNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutBranchNestedInput
    products?: ProductUncheckedUpdateManyWithoutBranchNestedInput
    bills?: BillUncheckedUpdateManyWithoutBranchNestedInput
  }

  export type BranchCreateManyInput = {
    id?: number
    company_id: number
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type BranchUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BranchUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    username: string
    password: string
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    branch?: BranchCreateNestedOneWithoutUsersInput
    bills?: BillCreateNestedManyWithoutCashierInput
    info?: UserInfoCreateNestedOneWithoutUserInput
    userRoles?: UserRoleCreateNestedManyWithoutUserInput
    logs?: UserLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    username: string
    password: string
    company_id: number
    branch_id?: number | null
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    bills?: BillUncheckedCreateNestedManyWithoutCashierInput
    info?: UserInfoUncheckedCreateNestedOneWithoutUserInput
    userRoles?: UserRoleUncheckedCreateNestedManyWithoutUserInput
    logs?: UserLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    branch?: BranchUpdateOneWithoutUsersNestedInput
    bills?: BillUpdateManyWithoutCashierNestedInput
    info?: UserInfoUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUpdateManyWithoutUserNestedInput
    logs?: UserLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    bills?: BillUncheckedUpdateManyWithoutCashierNestedInput
    info?: UserInfoUncheckedUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUncheckedUpdateManyWithoutUserNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    username: string
    password: string
    company_id: number
    branch_id?: number | null
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserInfoCreateInput = {
    first_name: string
    last_name: string
    email?: string | null
    phone_number?: string | null
    address?: string | null
    profile_picture?: string | null
    user: UserCreateNestedOneWithoutInfoInput
  }

  export type UserInfoUncheckedCreateInput = {
    id?: number
    user_id: number
    first_name: string
    last_name: string
    email?: string | null
    phone_number?: string | null
    address?: string | null
    profile_picture?: string | null
  }

  export type UserInfoUpdateInput = {
    first_name?: StringFieldUpdateOperationsInput | string
    last_name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profile_picture?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutInfoNestedInput
  }

  export type UserInfoUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    first_name?: StringFieldUpdateOperationsInput | string
    last_name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profile_picture?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserInfoCreateManyInput = {
    id?: number
    user_id: number
    first_name: string
    last_name: string
    email?: string | null
    phone_number?: string | null
    address?: string | null
    profile_picture?: string | null
  }

  export type UserInfoUpdateManyMutationInput = {
    first_name?: StringFieldUpdateOperationsInput | string
    last_name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profile_picture?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserInfoUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    user_id?: IntFieldUpdateOperationsInput | number
    first_name?: StringFieldUpdateOperationsInput | string
    last_name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profile_picture?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RoleCreateInput = {
    name: string
    description?: string | null
    userRoles?: UserRoleCreateNestedManyWithoutRoleInput
    authorities?: RoleAuthorityCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateInput = {
    id?: number
    name: string
    description?: string | null
    userRoles?: UserRoleUncheckedCreateNestedManyWithoutRoleInput
    authorities?: RoleAuthorityUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    userRoles?: UserRoleUpdateManyWithoutRoleNestedInput
    authorities?: RoleAuthorityUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    userRoles?: UserRoleUncheckedUpdateManyWithoutRoleNestedInput
    authorities?: RoleAuthorityUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type RoleCreateManyInput = {
    id?: number
    name: string
    description?: string | null
  }

  export type RoleUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RoleUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuthorityCreateInput = {
    name: string
    description?: string | null
    roles?: RoleAuthorityCreateNestedManyWithoutAuthorityInput
  }

  export type AuthorityUncheckedCreateInput = {
    id?: number
    name: string
    description?: string | null
    roles?: RoleAuthorityUncheckedCreateNestedManyWithoutAuthorityInput
  }

  export type AuthorityUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    roles?: RoleAuthorityUpdateManyWithoutAuthorityNestedInput
  }

  export type AuthorityUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    roles?: RoleAuthorityUncheckedUpdateManyWithoutAuthorityNestedInput
  }

  export type AuthorityCreateManyInput = {
    id?: number
    name: string
    description?: string | null
  }

  export type AuthorityUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuthorityUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRoleCreateInput = {
    user: UserCreateNestedOneWithoutUserRolesInput
    role: RoleCreateNestedOneWithoutUserRolesInput
  }

  export type UserRoleUncheckedCreateInput = {
    id?: number
    userId: number
    roleId: number
  }

  export type UserRoleUpdateInput = {
    user?: UserUpdateOneRequiredWithoutUserRolesNestedInput
    role?: RoleUpdateOneRequiredWithoutUserRolesNestedInput
  }

  export type UserRoleUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    roleId?: IntFieldUpdateOperationsInput | number
  }

  export type UserRoleCreateManyInput = {
    id?: number
    userId: number
    roleId: number
  }

  export type UserRoleUpdateManyMutationInput = {

  }

  export type UserRoleUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    roleId?: IntFieldUpdateOperationsInput | number
  }

  export type RoleAuthorityCreateInput = {
    role: RoleCreateNestedOneWithoutAuthoritiesInput
    authority: AuthorityCreateNestedOneWithoutRolesInput
  }

  export type RoleAuthorityUncheckedCreateInput = {
    id?: number
    roleId: number
    authorityId: number
  }

  export type RoleAuthorityUpdateInput = {
    role?: RoleUpdateOneRequiredWithoutAuthoritiesNestedInput
    authority?: AuthorityUpdateOneRequiredWithoutRolesNestedInput
  }

  export type RoleAuthorityUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    roleId?: IntFieldUpdateOperationsInput | number
    authorityId?: IntFieldUpdateOperationsInput | number
  }

  export type RoleAuthorityCreateManyInput = {
    id?: number
    roleId: number
    authorityId: number
  }

  export type RoleAuthorityUpdateManyMutationInput = {

  }

  export type RoleAuthorityUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    roleId?: IntFieldUpdateOperationsInput | number
    authorityId?: IntFieldUpdateOperationsInput | number
  }

  export type UserLogCreateInput = {
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address?: string | null
    user_agent?: string | null
    device_info?: string | null
    created_at?: Date | string
    user: UserCreateNestedOneWithoutLogsInput
    branch?: BranchCreateNestedOneWithoutLogsInput
  }

  export type UserLogUncheckedCreateInput = {
    id?: number
    userId: number
    branch_id?: number | null
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address?: string | null
    user_agent?: string | null
    device_info?: string | null
    created_at?: Date | string
  }

  export type UserLogUpdateInput = {
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLogsNestedInput
    branch?: BranchUpdateOneWithoutLogsNestedInput
  }

  export type UserLogUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserLogCreateManyInput = {
    id?: number
    userId: number
    branch_id?: number | null
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address?: string | null
    user_agent?: string | null
    device_info?: string | null
    created_at?: Date | string
  }

  export type UserLogUpdateManyMutationInput = {
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserLogUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateInput = {
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    billItems?: BillItemCreateNestedManyWithoutProductInput
    company: CompanyCreateNestedOneWithoutProductsInput
    branch?: BranchCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateInput = {
    id?: number
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    company_id: number
    branch_id?: number | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    billItems?: BillItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    billItems?: BillItemUpdateManyWithoutProductNestedInput
    company?: CompanyUpdateOneRequiredWithoutProductsNestedInput
    branch?: BranchUpdateOneWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    billItems?: BillItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id?: number
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    company_id: number
    branch_id?: number | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProductUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BillCreateInput = {
    bill_number: string
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutBillsInput
    branch: BranchCreateNestedOneWithoutBillsInput
    cashier: UserCreateNestedOneWithoutBillsInput
    items?: BillItemCreateNestedManyWithoutBillInput
  }

  export type BillUncheckedCreateInput = {
    id?: number
    bill_number: string
    company_id: number
    branch_id: number
    cashier_id: number
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    items?: BillItemUncheckedCreateNestedManyWithoutBillInput
  }

  export type BillUpdateInput = {
    bill_number?: StringFieldUpdateOperationsInput | string
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutBillsNestedInput
    branch?: BranchUpdateOneRequiredWithoutBillsNestedInput
    cashier?: UserUpdateOneRequiredWithoutBillsNestedInput
    items?: BillItemUpdateManyWithoutBillNestedInput
  }

  export type BillUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_number?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: IntFieldUpdateOperationsInput | number
    cashier_id?: IntFieldUpdateOperationsInput | number
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: BillItemUncheckedUpdateManyWithoutBillNestedInput
  }

  export type BillCreateManyInput = {
    id?: number
    bill_number: string
    company_id: number
    branch_id: number
    cashier_id: number
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type BillUpdateManyMutationInput = {
    bill_number?: StringFieldUpdateOperationsInput | string
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BillUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_number?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: IntFieldUpdateOperationsInput | number
    cashier_id?: IntFieldUpdateOperationsInput | number
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BillItemCreateInput = {
    quantity: number
    unit_price: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    bill: BillCreateNestedOneWithoutItemsInput
    product: ProductCreateNestedOneWithoutBillItemsInput
  }

  export type BillItemUncheckedCreateInput = {
    id?: number
    bill_id: number
    product_id: number
    quantity: number
    unit_price: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type BillItemUpdateInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bill?: BillUpdateOneRequiredWithoutItemsNestedInput
    product?: ProductUpdateOneRequiredWithoutBillItemsNestedInput
  }

  export type BillItemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_id?: IntFieldUpdateOperationsInput | number
    product_id?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type BillItemCreateManyInput = {
    id?: number
    bill_id: number
    product_id: number
    quantity: number
    unit_price: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type BillItemUpdateManyMutationInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type BillItemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_id?: IntFieldUpdateOperationsInput | number
    product_id?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BranchListRelationFilter = {
    every?: BranchWhereInput
    some?: BranchWhereInput
    none?: BranchWhereInput
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type ProductListRelationFilter = {
    every?: ProductWhereInput
    some?: ProductWhereInput
    none?: ProductWhereInput
  }

  export type BillListRelationFilter = {
    every?: BillWhereInput
    some?: BillWhereInput
    none?: BillWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BranchOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BillOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CompanyCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CompanyAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CompanyMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CompanyMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CompanySumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type CompanyScalarRelationFilter = {
    is?: CompanyWhereInput
    isNot?: CompanyWhereInput
  }

  export type UserLogListRelationFilter = {
    every?: UserLogWhereInput
    some?: UserLogWhereInput
    none?: UserLogWhereInput
  }

  export type UserLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BranchCompany_idCodeCompoundUniqueInput = {
    company_id: number
    code: string
  }

  export type BranchCountOrderByAggregateInput = {
    id?: SortOrder
    company_id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BranchAvgOrderByAggregateInput = {
    id?: SortOrder
    company_id?: SortOrder
  }

  export type BranchMaxOrderByAggregateInput = {
    id?: SortOrder
    company_id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BranchMinOrderByAggregateInput = {
    id?: SortOrder
    company_id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BranchSumOrderByAggregateInput = {
    id?: SortOrder
    company_id?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumUserTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeFilter<$PrismaModel> | $Enums.UserType
  }

  export type EnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BranchNullableScalarRelationFilter = {
    is?: BranchWhereInput | null
    isNot?: BranchWhereInput | null
  }

  export type UserInfoNullableScalarRelationFilter = {
    is?: UserInfoWhereInput | null
    isNot?: UserInfoWhereInput | null
  }

  export type UserRoleListRelationFilter = {
    every?: UserRoleWhereInput
    some?: UserRoleWhereInput
    none?: UserRoleWhereInput
  }

  export type UserRoleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    user_type?: SortOrder
    status?: SortOrder
    failed_login_attempts?: SortOrder
    last_failed_login?: SortOrder
    account_locked_until?: SortOrder
    last_login_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    failed_login_attempts?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    user_type?: SortOrder
    status?: SortOrder
    failed_login_attempts?: SortOrder
    last_failed_login?: SortOrder
    account_locked_until?: SortOrder
    last_login_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    user_type?: SortOrder
    status?: SortOrder
    failed_login_attempts?: SortOrder
    last_failed_login?: SortOrder
    account_locked_until?: SortOrder
    last_login_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    failed_login_attempts?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumUserTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeWithAggregatesFilter<$PrismaModel> | $Enums.UserType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTypeFilter<$PrismaModel>
    _max?: NestedEnumUserTypeFilter<$PrismaModel>
  }

  export type EnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserInfoCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    first_name?: SortOrder
    last_name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    address?: SortOrder
    profile_picture?: SortOrder
  }

  export type UserInfoAvgOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
  }

  export type UserInfoMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    first_name?: SortOrder
    last_name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    address?: SortOrder
    profile_picture?: SortOrder
  }

  export type UserInfoMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    first_name?: SortOrder
    last_name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    address?: SortOrder
    profile_picture?: SortOrder
  }

  export type UserInfoSumOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
  }

  export type RoleAuthorityListRelationFilter = {
    every?: RoleAuthorityWhereInput
    some?: RoleAuthorityWhereInput
    none?: RoleAuthorityWhereInput
  }

  export type RoleAuthorityOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RoleCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type RoleAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RoleMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type RoleMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type RoleSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AuthorityCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type AuthorityAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AuthorityMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type AuthorityMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
  }

  export type AuthoritySumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RoleScalarRelationFilter = {
    is?: RoleWhereInput
    isNot?: RoleWhereInput
  }

  export type UserRoleUserIdRoleIdCompoundUniqueInput = {
    userId: number
    roleId: number
  }

  export type UserRoleCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    roleId?: SortOrder
  }

  export type UserRoleAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    roleId?: SortOrder
  }

  export type UserRoleMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    roleId?: SortOrder
  }

  export type UserRoleMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    roleId?: SortOrder
  }

  export type UserRoleSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    roleId?: SortOrder
  }

  export type AuthorityScalarRelationFilter = {
    is?: AuthorityWhereInput
    isNot?: AuthorityWhereInput
  }

  export type RoleAuthorityRoleIdAuthorityIdCompoundUniqueInput = {
    roleId: number
    authorityId: number
  }

  export type RoleAuthorityCountOrderByAggregateInput = {
    id?: SortOrder
    roleId?: SortOrder
    authorityId?: SortOrder
  }

  export type RoleAuthorityAvgOrderByAggregateInput = {
    id?: SortOrder
    roleId?: SortOrder
    authorityId?: SortOrder
  }

  export type RoleAuthorityMaxOrderByAggregateInput = {
    id?: SortOrder
    roleId?: SortOrder
    authorityId?: SortOrder
  }

  export type RoleAuthorityMinOrderByAggregateInput = {
    id?: SortOrder
    roleId?: SortOrder
    authorityId?: SortOrder
  }

  export type RoleAuthoritySumOrderByAggregateInput = {
    id?: SortOrder
    roleId?: SortOrder
    authorityId?: SortOrder
  }

  export type EnumLogActionFilter<$PrismaModel = never> = {
    equals?: $Enums.LogAction | EnumLogActionFieldRefInput<$PrismaModel>
    in?: $Enums.LogAction[] | ListEnumLogActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogAction[] | ListEnumLogActionFieldRefInput<$PrismaModel>
    not?: NestedEnumLogActionFilter<$PrismaModel> | $Enums.LogAction
  }

  export type EnumLogStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LogStatus | EnumLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLogStatusFilter<$PrismaModel> | $Enums.LogStatus
  }

  export type UserLogCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    branch_id?: SortOrder
    action?: SortOrder
    status?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    device_info?: SortOrder
    created_at?: SortOrder
  }

  export type UserLogAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    branch_id?: SortOrder
  }

  export type UserLogMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    branch_id?: SortOrder
    action?: SortOrder
    status?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    device_info?: SortOrder
    created_at?: SortOrder
  }

  export type UserLogMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    branch_id?: SortOrder
    action?: SortOrder
    status?: SortOrder
    ip_address?: SortOrder
    user_agent?: SortOrder
    device_info?: SortOrder
    created_at?: SortOrder
  }

  export type UserLogSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    branch_id?: SortOrder
  }

  export type EnumLogActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LogAction | EnumLogActionFieldRefInput<$PrismaModel>
    in?: $Enums.LogAction[] | ListEnumLogActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogAction[] | ListEnumLogActionFieldRefInput<$PrismaModel>
    not?: NestedEnumLogActionWithAggregatesFilter<$PrismaModel> | $Enums.LogAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLogActionFilter<$PrismaModel>
    _max?: NestedEnumLogActionFilter<$PrismaModel>
  }

  export type EnumLogStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LogStatus | EnumLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLogStatusWithAggregatesFilter<$PrismaModel> | $Enums.LogStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLogStatusFilter<$PrismaModel>
    _max?: NestedEnumLogStatusFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type BillItemListRelationFilter = {
    every?: BillItemWhereInput
    some?: BillItemWhereInput
    none?: BillItemWhereInput
  }

  export type BillItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    price?: SortOrder
    cost_price?: SortOrder
    quantity?: SortOrder
    min_quantity?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    cost_price?: SortOrder
    quantity?: SortOrder
    min_quantity?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    price?: SortOrder
    cost_price?: SortOrder
    quantity?: SortOrder
    min_quantity?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    price?: SortOrder
    cost_price?: SortOrder
    quantity?: SortOrder
    min_quantity?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    id?: SortOrder
    price?: SortOrder
    cost_price?: SortOrder
    quantity?: SortOrder
    min_quantity?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type EnumBillStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BillStatus | EnumBillStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillStatus[] | ListEnumBillStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillStatus[] | ListEnumBillStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillStatusFilter<$PrismaModel> | $Enums.BillStatus
  }

  export type EnumPaymentMethodFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentMethodFilter<$PrismaModel> | $Enums.PaymentMethod
  }

  export type BranchScalarRelationFilter = {
    is?: BranchWhereInput
    isNot?: BranchWhereInput
  }

  export type BillCountOrderByAggregateInput = {
    id?: SortOrder
    bill_number?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    cashier_id?: SortOrder
    status?: SortOrder
    payment_method?: SortOrder
    subtotal?: SortOrder
    discount?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    notes?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BillAvgOrderByAggregateInput = {
    id?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    cashier_id?: SortOrder
    subtotal?: SortOrder
    discount?: SortOrder
    tax?: SortOrder
    total?: SortOrder
  }

  export type BillMaxOrderByAggregateInput = {
    id?: SortOrder
    bill_number?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    cashier_id?: SortOrder
    status?: SortOrder
    payment_method?: SortOrder
    subtotal?: SortOrder
    discount?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    notes?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BillMinOrderByAggregateInput = {
    id?: SortOrder
    bill_number?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    cashier_id?: SortOrder
    status?: SortOrder
    payment_method?: SortOrder
    subtotal?: SortOrder
    discount?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    notes?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BillSumOrderByAggregateInput = {
    id?: SortOrder
    company_id?: SortOrder
    branch_id?: SortOrder
    cashier_id?: SortOrder
    subtotal?: SortOrder
    discount?: SortOrder
    tax?: SortOrder
    total?: SortOrder
  }

  export type EnumBillStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BillStatus | EnumBillStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillStatus[] | ListEnumBillStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillStatus[] | ListEnumBillStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillStatusWithAggregatesFilter<$PrismaModel> | $Enums.BillStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBillStatusFilter<$PrismaModel>
    _max?: NestedEnumBillStatusFilter<$PrismaModel>
  }

  export type EnumPaymentMethodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentMethodWithAggregatesFilter<$PrismaModel> | $Enums.PaymentMethod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentMethodFilter<$PrismaModel>
    _max?: NestedEnumPaymentMethodFilter<$PrismaModel>
  }

  export type BillScalarRelationFilter = {
    is?: BillWhereInput
    isNot?: BillWhereInput
  }

  export type ProductScalarRelationFilter = {
    is?: ProductWhereInput
    isNot?: ProductWhereInput
  }

  export type BillItemCountOrderByAggregateInput = {
    id?: SortOrder
    bill_id?: SortOrder
    product_id?: SortOrder
    quantity?: SortOrder
    unit_price?: SortOrder
    total?: SortOrder
  }

  export type BillItemAvgOrderByAggregateInput = {
    id?: SortOrder
    bill_id?: SortOrder
    product_id?: SortOrder
    quantity?: SortOrder
    unit_price?: SortOrder
    total?: SortOrder
  }

  export type BillItemMaxOrderByAggregateInput = {
    id?: SortOrder
    bill_id?: SortOrder
    product_id?: SortOrder
    quantity?: SortOrder
    unit_price?: SortOrder
    total?: SortOrder
  }

  export type BillItemMinOrderByAggregateInput = {
    id?: SortOrder
    bill_id?: SortOrder
    product_id?: SortOrder
    quantity?: SortOrder
    unit_price?: SortOrder
    total?: SortOrder
  }

  export type BillItemSumOrderByAggregateInput = {
    id?: SortOrder
    bill_id?: SortOrder
    product_id?: SortOrder
    quantity?: SortOrder
    unit_price?: SortOrder
    total?: SortOrder
  }

  export type BranchCreateNestedManyWithoutCompanyInput = {
    create?: XOR<BranchCreateWithoutCompanyInput, BranchUncheckedCreateWithoutCompanyInput> | BranchCreateWithoutCompanyInput[] | BranchUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: BranchCreateOrConnectWithoutCompanyInput | BranchCreateOrConnectWithoutCompanyInput[]
    createMany?: BranchCreateManyCompanyInputEnvelope
    connect?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
  }

  export type UserCreateNestedManyWithoutCompanyInput = {
    create?: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput> | UserCreateWithoutCompanyInput[] | UserUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCompanyInput | UserCreateOrConnectWithoutCompanyInput[]
    createMany?: UserCreateManyCompanyInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type ProductCreateNestedManyWithoutCompanyInput = {
    create?: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput> | ProductCreateWithoutCompanyInput[] | ProductUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCompanyInput | ProductCreateOrConnectWithoutCompanyInput[]
    createMany?: ProductCreateManyCompanyInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type BillCreateNestedManyWithoutCompanyInput = {
    create?: XOR<BillCreateWithoutCompanyInput, BillUncheckedCreateWithoutCompanyInput> | BillCreateWithoutCompanyInput[] | BillUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: BillCreateOrConnectWithoutCompanyInput | BillCreateOrConnectWithoutCompanyInput[]
    createMany?: BillCreateManyCompanyInputEnvelope
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
  }

  export type BranchUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<BranchCreateWithoutCompanyInput, BranchUncheckedCreateWithoutCompanyInput> | BranchCreateWithoutCompanyInput[] | BranchUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: BranchCreateOrConnectWithoutCompanyInput | BranchCreateOrConnectWithoutCompanyInput[]
    createMany?: BranchCreateManyCompanyInputEnvelope
    connect?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput> | UserCreateWithoutCompanyInput[] | UserUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCompanyInput | UserCreateOrConnectWithoutCompanyInput[]
    createMany?: UserCreateManyCompanyInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput> | ProductCreateWithoutCompanyInput[] | ProductUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCompanyInput | ProductCreateOrConnectWithoutCompanyInput[]
    createMany?: ProductCreateManyCompanyInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type BillUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<BillCreateWithoutCompanyInput, BillUncheckedCreateWithoutCompanyInput> | BillCreateWithoutCompanyInput[] | BillUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: BillCreateOrConnectWithoutCompanyInput | BillCreateOrConnectWithoutCompanyInput[]
    createMany?: BillCreateManyCompanyInputEnvelope
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BranchUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<BranchCreateWithoutCompanyInput, BranchUncheckedCreateWithoutCompanyInput> | BranchCreateWithoutCompanyInput[] | BranchUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: BranchCreateOrConnectWithoutCompanyInput | BranchCreateOrConnectWithoutCompanyInput[]
    upsert?: BranchUpsertWithWhereUniqueWithoutCompanyInput | BranchUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: BranchCreateManyCompanyInputEnvelope
    set?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
    disconnect?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
    delete?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
    connect?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
    update?: BranchUpdateWithWhereUniqueWithoutCompanyInput | BranchUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: BranchUpdateManyWithWhereWithoutCompanyInput | BranchUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: BranchScalarWhereInput | BranchScalarWhereInput[]
  }

  export type UserUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput> | UserCreateWithoutCompanyInput[] | UserUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCompanyInput | UserCreateOrConnectWithoutCompanyInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCompanyInput | UserUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: UserCreateManyCompanyInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCompanyInput | UserUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCompanyInput | UserUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ProductUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput> | ProductCreateWithoutCompanyInput[] | ProductUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCompanyInput | ProductCreateOrConnectWithoutCompanyInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCompanyInput | ProductUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: ProductCreateManyCompanyInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCompanyInput | ProductUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCompanyInput | ProductUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type BillUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<BillCreateWithoutCompanyInput, BillUncheckedCreateWithoutCompanyInput> | BillCreateWithoutCompanyInput[] | BillUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: BillCreateOrConnectWithoutCompanyInput | BillCreateOrConnectWithoutCompanyInput[]
    upsert?: BillUpsertWithWhereUniqueWithoutCompanyInput | BillUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: BillCreateManyCompanyInputEnvelope
    set?: BillWhereUniqueInput | BillWhereUniqueInput[]
    disconnect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    delete?: BillWhereUniqueInput | BillWhereUniqueInput[]
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    update?: BillUpdateWithWhereUniqueWithoutCompanyInput | BillUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: BillUpdateManyWithWhereWithoutCompanyInput | BillUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: BillScalarWhereInput | BillScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BranchUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<BranchCreateWithoutCompanyInput, BranchUncheckedCreateWithoutCompanyInput> | BranchCreateWithoutCompanyInput[] | BranchUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: BranchCreateOrConnectWithoutCompanyInput | BranchCreateOrConnectWithoutCompanyInput[]
    upsert?: BranchUpsertWithWhereUniqueWithoutCompanyInput | BranchUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: BranchCreateManyCompanyInputEnvelope
    set?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
    disconnect?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
    delete?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
    connect?: BranchWhereUniqueInput | BranchWhereUniqueInput[]
    update?: BranchUpdateWithWhereUniqueWithoutCompanyInput | BranchUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: BranchUpdateManyWithWhereWithoutCompanyInput | BranchUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: BranchScalarWhereInput | BranchScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput> | UserCreateWithoutCompanyInput[] | UserUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCompanyInput | UserCreateOrConnectWithoutCompanyInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCompanyInput | UserUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: UserCreateManyCompanyInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCompanyInput | UserUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCompanyInput | UserUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput> | ProductCreateWithoutCompanyInput[] | ProductUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCompanyInput | ProductCreateOrConnectWithoutCompanyInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCompanyInput | ProductUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: ProductCreateManyCompanyInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCompanyInput | ProductUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCompanyInput | ProductUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type BillUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<BillCreateWithoutCompanyInput, BillUncheckedCreateWithoutCompanyInput> | BillCreateWithoutCompanyInput[] | BillUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: BillCreateOrConnectWithoutCompanyInput | BillCreateOrConnectWithoutCompanyInput[]
    upsert?: BillUpsertWithWhereUniqueWithoutCompanyInput | BillUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: BillCreateManyCompanyInputEnvelope
    set?: BillWhereUniqueInput | BillWhereUniqueInput[]
    disconnect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    delete?: BillWhereUniqueInput | BillWhereUniqueInput[]
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    update?: BillUpdateWithWhereUniqueWithoutCompanyInput | BillUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: BillUpdateManyWithWhereWithoutCompanyInput | BillUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: BillScalarWhereInput | BillScalarWhereInput[]
  }

  export type CompanyCreateNestedOneWithoutBranchesInput = {
    create?: XOR<CompanyCreateWithoutBranchesInput, CompanyUncheckedCreateWithoutBranchesInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutBranchesInput
    connect?: CompanyWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutBranchInput = {
    create?: XOR<UserCreateWithoutBranchInput, UserUncheckedCreateWithoutBranchInput> | UserCreateWithoutBranchInput[] | UserUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: UserCreateOrConnectWithoutBranchInput | UserCreateOrConnectWithoutBranchInput[]
    createMany?: UserCreateManyBranchInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserLogCreateNestedManyWithoutBranchInput = {
    create?: XOR<UserLogCreateWithoutBranchInput, UserLogUncheckedCreateWithoutBranchInput> | UserLogCreateWithoutBranchInput[] | UserLogUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: UserLogCreateOrConnectWithoutBranchInput | UserLogCreateOrConnectWithoutBranchInput[]
    createMany?: UserLogCreateManyBranchInputEnvelope
    connect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
  }

  export type ProductCreateNestedManyWithoutBranchInput = {
    create?: XOR<ProductCreateWithoutBranchInput, ProductUncheckedCreateWithoutBranchInput> | ProductCreateWithoutBranchInput[] | ProductUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutBranchInput | ProductCreateOrConnectWithoutBranchInput[]
    createMany?: ProductCreateManyBranchInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type BillCreateNestedManyWithoutBranchInput = {
    create?: XOR<BillCreateWithoutBranchInput, BillUncheckedCreateWithoutBranchInput> | BillCreateWithoutBranchInput[] | BillUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: BillCreateOrConnectWithoutBranchInput | BillCreateOrConnectWithoutBranchInput[]
    createMany?: BillCreateManyBranchInputEnvelope
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutBranchInput = {
    create?: XOR<UserCreateWithoutBranchInput, UserUncheckedCreateWithoutBranchInput> | UserCreateWithoutBranchInput[] | UserUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: UserCreateOrConnectWithoutBranchInput | UserCreateOrConnectWithoutBranchInput[]
    createMany?: UserCreateManyBranchInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserLogUncheckedCreateNestedManyWithoutBranchInput = {
    create?: XOR<UserLogCreateWithoutBranchInput, UserLogUncheckedCreateWithoutBranchInput> | UserLogCreateWithoutBranchInput[] | UserLogUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: UserLogCreateOrConnectWithoutBranchInput | UserLogCreateOrConnectWithoutBranchInput[]
    createMany?: UserLogCreateManyBranchInputEnvelope
    connect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutBranchInput = {
    create?: XOR<ProductCreateWithoutBranchInput, ProductUncheckedCreateWithoutBranchInput> | ProductCreateWithoutBranchInput[] | ProductUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutBranchInput | ProductCreateOrConnectWithoutBranchInput[]
    createMany?: ProductCreateManyBranchInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type BillUncheckedCreateNestedManyWithoutBranchInput = {
    create?: XOR<BillCreateWithoutBranchInput, BillUncheckedCreateWithoutBranchInput> | BillCreateWithoutBranchInput[] | BillUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: BillCreateOrConnectWithoutBranchInput | BillCreateOrConnectWithoutBranchInput[]
    createMany?: BillCreateManyBranchInputEnvelope
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
  }

  export type CompanyUpdateOneRequiredWithoutBranchesNestedInput = {
    create?: XOR<CompanyCreateWithoutBranchesInput, CompanyUncheckedCreateWithoutBranchesInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutBranchesInput
    upsert?: CompanyUpsertWithoutBranchesInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutBranchesInput, CompanyUpdateWithoutBranchesInput>, CompanyUncheckedUpdateWithoutBranchesInput>
  }

  export type UserUpdateManyWithoutBranchNestedInput = {
    create?: XOR<UserCreateWithoutBranchInput, UserUncheckedCreateWithoutBranchInput> | UserCreateWithoutBranchInput[] | UserUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: UserCreateOrConnectWithoutBranchInput | UserCreateOrConnectWithoutBranchInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutBranchInput | UserUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: UserCreateManyBranchInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutBranchInput | UserUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: UserUpdateManyWithWhereWithoutBranchInput | UserUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserLogUpdateManyWithoutBranchNestedInput = {
    create?: XOR<UserLogCreateWithoutBranchInput, UserLogUncheckedCreateWithoutBranchInput> | UserLogCreateWithoutBranchInput[] | UserLogUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: UserLogCreateOrConnectWithoutBranchInput | UserLogCreateOrConnectWithoutBranchInput[]
    upsert?: UserLogUpsertWithWhereUniqueWithoutBranchInput | UserLogUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: UserLogCreateManyBranchInputEnvelope
    set?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    disconnect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    delete?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    connect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    update?: UserLogUpdateWithWhereUniqueWithoutBranchInput | UserLogUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: UserLogUpdateManyWithWhereWithoutBranchInput | UserLogUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: UserLogScalarWhereInput | UserLogScalarWhereInput[]
  }

  export type ProductUpdateManyWithoutBranchNestedInput = {
    create?: XOR<ProductCreateWithoutBranchInput, ProductUncheckedCreateWithoutBranchInput> | ProductCreateWithoutBranchInput[] | ProductUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutBranchInput | ProductCreateOrConnectWithoutBranchInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutBranchInput | ProductUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: ProductCreateManyBranchInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutBranchInput | ProductUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutBranchInput | ProductUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type BillUpdateManyWithoutBranchNestedInput = {
    create?: XOR<BillCreateWithoutBranchInput, BillUncheckedCreateWithoutBranchInput> | BillCreateWithoutBranchInput[] | BillUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: BillCreateOrConnectWithoutBranchInput | BillCreateOrConnectWithoutBranchInput[]
    upsert?: BillUpsertWithWhereUniqueWithoutBranchInput | BillUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: BillCreateManyBranchInputEnvelope
    set?: BillWhereUniqueInput | BillWhereUniqueInput[]
    disconnect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    delete?: BillWhereUniqueInput | BillWhereUniqueInput[]
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    update?: BillUpdateWithWhereUniqueWithoutBranchInput | BillUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: BillUpdateManyWithWhereWithoutBranchInput | BillUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: BillScalarWhereInput | BillScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutBranchNestedInput = {
    create?: XOR<UserCreateWithoutBranchInput, UserUncheckedCreateWithoutBranchInput> | UserCreateWithoutBranchInput[] | UserUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: UserCreateOrConnectWithoutBranchInput | UserCreateOrConnectWithoutBranchInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutBranchInput | UserUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: UserCreateManyBranchInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutBranchInput | UserUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: UserUpdateManyWithWhereWithoutBranchInput | UserUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserLogUncheckedUpdateManyWithoutBranchNestedInput = {
    create?: XOR<UserLogCreateWithoutBranchInput, UserLogUncheckedCreateWithoutBranchInput> | UserLogCreateWithoutBranchInput[] | UserLogUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: UserLogCreateOrConnectWithoutBranchInput | UserLogCreateOrConnectWithoutBranchInput[]
    upsert?: UserLogUpsertWithWhereUniqueWithoutBranchInput | UserLogUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: UserLogCreateManyBranchInputEnvelope
    set?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    disconnect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    delete?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    connect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    update?: UserLogUpdateWithWhereUniqueWithoutBranchInput | UserLogUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: UserLogUpdateManyWithWhereWithoutBranchInput | UserLogUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: UserLogScalarWhereInput | UserLogScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutBranchNestedInput = {
    create?: XOR<ProductCreateWithoutBranchInput, ProductUncheckedCreateWithoutBranchInput> | ProductCreateWithoutBranchInput[] | ProductUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutBranchInput | ProductCreateOrConnectWithoutBranchInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutBranchInput | ProductUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: ProductCreateManyBranchInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutBranchInput | ProductUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutBranchInput | ProductUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type BillUncheckedUpdateManyWithoutBranchNestedInput = {
    create?: XOR<BillCreateWithoutBranchInput, BillUncheckedCreateWithoutBranchInput> | BillCreateWithoutBranchInput[] | BillUncheckedCreateWithoutBranchInput[]
    connectOrCreate?: BillCreateOrConnectWithoutBranchInput | BillCreateOrConnectWithoutBranchInput[]
    upsert?: BillUpsertWithWhereUniqueWithoutBranchInput | BillUpsertWithWhereUniqueWithoutBranchInput[]
    createMany?: BillCreateManyBranchInputEnvelope
    set?: BillWhereUniqueInput | BillWhereUniqueInput[]
    disconnect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    delete?: BillWhereUniqueInput | BillWhereUniqueInput[]
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    update?: BillUpdateWithWhereUniqueWithoutBranchInput | BillUpdateWithWhereUniqueWithoutBranchInput[]
    updateMany?: BillUpdateManyWithWhereWithoutBranchInput | BillUpdateManyWithWhereWithoutBranchInput[]
    deleteMany?: BillScalarWhereInput | BillScalarWhereInput[]
  }

  export type CompanyCreateNestedOneWithoutUsersInput = {
    create?: XOR<CompanyCreateWithoutUsersInput, CompanyUncheckedCreateWithoutUsersInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutUsersInput
    connect?: CompanyWhereUniqueInput
  }

  export type BranchCreateNestedOneWithoutUsersInput = {
    create?: XOR<BranchCreateWithoutUsersInput, BranchUncheckedCreateWithoutUsersInput>
    connectOrCreate?: BranchCreateOrConnectWithoutUsersInput
    connect?: BranchWhereUniqueInput
  }

  export type BillCreateNestedManyWithoutCashierInput = {
    create?: XOR<BillCreateWithoutCashierInput, BillUncheckedCreateWithoutCashierInput> | BillCreateWithoutCashierInput[] | BillUncheckedCreateWithoutCashierInput[]
    connectOrCreate?: BillCreateOrConnectWithoutCashierInput | BillCreateOrConnectWithoutCashierInput[]
    createMany?: BillCreateManyCashierInputEnvelope
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
  }

  export type UserInfoCreateNestedOneWithoutUserInput = {
    create?: XOR<UserInfoCreateWithoutUserInput, UserInfoUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserInfoCreateOrConnectWithoutUserInput
    connect?: UserInfoWhereUniqueInput
  }

  export type UserRoleCreateNestedManyWithoutUserInput = {
    create?: XOR<UserRoleCreateWithoutUserInput, UserRoleUncheckedCreateWithoutUserInput> | UserRoleCreateWithoutUserInput[] | UserRoleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRoleCreateOrConnectWithoutUserInput | UserRoleCreateOrConnectWithoutUserInput[]
    createMany?: UserRoleCreateManyUserInputEnvelope
    connect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
  }

  export type UserLogCreateNestedManyWithoutUserInput = {
    create?: XOR<UserLogCreateWithoutUserInput, UserLogUncheckedCreateWithoutUserInput> | UserLogCreateWithoutUserInput[] | UserLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserLogCreateOrConnectWithoutUserInput | UserLogCreateOrConnectWithoutUserInput[]
    createMany?: UserLogCreateManyUserInputEnvelope
    connect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
  }

  export type BillUncheckedCreateNestedManyWithoutCashierInput = {
    create?: XOR<BillCreateWithoutCashierInput, BillUncheckedCreateWithoutCashierInput> | BillCreateWithoutCashierInput[] | BillUncheckedCreateWithoutCashierInput[]
    connectOrCreate?: BillCreateOrConnectWithoutCashierInput | BillCreateOrConnectWithoutCashierInput[]
    createMany?: BillCreateManyCashierInputEnvelope
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
  }

  export type UserInfoUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<UserInfoCreateWithoutUserInput, UserInfoUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserInfoCreateOrConnectWithoutUserInput
    connect?: UserInfoWhereUniqueInput
  }

  export type UserRoleUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserRoleCreateWithoutUserInput, UserRoleUncheckedCreateWithoutUserInput> | UserRoleCreateWithoutUserInput[] | UserRoleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRoleCreateOrConnectWithoutUserInput | UserRoleCreateOrConnectWithoutUserInput[]
    createMany?: UserRoleCreateManyUserInputEnvelope
    connect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
  }

  export type UserLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserLogCreateWithoutUserInput, UserLogUncheckedCreateWithoutUserInput> | UserLogCreateWithoutUserInput[] | UserLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserLogCreateOrConnectWithoutUserInput | UserLogCreateOrConnectWithoutUserInput[]
    createMany?: UserLogCreateManyUserInputEnvelope
    connect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
  }

  export type EnumUserTypeFieldUpdateOperationsInput = {
    set?: $Enums.UserType
  }

  export type EnumUserStatusFieldUpdateOperationsInput = {
    set?: $Enums.UserStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type CompanyUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<CompanyCreateWithoutUsersInput, CompanyUncheckedCreateWithoutUsersInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutUsersInput
    upsert?: CompanyUpsertWithoutUsersInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutUsersInput, CompanyUpdateWithoutUsersInput>, CompanyUncheckedUpdateWithoutUsersInput>
  }

  export type BranchUpdateOneWithoutUsersNestedInput = {
    create?: XOR<BranchCreateWithoutUsersInput, BranchUncheckedCreateWithoutUsersInput>
    connectOrCreate?: BranchCreateOrConnectWithoutUsersInput
    upsert?: BranchUpsertWithoutUsersInput
    disconnect?: BranchWhereInput | boolean
    delete?: BranchWhereInput | boolean
    connect?: BranchWhereUniqueInput
    update?: XOR<XOR<BranchUpdateToOneWithWhereWithoutUsersInput, BranchUpdateWithoutUsersInput>, BranchUncheckedUpdateWithoutUsersInput>
  }

  export type BillUpdateManyWithoutCashierNestedInput = {
    create?: XOR<BillCreateWithoutCashierInput, BillUncheckedCreateWithoutCashierInput> | BillCreateWithoutCashierInput[] | BillUncheckedCreateWithoutCashierInput[]
    connectOrCreate?: BillCreateOrConnectWithoutCashierInput | BillCreateOrConnectWithoutCashierInput[]
    upsert?: BillUpsertWithWhereUniqueWithoutCashierInput | BillUpsertWithWhereUniqueWithoutCashierInput[]
    createMany?: BillCreateManyCashierInputEnvelope
    set?: BillWhereUniqueInput | BillWhereUniqueInput[]
    disconnect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    delete?: BillWhereUniqueInput | BillWhereUniqueInput[]
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    update?: BillUpdateWithWhereUniqueWithoutCashierInput | BillUpdateWithWhereUniqueWithoutCashierInput[]
    updateMany?: BillUpdateManyWithWhereWithoutCashierInput | BillUpdateManyWithWhereWithoutCashierInput[]
    deleteMany?: BillScalarWhereInput | BillScalarWhereInput[]
  }

  export type UserInfoUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserInfoCreateWithoutUserInput, UserInfoUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserInfoCreateOrConnectWithoutUserInput
    upsert?: UserInfoUpsertWithoutUserInput
    disconnect?: UserInfoWhereInput | boolean
    delete?: UserInfoWhereInput | boolean
    connect?: UserInfoWhereUniqueInput
    update?: XOR<XOR<UserInfoUpdateToOneWithWhereWithoutUserInput, UserInfoUpdateWithoutUserInput>, UserInfoUncheckedUpdateWithoutUserInput>
  }

  export type UserRoleUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserRoleCreateWithoutUserInput, UserRoleUncheckedCreateWithoutUserInput> | UserRoleCreateWithoutUserInput[] | UserRoleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRoleCreateOrConnectWithoutUserInput | UserRoleCreateOrConnectWithoutUserInput[]
    upsert?: UserRoleUpsertWithWhereUniqueWithoutUserInput | UserRoleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserRoleCreateManyUserInputEnvelope
    set?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    disconnect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    delete?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    connect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    update?: UserRoleUpdateWithWhereUniqueWithoutUserInput | UserRoleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserRoleUpdateManyWithWhereWithoutUserInput | UserRoleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserRoleScalarWhereInput | UserRoleScalarWhereInput[]
  }

  export type UserLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserLogCreateWithoutUserInput, UserLogUncheckedCreateWithoutUserInput> | UserLogCreateWithoutUserInput[] | UserLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserLogCreateOrConnectWithoutUserInput | UserLogCreateOrConnectWithoutUserInput[]
    upsert?: UserLogUpsertWithWhereUniqueWithoutUserInput | UserLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserLogCreateManyUserInputEnvelope
    set?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    disconnect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    delete?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    connect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    update?: UserLogUpdateWithWhereUniqueWithoutUserInput | UserLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserLogUpdateManyWithWhereWithoutUserInput | UserLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserLogScalarWhereInput | UserLogScalarWhereInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BillUncheckedUpdateManyWithoutCashierNestedInput = {
    create?: XOR<BillCreateWithoutCashierInput, BillUncheckedCreateWithoutCashierInput> | BillCreateWithoutCashierInput[] | BillUncheckedCreateWithoutCashierInput[]
    connectOrCreate?: BillCreateOrConnectWithoutCashierInput | BillCreateOrConnectWithoutCashierInput[]
    upsert?: BillUpsertWithWhereUniqueWithoutCashierInput | BillUpsertWithWhereUniqueWithoutCashierInput[]
    createMany?: BillCreateManyCashierInputEnvelope
    set?: BillWhereUniqueInput | BillWhereUniqueInput[]
    disconnect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    delete?: BillWhereUniqueInput | BillWhereUniqueInput[]
    connect?: BillWhereUniqueInput | BillWhereUniqueInput[]
    update?: BillUpdateWithWhereUniqueWithoutCashierInput | BillUpdateWithWhereUniqueWithoutCashierInput[]
    updateMany?: BillUpdateManyWithWhereWithoutCashierInput | BillUpdateManyWithWhereWithoutCashierInput[]
    deleteMany?: BillScalarWhereInput | BillScalarWhereInput[]
  }

  export type UserInfoUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserInfoCreateWithoutUserInput, UserInfoUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserInfoCreateOrConnectWithoutUserInput
    upsert?: UserInfoUpsertWithoutUserInput
    disconnect?: UserInfoWhereInput | boolean
    delete?: UserInfoWhereInput | boolean
    connect?: UserInfoWhereUniqueInput
    update?: XOR<XOR<UserInfoUpdateToOneWithWhereWithoutUserInput, UserInfoUpdateWithoutUserInput>, UserInfoUncheckedUpdateWithoutUserInput>
  }

  export type UserRoleUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserRoleCreateWithoutUserInput, UserRoleUncheckedCreateWithoutUserInput> | UserRoleCreateWithoutUserInput[] | UserRoleUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRoleCreateOrConnectWithoutUserInput | UserRoleCreateOrConnectWithoutUserInput[]
    upsert?: UserRoleUpsertWithWhereUniqueWithoutUserInput | UserRoleUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserRoleCreateManyUserInputEnvelope
    set?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    disconnect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    delete?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    connect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    update?: UserRoleUpdateWithWhereUniqueWithoutUserInput | UserRoleUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserRoleUpdateManyWithWhereWithoutUserInput | UserRoleUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserRoleScalarWhereInput | UserRoleScalarWhereInput[]
  }

  export type UserLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserLogCreateWithoutUserInput, UserLogUncheckedCreateWithoutUserInput> | UserLogCreateWithoutUserInput[] | UserLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserLogCreateOrConnectWithoutUserInput | UserLogCreateOrConnectWithoutUserInput[]
    upsert?: UserLogUpsertWithWhereUniqueWithoutUserInput | UserLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserLogCreateManyUserInputEnvelope
    set?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    disconnect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    delete?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    connect?: UserLogWhereUniqueInput | UserLogWhereUniqueInput[]
    update?: UserLogUpdateWithWhereUniqueWithoutUserInput | UserLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserLogUpdateManyWithWhereWithoutUserInput | UserLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserLogScalarWhereInput | UserLogScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutInfoInput = {
    create?: XOR<UserCreateWithoutInfoInput, UserUncheckedCreateWithoutInfoInput>
    connectOrCreate?: UserCreateOrConnectWithoutInfoInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutInfoNestedInput = {
    create?: XOR<UserCreateWithoutInfoInput, UserUncheckedCreateWithoutInfoInput>
    connectOrCreate?: UserCreateOrConnectWithoutInfoInput
    upsert?: UserUpsertWithoutInfoInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutInfoInput, UserUpdateWithoutInfoInput>, UserUncheckedUpdateWithoutInfoInput>
  }

  export type UserRoleCreateNestedManyWithoutRoleInput = {
    create?: XOR<UserRoleCreateWithoutRoleInput, UserRoleUncheckedCreateWithoutRoleInput> | UserRoleCreateWithoutRoleInput[] | UserRoleUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: UserRoleCreateOrConnectWithoutRoleInput | UserRoleCreateOrConnectWithoutRoleInput[]
    createMany?: UserRoleCreateManyRoleInputEnvelope
    connect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
  }

  export type RoleAuthorityCreateNestedManyWithoutRoleInput = {
    create?: XOR<RoleAuthorityCreateWithoutRoleInput, RoleAuthorityUncheckedCreateWithoutRoleInput> | RoleAuthorityCreateWithoutRoleInput[] | RoleAuthorityUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: RoleAuthorityCreateOrConnectWithoutRoleInput | RoleAuthorityCreateOrConnectWithoutRoleInput[]
    createMany?: RoleAuthorityCreateManyRoleInputEnvelope
    connect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
  }

  export type UserRoleUncheckedCreateNestedManyWithoutRoleInput = {
    create?: XOR<UserRoleCreateWithoutRoleInput, UserRoleUncheckedCreateWithoutRoleInput> | UserRoleCreateWithoutRoleInput[] | UserRoleUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: UserRoleCreateOrConnectWithoutRoleInput | UserRoleCreateOrConnectWithoutRoleInput[]
    createMany?: UserRoleCreateManyRoleInputEnvelope
    connect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
  }

  export type RoleAuthorityUncheckedCreateNestedManyWithoutRoleInput = {
    create?: XOR<RoleAuthorityCreateWithoutRoleInput, RoleAuthorityUncheckedCreateWithoutRoleInput> | RoleAuthorityCreateWithoutRoleInput[] | RoleAuthorityUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: RoleAuthorityCreateOrConnectWithoutRoleInput | RoleAuthorityCreateOrConnectWithoutRoleInput[]
    createMany?: RoleAuthorityCreateManyRoleInputEnvelope
    connect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
  }

  export type UserRoleUpdateManyWithoutRoleNestedInput = {
    create?: XOR<UserRoleCreateWithoutRoleInput, UserRoleUncheckedCreateWithoutRoleInput> | UserRoleCreateWithoutRoleInput[] | UserRoleUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: UserRoleCreateOrConnectWithoutRoleInput | UserRoleCreateOrConnectWithoutRoleInput[]
    upsert?: UserRoleUpsertWithWhereUniqueWithoutRoleInput | UserRoleUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: UserRoleCreateManyRoleInputEnvelope
    set?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    disconnect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    delete?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    connect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    update?: UserRoleUpdateWithWhereUniqueWithoutRoleInput | UserRoleUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: UserRoleUpdateManyWithWhereWithoutRoleInput | UserRoleUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: UserRoleScalarWhereInput | UserRoleScalarWhereInput[]
  }

  export type RoleAuthorityUpdateManyWithoutRoleNestedInput = {
    create?: XOR<RoleAuthorityCreateWithoutRoleInput, RoleAuthorityUncheckedCreateWithoutRoleInput> | RoleAuthorityCreateWithoutRoleInput[] | RoleAuthorityUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: RoleAuthorityCreateOrConnectWithoutRoleInput | RoleAuthorityCreateOrConnectWithoutRoleInput[]
    upsert?: RoleAuthorityUpsertWithWhereUniqueWithoutRoleInput | RoleAuthorityUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: RoleAuthorityCreateManyRoleInputEnvelope
    set?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    disconnect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    delete?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    connect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    update?: RoleAuthorityUpdateWithWhereUniqueWithoutRoleInput | RoleAuthorityUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: RoleAuthorityUpdateManyWithWhereWithoutRoleInput | RoleAuthorityUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: RoleAuthorityScalarWhereInput | RoleAuthorityScalarWhereInput[]
  }

  export type UserRoleUncheckedUpdateManyWithoutRoleNestedInput = {
    create?: XOR<UserRoleCreateWithoutRoleInput, UserRoleUncheckedCreateWithoutRoleInput> | UserRoleCreateWithoutRoleInput[] | UserRoleUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: UserRoleCreateOrConnectWithoutRoleInput | UserRoleCreateOrConnectWithoutRoleInput[]
    upsert?: UserRoleUpsertWithWhereUniqueWithoutRoleInput | UserRoleUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: UserRoleCreateManyRoleInputEnvelope
    set?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    disconnect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    delete?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    connect?: UserRoleWhereUniqueInput | UserRoleWhereUniqueInput[]
    update?: UserRoleUpdateWithWhereUniqueWithoutRoleInput | UserRoleUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: UserRoleUpdateManyWithWhereWithoutRoleInput | UserRoleUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: UserRoleScalarWhereInput | UserRoleScalarWhereInput[]
  }

  export type RoleAuthorityUncheckedUpdateManyWithoutRoleNestedInput = {
    create?: XOR<RoleAuthorityCreateWithoutRoleInput, RoleAuthorityUncheckedCreateWithoutRoleInput> | RoleAuthorityCreateWithoutRoleInput[] | RoleAuthorityUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: RoleAuthorityCreateOrConnectWithoutRoleInput | RoleAuthorityCreateOrConnectWithoutRoleInput[]
    upsert?: RoleAuthorityUpsertWithWhereUniqueWithoutRoleInput | RoleAuthorityUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: RoleAuthorityCreateManyRoleInputEnvelope
    set?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    disconnect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    delete?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    connect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    update?: RoleAuthorityUpdateWithWhereUniqueWithoutRoleInput | RoleAuthorityUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: RoleAuthorityUpdateManyWithWhereWithoutRoleInput | RoleAuthorityUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: RoleAuthorityScalarWhereInput | RoleAuthorityScalarWhereInput[]
  }

  export type RoleAuthorityCreateNestedManyWithoutAuthorityInput = {
    create?: XOR<RoleAuthorityCreateWithoutAuthorityInput, RoleAuthorityUncheckedCreateWithoutAuthorityInput> | RoleAuthorityCreateWithoutAuthorityInput[] | RoleAuthorityUncheckedCreateWithoutAuthorityInput[]
    connectOrCreate?: RoleAuthorityCreateOrConnectWithoutAuthorityInput | RoleAuthorityCreateOrConnectWithoutAuthorityInput[]
    createMany?: RoleAuthorityCreateManyAuthorityInputEnvelope
    connect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
  }

  export type RoleAuthorityUncheckedCreateNestedManyWithoutAuthorityInput = {
    create?: XOR<RoleAuthorityCreateWithoutAuthorityInput, RoleAuthorityUncheckedCreateWithoutAuthorityInput> | RoleAuthorityCreateWithoutAuthorityInput[] | RoleAuthorityUncheckedCreateWithoutAuthorityInput[]
    connectOrCreate?: RoleAuthorityCreateOrConnectWithoutAuthorityInput | RoleAuthorityCreateOrConnectWithoutAuthorityInput[]
    createMany?: RoleAuthorityCreateManyAuthorityInputEnvelope
    connect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
  }

  export type RoleAuthorityUpdateManyWithoutAuthorityNestedInput = {
    create?: XOR<RoleAuthorityCreateWithoutAuthorityInput, RoleAuthorityUncheckedCreateWithoutAuthorityInput> | RoleAuthorityCreateWithoutAuthorityInput[] | RoleAuthorityUncheckedCreateWithoutAuthorityInput[]
    connectOrCreate?: RoleAuthorityCreateOrConnectWithoutAuthorityInput | RoleAuthorityCreateOrConnectWithoutAuthorityInput[]
    upsert?: RoleAuthorityUpsertWithWhereUniqueWithoutAuthorityInput | RoleAuthorityUpsertWithWhereUniqueWithoutAuthorityInput[]
    createMany?: RoleAuthorityCreateManyAuthorityInputEnvelope
    set?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    disconnect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    delete?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    connect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    update?: RoleAuthorityUpdateWithWhereUniqueWithoutAuthorityInput | RoleAuthorityUpdateWithWhereUniqueWithoutAuthorityInput[]
    updateMany?: RoleAuthorityUpdateManyWithWhereWithoutAuthorityInput | RoleAuthorityUpdateManyWithWhereWithoutAuthorityInput[]
    deleteMany?: RoleAuthorityScalarWhereInput | RoleAuthorityScalarWhereInput[]
  }

  export type RoleAuthorityUncheckedUpdateManyWithoutAuthorityNestedInput = {
    create?: XOR<RoleAuthorityCreateWithoutAuthorityInput, RoleAuthorityUncheckedCreateWithoutAuthorityInput> | RoleAuthorityCreateWithoutAuthorityInput[] | RoleAuthorityUncheckedCreateWithoutAuthorityInput[]
    connectOrCreate?: RoleAuthorityCreateOrConnectWithoutAuthorityInput | RoleAuthorityCreateOrConnectWithoutAuthorityInput[]
    upsert?: RoleAuthorityUpsertWithWhereUniqueWithoutAuthorityInput | RoleAuthorityUpsertWithWhereUniqueWithoutAuthorityInput[]
    createMany?: RoleAuthorityCreateManyAuthorityInputEnvelope
    set?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    disconnect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    delete?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    connect?: RoleAuthorityWhereUniqueInput | RoleAuthorityWhereUniqueInput[]
    update?: RoleAuthorityUpdateWithWhereUniqueWithoutAuthorityInput | RoleAuthorityUpdateWithWhereUniqueWithoutAuthorityInput[]
    updateMany?: RoleAuthorityUpdateManyWithWhereWithoutAuthorityInput | RoleAuthorityUpdateManyWithWhereWithoutAuthorityInput[]
    deleteMany?: RoleAuthorityScalarWhereInput | RoleAuthorityScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutUserRolesInput = {
    create?: XOR<UserCreateWithoutUserRolesInput, UserUncheckedCreateWithoutUserRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserRolesInput
    connect?: UserWhereUniqueInput
  }

  export type RoleCreateNestedOneWithoutUserRolesInput = {
    create?: XOR<RoleCreateWithoutUserRolesInput, RoleUncheckedCreateWithoutUserRolesInput>
    connectOrCreate?: RoleCreateOrConnectWithoutUserRolesInput
    connect?: RoleWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutUserRolesNestedInput = {
    create?: XOR<UserCreateWithoutUserRolesInput, UserUncheckedCreateWithoutUserRolesInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserRolesInput
    upsert?: UserUpsertWithoutUserRolesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserRolesInput, UserUpdateWithoutUserRolesInput>, UserUncheckedUpdateWithoutUserRolesInput>
  }

  export type RoleUpdateOneRequiredWithoutUserRolesNestedInput = {
    create?: XOR<RoleCreateWithoutUserRolesInput, RoleUncheckedCreateWithoutUserRolesInput>
    connectOrCreate?: RoleCreateOrConnectWithoutUserRolesInput
    upsert?: RoleUpsertWithoutUserRolesInput
    connect?: RoleWhereUniqueInput
    update?: XOR<XOR<RoleUpdateToOneWithWhereWithoutUserRolesInput, RoleUpdateWithoutUserRolesInput>, RoleUncheckedUpdateWithoutUserRolesInput>
  }

  export type RoleCreateNestedOneWithoutAuthoritiesInput = {
    create?: XOR<RoleCreateWithoutAuthoritiesInput, RoleUncheckedCreateWithoutAuthoritiesInput>
    connectOrCreate?: RoleCreateOrConnectWithoutAuthoritiesInput
    connect?: RoleWhereUniqueInput
  }

  export type AuthorityCreateNestedOneWithoutRolesInput = {
    create?: XOR<AuthorityCreateWithoutRolesInput, AuthorityUncheckedCreateWithoutRolesInput>
    connectOrCreate?: AuthorityCreateOrConnectWithoutRolesInput
    connect?: AuthorityWhereUniqueInput
  }

  export type RoleUpdateOneRequiredWithoutAuthoritiesNestedInput = {
    create?: XOR<RoleCreateWithoutAuthoritiesInput, RoleUncheckedCreateWithoutAuthoritiesInput>
    connectOrCreate?: RoleCreateOrConnectWithoutAuthoritiesInput
    upsert?: RoleUpsertWithoutAuthoritiesInput
    connect?: RoleWhereUniqueInput
    update?: XOR<XOR<RoleUpdateToOneWithWhereWithoutAuthoritiesInput, RoleUpdateWithoutAuthoritiesInput>, RoleUncheckedUpdateWithoutAuthoritiesInput>
  }

  export type AuthorityUpdateOneRequiredWithoutRolesNestedInput = {
    create?: XOR<AuthorityCreateWithoutRolesInput, AuthorityUncheckedCreateWithoutRolesInput>
    connectOrCreate?: AuthorityCreateOrConnectWithoutRolesInput
    upsert?: AuthorityUpsertWithoutRolesInput
    connect?: AuthorityWhereUniqueInput
    update?: XOR<XOR<AuthorityUpdateToOneWithWhereWithoutRolesInput, AuthorityUpdateWithoutRolesInput>, AuthorityUncheckedUpdateWithoutRolesInput>
  }

  export type UserCreateNestedOneWithoutLogsInput = {
    create?: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLogsInput
    connect?: UserWhereUniqueInput
  }

  export type BranchCreateNestedOneWithoutLogsInput = {
    create?: XOR<BranchCreateWithoutLogsInput, BranchUncheckedCreateWithoutLogsInput>
    connectOrCreate?: BranchCreateOrConnectWithoutLogsInput
    connect?: BranchWhereUniqueInput
  }

  export type EnumLogActionFieldUpdateOperationsInput = {
    set?: $Enums.LogAction
  }

  export type EnumLogStatusFieldUpdateOperationsInput = {
    set?: $Enums.LogStatus
  }

  export type UserUpdateOneRequiredWithoutLogsNestedInput = {
    create?: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutLogsInput
    upsert?: UserUpsertWithoutLogsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutLogsInput, UserUpdateWithoutLogsInput>, UserUncheckedUpdateWithoutLogsInput>
  }

  export type BranchUpdateOneWithoutLogsNestedInput = {
    create?: XOR<BranchCreateWithoutLogsInput, BranchUncheckedCreateWithoutLogsInput>
    connectOrCreate?: BranchCreateOrConnectWithoutLogsInput
    upsert?: BranchUpsertWithoutLogsInput
    disconnect?: BranchWhereInput | boolean
    delete?: BranchWhereInput | boolean
    connect?: BranchWhereUniqueInput
    update?: XOR<XOR<BranchUpdateToOneWithWhereWithoutLogsInput, BranchUpdateWithoutLogsInput>, BranchUncheckedUpdateWithoutLogsInput>
  }

  export type BillItemCreateNestedManyWithoutProductInput = {
    create?: XOR<BillItemCreateWithoutProductInput, BillItemUncheckedCreateWithoutProductInput> | BillItemCreateWithoutProductInput[] | BillItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: BillItemCreateOrConnectWithoutProductInput | BillItemCreateOrConnectWithoutProductInput[]
    createMany?: BillItemCreateManyProductInputEnvelope
    connect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
  }

  export type CompanyCreateNestedOneWithoutProductsInput = {
    create?: XOR<CompanyCreateWithoutProductsInput, CompanyUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutProductsInput
    connect?: CompanyWhereUniqueInput
  }

  export type BranchCreateNestedOneWithoutProductsInput = {
    create?: XOR<BranchCreateWithoutProductsInput, BranchUncheckedCreateWithoutProductsInput>
    connectOrCreate?: BranchCreateOrConnectWithoutProductsInput
    connect?: BranchWhereUniqueInput
  }

  export type BillItemUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<BillItemCreateWithoutProductInput, BillItemUncheckedCreateWithoutProductInput> | BillItemCreateWithoutProductInput[] | BillItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: BillItemCreateOrConnectWithoutProductInput | BillItemCreateOrConnectWithoutProductInput[]
    createMany?: BillItemCreateManyProductInputEnvelope
    connect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type BillItemUpdateManyWithoutProductNestedInput = {
    create?: XOR<BillItemCreateWithoutProductInput, BillItemUncheckedCreateWithoutProductInput> | BillItemCreateWithoutProductInput[] | BillItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: BillItemCreateOrConnectWithoutProductInput | BillItemCreateOrConnectWithoutProductInput[]
    upsert?: BillItemUpsertWithWhereUniqueWithoutProductInput | BillItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: BillItemCreateManyProductInputEnvelope
    set?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    disconnect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    delete?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    connect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    update?: BillItemUpdateWithWhereUniqueWithoutProductInput | BillItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: BillItemUpdateManyWithWhereWithoutProductInput | BillItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: BillItemScalarWhereInput | BillItemScalarWhereInput[]
  }

  export type CompanyUpdateOneRequiredWithoutProductsNestedInput = {
    create?: XOR<CompanyCreateWithoutProductsInput, CompanyUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutProductsInput
    upsert?: CompanyUpsertWithoutProductsInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutProductsInput, CompanyUpdateWithoutProductsInput>, CompanyUncheckedUpdateWithoutProductsInput>
  }

  export type BranchUpdateOneWithoutProductsNestedInput = {
    create?: XOR<BranchCreateWithoutProductsInput, BranchUncheckedCreateWithoutProductsInput>
    connectOrCreate?: BranchCreateOrConnectWithoutProductsInput
    upsert?: BranchUpsertWithoutProductsInput
    disconnect?: BranchWhereInput | boolean
    delete?: BranchWhereInput | boolean
    connect?: BranchWhereUniqueInput
    update?: XOR<XOR<BranchUpdateToOneWithWhereWithoutProductsInput, BranchUpdateWithoutProductsInput>, BranchUncheckedUpdateWithoutProductsInput>
  }

  export type BillItemUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<BillItemCreateWithoutProductInput, BillItemUncheckedCreateWithoutProductInput> | BillItemCreateWithoutProductInput[] | BillItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: BillItemCreateOrConnectWithoutProductInput | BillItemCreateOrConnectWithoutProductInput[]
    upsert?: BillItemUpsertWithWhereUniqueWithoutProductInput | BillItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: BillItemCreateManyProductInputEnvelope
    set?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    disconnect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    delete?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    connect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    update?: BillItemUpdateWithWhereUniqueWithoutProductInput | BillItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: BillItemUpdateManyWithWhereWithoutProductInput | BillItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: BillItemScalarWhereInput | BillItemScalarWhereInput[]
  }

  export type CompanyCreateNestedOneWithoutBillsInput = {
    create?: XOR<CompanyCreateWithoutBillsInput, CompanyUncheckedCreateWithoutBillsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutBillsInput
    connect?: CompanyWhereUniqueInput
  }

  export type BranchCreateNestedOneWithoutBillsInput = {
    create?: XOR<BranchCreateWithoutBillsInput, BranchUncheckedCreateWithoutBillsInput>
    connectOrCreate?: BranchCreateOrConnectWithoutBillsInput
    connect?: BranchWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutBillsInput = {
    create?: XOR<UserCreateWithoutBillsInput, UserUncheckedCreateWithoutBillsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBillsInput
    connect?: UserWhereUniqueInput
  }

  export type BillItemCreateNestedManyWithoutBillInput = {
    create?: XOR<BillItemCreateWithoutBillInput, BillItemUncheckedCreateWithoutBillInput> | BillItemCreateWithoutBillInput[] | BillItemUncheckedCreateWithoutBillInput[]
    connectOrCreate?: BillItemCreateOrConnectWithoutBillInput | BillItemCreateOrConnectWithoutBillInput[]
    createMany?: BillItemCreateManyBillInputEnvelope
    connect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
  }

  export type BillItemUncheckedCreateNestedManyWithoutBillInput = {
    create?: XOR<BillItemCreateWithoutBillInput, BillItemUncheckedCreateWithoutBillInput> | BillItemCreateWithoutBillInput[] | BillItemUncheckedCreateWithoutBillInput[]
    connectOrCreate?: BillItemCreateOrConnectWithoutBillInput | BillItemCreateOrConnectWithoutBillInput[]
    createMany?: BillItemCreateManyBillInputEnvelope
    connect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
  }

  export type EnumBillStatusFieldUpdateOperationsInput = {
    set?: $Enums.BillStatus
  }

  export type EnumPaymentMethodFieldUpdateOperationsInput = {
    set?: $Enums.PaymentMethod
  }

  export type CompanyUpdateOneRequiredWithoutBillsNestedInput = {
    create?: XOR<CompanyCreateWithoutBillsInput, CompanyUncheckedCreateWithoutBillsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutBillsInput
    upsert?: CompanyUpsertWithoutBillsInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutBillsInput, CompanyUpdateWithoutBillsInput>, CompanyUncheckedUpdateWithoutBillsInput>
  }

  export type BranchUpdateOneRequiredWithoutBillsNestedInput = {
    create?: XOR<BranchCreateWithoutBillsInput, BranchUncheckedCreateWithoutBillsInput>
    connectOrCreate?: BranchCreateOrConnectWithoutBillsInput
    upsert?: BranchUpsertWithoutBillsInput
    connect?: BranchWhereUniqueInput
    update?: XOR<XOR<BranchUpdateToOneWithWhereWithoutBillsInput, BranchUpdateWithoutBillsInput>, BranchUncheckedUpdateWithoutBillsInput>
  }

  export type UserUpdateOneRequiredWithoutBillsNestedInput = {
    create?: XOR<UserCreateWithoutBillsInput, UserUncheckedCreateWithoutBillsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBillsInput
    upsert?: UserUpsertWithoutBillsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutBillsInput, UserUpdateWithoutBillsInput>, UserUncheckedUpdateWithoutBillsInput>
  }

  export type BillItemUpdateManyWithoutBillNestedInput = {
    create?: XOR<BillItemCreateWithoutBillInput, BillItemUncheckedCreateWithoutBillInput> | BillItemCreateWithoutBillInput[] | BillItemUncheckedCreateWithoutBillInput[]
    connectOrCreate?: BillItemCreateOrConnectWithoutBillInput | BillItemCreateOrConnectWithoutBillInput[]
    upsert?: BillItemUpsertWithWhereUniqueWithoutBillInput | BillItemUpsertWithWhereUniqueWithoutBillInput[]
    createMany?: BillItemCreateManyBillInputEnvelope
    set?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    disconnect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    delete?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    connect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    update?: BillItemUpdateWithWhereUniqueWithoutBillInput | BillItemUpdateWithWhereUniqueWithoutBillInput[]
    updateMany?: BillItemUpdateManyWithWhereWithoutBillInput | BillItemUpdateManyWithWhereWithoutBillInput[]
    deleteMany?: BillItemScalarWhereInput | BillItemScalarWhereInput[]
  }

  export type BillItemUncheckedUpdateManyWithoutBillNestedInput = {
    create?: XOR<BillItemCreateWithoutBillInput, BillItemUncheckedCreateWithoutBillInput> | BillItemCreateWithoutBillInput[] | BillItemUncheckedCreateWithoutBillInput[]
    connectOrCreate?: BillItemCreateOrConnectWithoutBillInput | BillItemCreateOrConnectWithoutBillInput[]
    upsert?: BillItemUpsertWithWhereUniqueWithoutBillInput | BillItemUpsertWithWhereUniqueWithoutBillInput[]
    createMany?: BillItemCreateManyBillInputEnvelope
    set?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    disconnect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    delete?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    connect?: BillItemWhereUniqueInput | BillItemWhereUniqueInput[]
    update?: BillItemUpdateWithWhereUniqueWithoutBillInput | BillItemUpdateWithWhereUniqueWithoutBillInput[]
    updateMany?: BillItemUpdateManyWithWhereWithoutBillInput | BillItemUpdateManyWithWhereWithoutBillInput[]
    deleteMany?: BillItemScalarWhereInput | BillItemScalarWhereInput[]
  }

  export type BillCreateNestedOneWithoutItemsInput = {
    create?: XOR<BillCreateWithoutItemsInput, BillUncheckedCreateWithoutItemsInput>
    connectOrCreate?: BillCreateOrConnectWithoutItemsInput
    connect?: BillWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutBillItemsInput = {
    create?: XOR<ProductCreateWithoutBillItemsInput, ProductUncheckedCreateWithoutBillItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutBillItemsInput
    connect?: ProductWhereUniqueInput
  }

  export type BillUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<BillCreateWithoutItemsInput, BillUncheckedCreateWithoutItemsInput>
    connectOrCreate?: BillCreateOrConnectWithoutItemsInput
    upsert?: BillUpsertWithoutItemsInput
    connect?: BillWhereUniqueInput
    update?: XOR<XOR<BillUpdateToOneWithWhereWithoutItemsInput, BillUpdateWithoutItemsInput>, BillUncheckedUpdateWithoutItemsInput>
  }

  export type ProductUpdateOneRequiredWithoutBillItemsNestedInput = {
    create?: XOR<ProductCreateWithoutBillItemsInput, ProductUncheckedCreateWithoutBillItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutBillItemsInput
    upsert?: ProductUpsertWithoutBillItemsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutBillItemsInput, ProductUpdateWithoutBillItemsInput>, ProductUncheckedUpdateWithoutBillItemsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumUserTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeFilter<$PrismaModel> | $Enums.UserType
  }

  export type NestedEnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumUserTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserType | EnumUserTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserType[] | ListEnumUserTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTypeWithAggregatesFilter<$PrismaModel> | $Enums.UserType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTypeFilter<$PrismaModel>
    _max?: NestedEnumUserTypeFilter<$PrismaModel>
  }

  export type NestedEnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumLogActionFilter<$PrismaModel = never> = {
    equals?: $Enums.LogAction | EnumLogActionFieldRefInput<$PrismaModel>
    in?: $Enums.LogAction[] | ListEnumLogActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogAction[] | ListEnumLogActionFieldRefInput<$PrismaModel>
    not?: NestedEnumLogActionFilter<$PrismaModel> | $Enums.LogAction
  }

  export type NestedEnumLogStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LogStatus | EnumLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLogStatusFilter<$PrismaModel> | $Enums.LogStatus
  }

  export type NestedEnumLogActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LogAction | EnumLogActionFieldRefInput<$PrismaModel>
    in?: $Enums.LogAction[] | ListEnumLogActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogAction[] | ListEnumLogActionFieldRefInput<$PrismaModel>
    not?: NestedEnumLogActionWithAggregatesFilter<$PrismaModel> | $Enums.LogAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLogActionFilter<$PrismaModel>
    _max?: NestedEnumLogActionFilter<$PrismaModel>
  }

  export type NestedEnumLogStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LogStatus | EnumLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogStatus[] | ListEnumLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLogStatusWithAggregatesFilter<$PrismaModel> | $Enums.LogStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLogStatusFilter<$PrismaModel>
    _max?: NestedEnumLogStatusFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedEnumBillStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BillStatus | EnumBillStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillStatus[] | ListEnumBillStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillStatus[] | ListEnumBillStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillStatusFilter<$PrismaModel> | $Enums.BillStatus
  }

  export type NestedEnumPaymentMethodFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentMethodFilter<$PrismaModel> | $Enums.PaymentMethod
  }

  export type NestedEnumBillStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BillStatus | EnumBillStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BillStatus[] | ListEnumBillStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillStatus[] | ListEnumBillStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBillStatusWithAggregatesFilter<$PrismaModel> | $Enums.BillStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBillStatusFilter<$PrismaModel>
    _max?: NestedEnumBillStatusFilter<$PrismaModel>
  }

  export type NestedEnumPaymentMethodWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentMethod | EnumPaymentMethodFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentMethod[] | ListEnumPaymentMethodFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentMethodWithAggregatesFilter<$PrismaModel> | $Enums.PaymentMethod
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentMethodFilter<$PrismaModel>
    _max?: NestedEnumPaymentMethodFilter<$PrismaModel>
  }

  export type BranchCreateWithoutCompanyInput = {
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserCreateNestedManyWithoutBranchInput
    logs?: UserLogCreateNestedManyWithoutBranchInput
    products?: ProductCreateNestedManyWithoutBranchInput
    bills?: BillCreateNestedManyWithoutBranchInput
  }

  export type BranchUncheckedCreateWithoutCompanyInput = {
    id?: number
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutBranchInput
    logs?: UserLogUncheckedCreateNestedManyWithoutBranchInput
    products?: ProductUncheckedCreateNestedManyWithoutBranchInput
    bills?: BillUncheckedCreateNestedManyWithoutBranchInput
  }

  export type BranchCreateOrConnectWithoutCompanyInput = {
    where: BranchWhereUniqueInput
    create: XOR<BranchCreateWithoutCompanyInput, BranchUncheckedCreateWithoutCompanyInput>
  }

  export type BranchCreateManyCompanyInputEnvelope = {
    data: BranchCreateManyCompanyInput | BranchCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutCompanyInput = {
    username: string
    password: string
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    branch?: BranchCreateNestedOneWithoutUsersInput
    bills?: BillCreateNestedManyWithoutCashierInput
    info?: UserInfoCreateNestedOneWithoutUserInput
    userRoles?: UserRoleCreateNestedManyWithoutUserInput
    logs?: UserLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCompanyInput = {
    id?: number
    username: string
    password: string
    branch_id?: number | null
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    bills?: BillUncheckedCreateNestedManyWithoutCashierInput
    info?: UserInfoUncheckedCreateNestedOneWithoutUserInput
    userRoles?: UserRoleUncheckedCreateNestedManyWithoutUserInput
    logs?: UserLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCompanyInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput>
  }

  export type UserCreateManyCompanyInputEnvelope = {
    data: UserCreateManyCompanyInput | UserCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type ProductCreateWithoutCompanyInput = {
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    billItems?: BillItemCreateNestedManyWithoutProductInput
    branch?: BranchCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateWithoutCompanyInput = {
    id?: number
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    branch_id?: number | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    billItems?: BillItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutCompanyInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput>
  }

  export type ProductCreateManyCompanyInputEnvelope = {
    data: ProductCreateManyCompanyInput | ProductCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type BillCreateWithoutCompanyInput = {
    bill_number: string
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    branch: BranchCreateNestedOneWithoutBillsInput
    cashier: UserCreateNestedOneWithoutBillsInput
    items?: BillItemCreateNestedManyWithoutBillInput
  }

  export type BillUncheckedCreateWithoutCompanyInput = {
    id?: number
    bill_number: string
    branch_id: number
    cashier_id: number
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    items?: BillItemUncheckedCreateNestedManyWithoutBillInput
  }

  export type BillCreateOrConnectWithoutCompanyInput = {
    where: BillWhereUniqueInput
    create: XOR<BillCreateWithoutCompanyInput, BillUncheckedCreateWithoutCompanyInput>
  }

  export type BillCreateManyCompanyInputEnvelope = {
    data: BillCreateManyCompanyInput | BillCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type BranchUpsertWithWhereUniqueWithoutCompanyInput = {
    where: BranchWhereUniqueInput
    update: XOR<BranchUpdateWithoutCompanyInput, BranchUncheckedUpdateWithoutCompanyInput>
    create: XOR<BranchCreateWithoutCompanyInput, BranchUncheckedCreateWithoutCompanyInput>
  }

  export type BranchUpdateWithWhereUniqueWithoutCompanyInput = {
    where: BranchWhereUniqueInput
    data: XOR<BranchUpdateWithoutCompanyInput, BranchUncheckedUpdateWithoutCompanyInput>
  }

  export type BranchUpdateManyWithWhereWithoutCompanyInput = {
    where: BranchScalarWhereInput
    data: XOR<BranchUpdateManyMutationInput, BranchUncheckedUpdateManyWithoutCompanyInput>
  }

  export type BranchScalarWhereInput = {
    AND?: BranchScalarWhereInput | BranchScalarWhereInput[]
    OR?: BranchScalarWhereInput[]
    NOT?: BranchScalarWhereInput | BranchScalarWhereInput[]
    id?: IntFilter<"Branch"> | number
    company_id?: IntFilter<"Branch"> | number
    name?: StringFilter<"Branch"> | string
    code?: StringFilter<"Branch"> | string
    address?: StringNullableFilter<"Branch"> | string | null
    phone?: StringNullableFilter<"Branch"> | string | null
    email?: StringNullableFilter<"Branch"> | string | null
    is_active?: BoolFilter<"Branch"> | boolean
    created_at?: DateTimeFilter<"Branch"> | Date | string
    updated_at?: DateTimeFilter<"Branch"> | Date | string
  }

  export type UserUpsertWithWhereUniqueWithoutCompanyInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutCompanyInput, UserUncheckedUpdateWithoutCompanyInput>
    create: XOR<UserCreateWithoutCompanyInput, UserUncheckedCreateWithoutCompanyInput>
  }

  export type UserUpdateWithWhereUniqueWithoutCompanyInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutCompanyInput, UserUncheckedUpdateWithoutCompanyInput>
  }

  export type UserUpdateManyWithWhereWithoutCompanyInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutCompanyInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: IntFilter<"User"> | number
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    company_id?: IntFilter<"User"> | number
    branch_id?: IntNullableFilter<"User"> | number | null
    user_type?: EnumUserTypeFilter<"User"> | $Enums.UserType
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    failed_login_attempts?: IntFilter<"User"> | number
    last_failed_login?: DateTimeNullableFilter<"User"> | Date | string | null
    account_locked_until?: DateTimeNullableFilter<"User"> | Date | string | null
    last_login_at?: DateTimeNullableFilter<"User"> | Date | string | null
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
  }

  export type ProductUpsertWithWhereUniqueWithoutCompanyInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutCompanyInput, ProductUncheckedUpdateWithoutCompanyInput>
    create: XOR<ProductCreateWithoutCompanyInput, ProductUncheckedCreateWithoutCompanyInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutCompanyInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutCompanyInput, ProductUncheckedUpdateWithoutCompanyInput>
  }

  export type ProductUpdateManyWithWhereWithoutCompanyInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutCompanyInput>
  }

  export type ProductScalarWhereInput = {
    AND?: ProductScalarWhereInput | ProductScalarWhereInput[]
    OR?: ProductScalarWhereInput[]
    NOT?: ProductScalarWhereInput | ProductScalarWhereInput[]
    id?: IntFilter<"Product"> | number
    name?: StringFilter<"Product"> | string
    code?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    price?: DecimalFilter<"Product"> | Decimal | DecimalJsLike | number | string
    cost_price?: DecimalNullableFilter<"Product"> | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFilter<"Product"> | number
    min_quantity?: IntFilter<"Product"> | number
    company_id?: IntFilter<"Product"> | number
    branch_id?: IntNullableFilter<"Product"> | number | null
    is_active?: BoolFilter<"Product"> | boolean
    created_at?: DateTimeFilter<"Product"> | Date | string
    updated_at?: DateTimeFilter<"Product"> | Date | string
  }

  export type BillUpsertWithWhereUniqueWithoutCompanyInput = {
    where: BillWhereUniqueInput
    update: XOR<BillUpdateWithoutCompanyInput, BillUncheckedUpdateWithoutCompanyInput>
    create: XOR<BillCreateWithoutCompanyInput, BillUncheckedCreateWithoutCompanyInput>
  }

  export type BillUpdateWithWhereUniqueWithoutCompanyInput = {
    where: BillWhereUniqueInput
    data: XOR<BillUpdateWithoutCompanyInput, BillUncheckedUpdateWithoutCompanyInput>
  }

  export type BillUpdateManyWithWhereWithoutCompanyInput = {
    where: BillScalarWhereInput
    data: XOR<BillUpdateManyMutationInput, BillUncheckedUpdateManyWithoutCompanyInput>
  }

  export type BillScalarWhereInput = {
    AND?: BillScalarWhereInput | BillScalarWhereInput[]
    OR?: BillScalarWhereInput[]
    NOT?: BillScalarWhereInput | BillScalarWhereInput[]
    id?: IntFilter<"Bill"> | number
    bill_number?: StringFilter<"Bill"> | string
    company_id?: IntFilter<"Bill"> | number
    branch_id?: IntFilter<"Bill"> | number
    cashier_id?: IntFilter<"Bill"> | number
    status?: EnumBillStatusFilter<"Bill"> | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFilter<"Bill"> | $Enums.PaymentMethod
    subtotal?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    discount?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    tax?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"Bill"> | Decimal | DecimalJsLike | number | string
    notes?: StringNullableFilter<"Bill"> | string | null
    created_at?: DateTimeFilter<"Bill"> | Date | string
    updated_at?: DateTimeFilter<"Bill"> | Date | string
  }

  export type CompanyCreateWithoutBranchesInput = {
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserCreateNestedManyWithoutCompanyInput
    products?: ProductCreateNestedManyWithoutCompanyInput
    bills?: BillCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutBranchesInput = {
    id?: number
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutCompanyInput
    products?: ProductUncheckedCreateNestedManyWithoutCompanyInput
    bills?: BillUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutBranchesInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutBranchesInput, CompanyUncheckedCreateWithoutBranchesInput>
  }

  export type UserCreateWithoutBranchInput = {
    username: string
    password: string
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    bills?: BillCreateNestedManyWithoutCashierInput
    info?: UserInfoCreateNestedOneWithoutUserInput
    userRoles?: UserRoleCreateNestedManyWithoutUserInput
    logs?: UserLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutBranchInput = {
    id?: number
    username: string
    password: string
    company_id: number
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    bills?: BillUncheckedCreateNestedManyWithoutCashierInput
    info?: UserInfoUncheckedCreateNestedOneWithoutUserInput
    userRoles?: UserRoleUncheckedCreateNestedManyWithoutUserInput
    logs?: UserLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutBranchInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBranchInput, UserUncheckedCreateWithoutBranchInput>
  }

  export type UserCreateManyBranchInputEnvelope = {
    data: UserCreateManyBranchInput | UserCreateManyBranchInput[]
    skipDuplicates?: boolean
  }

  export type UserLogCreateWithoutBranchInput = {
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address?: string | null
    user_agent?: string | null
    device_info?: string | null
    created_at?: Date | string
    user: UserCreateNestedOneWithoutLogsInput
  }

  export type UserLogUncheckedCreateWithoutBranchInput = {
    id?: number
    userId: number
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address?: string | null
    user_agent?: string | null
    device_info?: string | null
    created_at?: Date | string
  }

  export type UserLogCreateOrConnectWithoutBranchInput = {
    where: UserLogWhereUniqueInput
    create: XOR<UserLogCreateWithoutBranchInput, UserLogUncheckedCreateWithoutBranchInput>
  }

  export type UserLogCreateManyBranchInputEnvelope = {
    data: UserLogCreateManyBranchInput | UserLogCreateManyBranchInput[]
    skipDuplicates?: boolean
  }

  export type ProductCreateWithoutBranchInput = {
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    billItems?: BillItemCreateNestedManyWithoutProductInput
    company: CompanyCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateWithoutBranchInput = {
    id?: number
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    company_id: number
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    billItems?: BillItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutBranchInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutBranchInput, ProductUncheckedCreateWithoutBranchInput>
  }

  export type ProductCreateManyBranchInputEnvelope = {
    data: ProductCreateManyBranchInput | ProductCreateManyBranchInput[]
    skipDuplicates?: boolean
  }

  export type BillCreateWithoutBranchInput = {
    bill_number: string
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutBillsInput
    cashier: UserCreateNestedOneWithoutBillsInput
    items?: BillItemCreateNestedManyWithoutBillInput
  }

  export type BillUncheckedCreateWithoutBranchInput = {
    id?: number
    bill_number: string
    company_id: number
    cashier_id: number
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    items?: BillItemUncheckedCreateNestedManyWithoutBillInput
  }

  export type BillCreateOrConnectWithoutBranchInput = {
    where: BillWhereUniqueInput
    create: XOR<BillCreateWithoutBranchInput, BillUncheckedCreateWithoutBranchInput>
  }

  export type BillCreateManyBranchInputEnvelope = {
    data: BillCreateManyBranchInput | BillCreateManyBranchInput[]
    skipDuplicates?: boolean
  }

  export type CompanyUpsertWithoutBranchesInput = {
    update: XOR<CompanyUpdateWithoutBranchesInput, CompanyUncheckedUpdateWithoutBranchesInput>
    create: XOR<CompanyCreateWithoutBranchesInput, CompanyUncheckedCreateWithoutBranchesInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutBranchesInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutBranchesInput, CompanyUncheckedUpdateWithoutBranchesInput>
  }

  export type CompanyUpdateWithoutBranchesInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutCompanyNestedInput
    products?: ProductUpdateManyWithoutCompanyNestedInput
    bills?: BillUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutBranchesInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutCompanyNestedInput
    products?: ProductUncheckedUpdateManyWithoutCompanyNestedInput
    bills?: BillUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutBranchInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutBranchInput, UserUncheckedUpdateWithoutBranchInput>
    create: XOR<UserCreateWithoutBranchInput, UserUncheckedCreateWithoutBranchInput>
  }

  export type UserUpdateWithWhereUniqueWithoutBranchInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutBranchInput, UserUncheckedUpdateWithoutBranchInput>
  }

  export type UserUpdateManyWithWhereWithoutBranchInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutBranchInput>
  }

  export type UserLogUpsertWithWhereUniqueWithoutBranchInput = {
    where: UserLogWhereUniqueInput
    update: XOR<UserLogUpdateWithoutBranchInput, UserLogUncheckedUpdateWithoutBranchInput>
    create: XOR<UserLogCreateWithoutBranchInput, UserLogUncheckedCreateWithoutBranchInput>
  }

  export type UserLogUpdateWithWhereUniqueWithoutBranchInput = {
    where: UserLogWhereUniqueInput
    data: XOR<UserLogUpdateWithoutBranchInput, UserLogUncheckedUpdateWithoutBranchInput>
  }

  export type UserLogUpdateManyWithWhereWithoutBranchInput = {
    where: UserLogScalarWhereInput
    data: XOR<UserLogUpdateManyMutationInput, UserLogUncheckedUpdateManyWithoutBranchInput>
  }

  export type UserLogScalarWhereInput = {
    AND?: UserLogScalarWhereInput | UserLogScalarWhereInput[]
    OR?: UserLogScalarWhereInput[]
    NOT?: UserLogScalarWhereInput | UserLogScalarWhereInput[]
    id?: IntFilter<"UserLog"> | number
    userId?: IntFilter<"UserLog"> | number
    branch_id?: IntNullableFilter<"UserLog"> | number | null
    action?: EnumLogActionFilter<"UserLog"> | $Enums.LogAction
    status?: EnumLogStatusFilter<"UserLog"> | $Enums.LogStatus
    ip_address?: StringNullableFilter<"UserLog"> | string | null
    user_agent?: StringNullableFilter<"UserLog"> | string | null
    device_info?: StringNullableFilter<"UserLog"> | string | null
    created_at?: DateTimeFilter<"UserLog"> | Date | string
  }

  export type ProductUpsertWithWhereUniqueWithoutBranchInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutBranchInput, ProductUncheckedUpdateWithoutBranchInput>
    create: XOR<ProductCreateWithoutBranchInput, ProductUncheckedCreateWithoutBranchInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutBranchInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutBranchInput, ProductUncheckedUpdateWithoutBranchInput>
  }

  export type ProductUpdateManyWithWhereWithoutBranchInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutBranchInput>
  }

  export type BillUpsertWithWhereUniqueWithoutBranchInput = {
    where: BillWhereUniqueInput
    update: XOR<BillUpdateWithoutBranchInput, BillUncheckedUpdateWithoutBranchInput>
    create: XOR<BillCreateWithoutBranchInput, BillUncheckedCreateWithoutBranchInput>
  }

  export type BillUpdateWithWhereUniqueWithoutBranchInput = {
    where: BillWhereUniqueInput
    data: XOR<BillUpdateWithoutBranchInput, BillUncheckedUpdateWithoutBranchInput>
  }

  export type BillUpdateManyWithWhereWithoutBranchInput = {
    where: BillScalarWhereInput
    data: XOR<BillUpdateManyMutationInput, BillUncheckedUpdateManyWithoutBranchInput>
  }

  export type CompanyCreateWithoutUsersInput = {
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    branches?: BranchCreateNestedManyWithoutCompanyInput
    products?: ProductCreateNestedManyWithoutCompanyInput
    bills?: BillCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutUsersInput = {
    id?: number
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    branches?: BranchUncheckedCreateNestedManyWithoutCompanyInput
    products?: ProductUncheckedCreateNestedManyWithoutCompanyInput
    bills?: BillUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutUsersInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutUsersInput, CompanyUncheckedCreateWithoutUsersInput>
  }

  export type BranchCreateWithoutUsersInput = {
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutBranchesInput
    logs?: UserLogCreateNestedManyWithoutBranchInput
    products?: ProductCreateNestedManyWithoutBranchInput
    bills?: BillCreateNestedManyWithoutBranchInput
  }

  export type BranchUncheckedCreateWithoutUsersInput = {
    id?: number
    company_id: number
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    logs?: UserLogUncheckedCreateNestedManyWithoutBranchInput
    products?: ProductUncheckedCreateNestedManyWithoutBranchInput
    bills?: BillUncheckedCreateNestedManyWithoutBranchInput
  }

  export type BranchCreateOrConnectWithoutUsersInput = {
    where: BranchWhereUniqueInput
    create: XOR<BranchCreateWithoutUsersInput, BranchUncheckedCreateWithoutUsersInput>
  }

  export type BillCreateWithoutCashierInput = {
    bill_number: string
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutBillsInput
    branch: BranchCreateNestedOneWithoutBillsInput
    items?: BillItemCreateNestedManyWithoutBillInput
  }

  export type BillUncheckedCreateWithoutCashierInput = {
    id?: number
    bill_number: string
    company_id: number
    branch_id: number
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    items?: BillItemUncheckedCreateNestedManyWithoutBillInput
  }

  export type BillCreateOrConnectWithoutCashierInput = {
    where: BillWhereUniqueInput
    create: XOR<BillCreateWithoutCashierInput, BillUncheckedCreateWithoutCashierInput>
  }

  export type BillCreateManyCashierInputEnvelope = {
    data: BillCreateManyCashierInput | BillCreateManyCashierInput[]
    skipDuplicates?: boolean
  }

  export type UserInfoCreateWithoutUserInput = {
    first_name: string
    last_name: string
    email?: string | null
    phone_number?: string | null
    address?: string | null
    profile_picture?: string | null
  }

  export type UserInfoUncheckedCreateWithoutUserInput = {
    id?: number
    first_name: string
    last_name: string
    email?: string | null
    phone_number?: string | null
    address?: string | null
    profile_picture?: string | null
  }

  export type UserInfoCreateOrConnectWithoutUserInput = {
    where: UserInfoWhereUniqueInput
    create: XOR<UserInfoCreateWithoutUserInput, UserInfoUncheckedCreateWithoutUserInput>
  }

  export type UserRoleCreateWithoutUserInput = {
    role: RoleCreateNestedOneWithoutUserRolesInput
  }

  export type UserRoleUncheckedCreateWithoutUserInput = {
    id?: number
    roleId: number
  }

  export type UserRoleCreateOrConnectWithoutUserInput = {
    where: UserRoleWhereUniqueInput
    create: XOR<UserRoleCreateWithoutUserInput, UserRoleUncheckedCreateWithoutUserInput>
  }

  export type UserRoleCreateManyUserInputEnvelope = {
    data: UserRoleCreateManyUserInput | UserRoleCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserLogCreateWithoutUserInput = {
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address?: string | null
    user_agent?: string | null
    device_info?: string | null
    created_at?: Date | string
    branch?: BranchCreateNestedOneWithoutLogsInput
  }

  export type UserLogUncheckedCreateWithoutUserInput = {
    id?: number
    branch_id?: number | null
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address?: string | null
    user_agent?: string | null
    device_info?: string | null
    created_at?: Date | string
  }

  export type UserLogCreateOrConnectWithoutUserInput = {
    where: UserLogWhereUniqueInput
    create: XOR<UserLogCreateWithoutUserInput, UserLogUncheckedCreateWithoutUserInput>
  }

  export type UserLogCreateManyUserInputEnvelope = {
    data: UserLogCreateManyUserInput | UserLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type CompanyUpsertWithoutUsersInput = {
    update: XOR<CompanyUpdateWithoutUsersInput, CompanyUncheckedUpdateWithoutUsersInput>
    create: XOR<CompanyCreateWithoutUsersInput, CompanyUncheckedCreateWithoutUsersInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutUsersInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutUsersInput, CompanyUncheckedUpdateWithoutUsersInput>
  }

  export type CompanyUpdateWithoutUsersInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branches?: BranchUpdateManyWithoutCompanyNestedInput
    products?: ProductUpdateManyWithoutCompanyNestedInput
    bills?: BillUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutUsersInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branches?: BranchUncheckedUpdateManyWithoutCompanyNestedInput
    products?: ProductUncheckedUpdateManyWithoutCompanyNestedInput
    bills?: BillUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type BranchUpsertWithoutUsersInput = {
    update: XOR<BranchUpdateWithoutUsersInput, BranchUncheckedUpdateWithoutUsersInput>
    create: XOR<BranchCreateWithoutUsersInput, BranchUncheckedCreateWithoutUsersInput>
    where?: BranchWhereInput
  }

  export type BranchUpdateToOneWithWhereWithoutUsersInput = {
    where?: BranchWhereInput
    data: XOR<BranchUpdateWithoutUsersInput, BranchUncheckedUpdateWithoutUsersInput>
  }

  export type BranchUpdateWithoutUsersInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutBranchesNestedInput
    logs?: UserLogUpdateManyWithoutBranchNestedInput
    products?: ProductUpdateManyWithoutBranchNestedInput
    bills?: BillUpdateManyWithoutBranchNestedInput
  }

  export type BranchUncheckedUpdateWithoutUsersInput = {
    id?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    logs?: UserLogUncheckedUpdateManyWithoutBranchNestedInput
    products?: ProductUncheckedUpdateManyWithoutBranchNestedInput
    bills?: BillUncheckedUpdateManyWithoutBranchNestedInput
  }

  export type BillUpsertWithWhereUniqueWithoutCashierInput = {
    where: BillWhereUniqueInput
    update: XOR<BillUpdateWithoutCashierInput, BillUncheckedUpdateWithoutCashierInput>
    create: XOR<BillCreateWithoutCashierInput, BillUncheckedCreateWithoutCashierInput>
  }

  export type BillUpdateWithWhereUniqueWithoutCashierInput = {
    where: BillWhereUniqueInput
    data: XOR<BillUpdateWithoutCashierInput, BillUncheckedUpdateWithoutCashierInput>
  }

  export type BillUpdateManyWithWhereWithoutCashierInput = {
    where: BillScalarWhereInput
    data: XOR<BillUpdateManyMutationInput, BillUncheckedUpdateManyWithoutCashierInput>
  }

  export type UserInfoUpsertWithoutUserInput = {
    update: XOR<UserInfoUpdateWithoutUserInput, UserInfoUncheckedUpdateWithoutUserInput>
    create: XOR<UserInfoCreateWithoutUserInput, UserInfoUncheckedCreateWithoutUserInput>
    where?: UserInfoWhereInput
  }

  export type UserInfoUpdateToOneWithWhereWithoutUserInput = {
    where?: UserInfoWhereInput
    data: XOR<UserInfoUpdateWithoutUserInput, UserInfoUncheckedUpdateWithoutUserInput>
  }

  export type UserInfoUpdateWithoutUserInput = {
    first_name?: StringFieldUpdateOperationsInput | string
    last_name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profile_picture?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserInfoUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    first_name?: StringFieldUpdateOperationsInput | string
    last_name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profile_picture?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRoleUpsertWithWhereUniqueWithoutUserInput = {
    where: UserRoleWhereUniqueInput
    update: XOR<UserRoleUpdateWithoutUserInput, UserRoleUncheckedUpdateWithoutUserInput>
    create: XOR<UserRoleCreateWithoutUserInput, UserRoleUncheckedCreateWithoutUserInput>
  }

  export type UserRoleUpdateWithWhereUniqueWithoutUserInput = {
    where: UserRoleWhereUniqueInput
    data: XOR<UserRoleUpdateWithoutUserInput, UserRoleUncheckedUpdateWithoutUserInput>
  }

  export type UserRoleUpdateManyWithWhereWithoutUserInput = {
    where: UserRoleScalarWhereInput
    data: XOR<UserRoleUpdateManyMutationInput, UserRoleUncheckedUpdateManyWithoutUserInput>
  }

  export type UserRoleScalarWhereInput = {
    AND?: UserRoleScalarWhereInput | UserRoleScalarWhereInput[]
    OR?: UserRoleScalarWhereInput[]
    NOT?: UserRoleScalarWhereInput | UserRoleScalarWhereInput[]
    id?: IntFilter<"UserRole"> | number
    userId?: IntFilter<"UserRole"> | number
    roleId?: IntFilter<"UserRole"> | number
  }

  export type UserLogUpsertWithWhereUniqueWithoutUserInput = {
    where: UserLogWhereUniqueInput
    update: XOR<UserLogUpdateWithoutUserInput, UserLogUncheckedUpdateWithoutUserInput>
    create: XOR<UserLogCreateWithoutUserInput, UserLogUncheckedCreateWithoutUserInput>
  }

  export type UserLogUpdateWithWhereUniqueWithoutUserInput = {
    where: UserLogWhereUniqueInput
    data: XOR<UserLogUpdateWithoutUserInput, UserLogUncheckedUpdateWithoutUserInput>
  }

  export type UserLogUpdateManyWithWhereWithoutUserInput = {
    where: UserLogScalarWhereInput
    data: XOR<UserLogUpdateManyMutationInput, UserLogUncheckedUpdateManyWithoutUserInput>
  }

  export type UserCreateWithoutInfoInput = {
    username: string
    password: string
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    branch?: BranchCreateNestedOneWithoutUsersInput
    bills?: BillCreateNestedManyWithoutCashierInput
    userRoles?: UserRoleCreateNestedManyWithoutUserInput
    logs?: UserLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutInfoInput = {
    id?: number
    username: string
    password: string
    company_id: number
    branch_id?: number | null
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    bills?: BillUncheckedCreateNestedManyWithoutCashierInput
    userRoles?: UserRoleUncheckedCreateNestedManyWithoutUserInput
    logs?: UserLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutInfoInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutInfoInput, UserUncheckedCreateWithoutInfoInput>
  }

  export type UserUpsertWithoutInfoInput = {
    update: XOR<UserUpdateWithoutInfoInput, UserUncheckedUpdateWithoutInfoInput>
    create: XOR<UserCreateWithoutInfoInput, UserUncheckedCreateWithoutInfoInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutInfoInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutInfoInput, UserUncheckedUpdateWithoutInfoInput>
  }

  export type UserUpdateWithoutInfoInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    branch?: BranchUpdateOneWithoutUsersNestedInput
    bills?: BillUpdateManyWithoutCashierNestedInput
    userRoles?: UserRoleUpdateManyWithoutUserNestedInput
    logs?: UserLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutInfoInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    bills?: BillUncheckedUpdateManyWithoutCashierNestedInput
    userRoles?: UserRoleUncheckedUpdateManyWithoutUserNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserRoleCreateWithoutRoleInput = {
    user: UserCreateNestedOneWithoutUserRolesInput
  }

  export type UserRoleUncheckedCreateWithoutRoleInput = {
    id?: number
    userId: number
  }

  export type UserRoleCreateOrConnectWithoutRoleInput = {
    where: UserRoleWhereUniqueInput
    create: XOR<UserRoleCreateWithoutRoleInput, UserRoleUncheckedCreateWithoutRoleInput>
  }

  export type UserRoleCreateManyRoleInputEnvelope = {
    data: UserRoleCreateManyRoleInput | UserRoleCreateManyRoleInput[]
    skipDuplicates?: boolean
  }

  export type RoleAuthorityCreateWithoutRoleInput = {
    authority: AuthorityCreateNestedOneWithoutRolesInput
  }

  export type RoleAuthorityUncheckedCreateWithoutRoleInput = {
    id?: number
    authorityId: number
  }

  export type RoleAuthorityCreateOrConnectWithoutRoleInput = {
    where: RoleAuthorityWhereUniqueInput
    create: XOR<RoleAuthorityCreateWithoutRoleInput, RoleAuthorityUncheckedCreateWithoutRoleInput>
  }

  export type RoleAuthorityCreateManyRoleInputEnvelope = {
    data: RoleAuthorityCreateManyRoleInput | RoleAuthorityCreateManyRoleInput[]
    skipDuplicates?: boolean
  }

  export type UserRoleUpsertWithWhereUniqueWithoutRoleInput = {
    where: UserRoleWhereUniqueInput
    update: XOR<UserRoleUpdateWithoutRoleInput, UserRoleUncheckedUpdateWithoutRoleInput>
    create: XOR<UserRoleCreateWithoutRoleInput, UserRoleUncheckedCreateWithoutRoleInput>
  }

  export type UserRoleUpdateWithWhereUniqueWithoutRoleInput = {
    where: UserRoleWhereUniqueInput
    data: XOR<UserRoleUpdateWithoutRoleInput, UserRoleUncheckedUpdateWithoutRoleInput>
  }

  export type UserRoleUpdateManyWithWhereWithoutRoleInput = {
    where: UserRoleScalarWhereInput
    data: XOR<UserRoleUpdateManyMutationInput, UserRoleUncheckedUpdateManyWithoutRoleInput>
  }

  export type RoleAuthorityUpsertWithWhereUniqueWithoutRoleInput = {
    where: RoleAuthorityWhereUniqueInput
    update: XOR<RoleAuthorityUpdateWithoutRoleInput, RoleAuthorityUncheckedUpdateWithoutRoleInput>
    create: XOR<RoleAuthorityCreateWithoutRoleInput, RoleAuthorityUncheckedCreateWithoutRoleInput>
  }

  export type RoleAuthorityUpdateWithWhereUniqueWithoutRoleInput = {
    where: RoleAuthorityWhereUniqueInput
    data: XOR<RoleAuthorityUpdateWithoutRoleInput, RoleAuthorityUncheckedUpdateWithoutRoleInput>
  }

  export type RoleAuthorityUpdateManyWithWhereWithoutRoleInput = {
    where: RoleAuthorityScalarWhereInput
    data: XOR<RoleAuthorityUpdateManyMutationInput, RoleAuthorityUncheckedUpdateManyWithoutRoleInput>
  }

  export type RoleAuthorityScalarWhereInput = {
    AND?: RoleAuthorityScalarWhereInput | RoleAuthorityScalarWhereInput[]
    OR?: RoleAuthorityScalarWhereInput[]
    NOT?: RoleAuthorityScalarWhereInput | RoleAuthorityScalarWhereInput[]
    id?: IntFilter<"RoleAuthority"> | number
    roleId?: IntFilter<"RoleAuthority"> | number
    authorityId?: IntFilter<"RoleAuthority"> | number
  }

  export type RoleAuthorityCreateWithoutAuthorityInput = {
    role: RoleCreateNestedOneWithoutAuthoritiesInput
  }

  export type RoleAuthorityUncheckedCreateWithoutAuthorityInput = {
    id?: number
    roleId: number
  }

  export type RoleAuthorityCreateOrConnectWithoutAuthorityInput = {
    where: RoleAuthorityWhereUniqueInput
    create: XOR<RoleAuthorityCreateWithoutAuthorityInput, RoleAuthorityUncheckedCreateWithoutAuthorityInput>
  }

  export type RoleAuthorityCreateManyAuthorityInputEnvelope = {
    data: RoleAuthorityCreateManyAuthorityInput | RoleAuthorityCreateManyAuthorityInput[]
    skipDuplicates?: boolean
  }

  export type RoleAuthorityUpsertWithWhereUniqueWithoutAuthorityInput = {
    where: RoleAuthorityWhereUniqueInput
    update: XOR<RoleAuthorityUpdateWithoutAuthorityInput, RoleAuthorityUncheckedUpdateWithoutAuthorityInput>
    create: XOR<RoleAuthorityCreateWithoutAuthorityInput, RoleAuthorityUncheckedCreateWithoutAuthorityInput>
  }

  export type RoleAuthorityUpdateWithWhereUniqueWithoutAuthorityInput = {
    where: RoleAuthorityWhereUniqueInput
    data: XOR<RoleAuthorityUpdateWithoutAuthorityInput, RoleAuthorityUncheckedUpdateWithoutAuthorityInput>
  }

  export type RoleAuthorityUpdateManyWithWhereWithoutAuthorityInput = {
    where: RoleAuthorityScalarWhereInput
    data: XOR<RoleAuthorityUpdateManyMutationInput, RoleAuthorityUncheckedUpdateManyWithoutAuthorityInput>
  }

  export type UserCreateWithoutUserRolesInput = {
    username: string
    password: string
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    branch?: BranchCreateNestedOneWithoutUsersInput
    bills?: BillCreateNestedManyWithoutCashierInput
    info?: UserInfoCreateNestedOneWithoutUserInput
    logs?: UserLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUserRolesInput = {
    id?: number
    username: string
    password: string
    company_id: number
    branch_id?: number | null
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    bills?: BillUncheckedCreateNestedManyWithoutCashierInput
    info?: UserInfoUncheckedCreateNestedOneWithoutUserInput
    logs?: UserLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUserRolesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserRolesInput, UserUncheckedCreateWithoutUserRolesInput>
  }

  export type RoleCreateWithoutUserRolesInput = {
    name: string
    description?: string | null
    authorities?: RoleAuthorityCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateWithoutUserRolesInput = {
    id?: number
    name: string
    description?: string | null
    authorities?: RoleAuthorityUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleCreateOrConnectWithoutUserRolesInput = {
    where: RoleWhereUniqueInput
    create: XOR<RoleCreateWithoutUserRolesInput, RoleUncheckedCreateWithoutUserRolesInput>
  }

  export type UserUpsertWithoutUserRolesInput = {
    update: XOR<UserUpdateWithoutUserRolesInput, UserUncheckedUpdateWithoutUserRolesInput>
    create: XOR<UserCreateWithoutUserRolesInput, UserUncheckedCreateWithoutUserRolesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserRolesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserRolesInput, UserUncheckedUpdateWithoutUserRolesInput>
  }

  export type UserUpdateWithoutUserRolesInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    branch?: BranchUpdateOneWithoutUsersNestedInput
    bills?: BillUpdateManyWithoutCashierNestedInput
    info?: UserInfoUpdateOneWithoutUserNestedInput
    logs?: UserLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUserRolesInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    bills?: BillUncheckedUpdateManyWithoutCashierNestedInput
    info?: UserInfoUncheckedUpdateOneWithoutUserNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type RoleUpsertWithoutUserRolesInput = {
    update: XOR<RoleUpdateWithoutUserRolesInput, RoleUncheckedUpdateWithoutUserRolesInput>
    create: XOR<RoleCreateWithoutUserRolesInput, RoleUncheckedCreateWithoutUserRolesInput>
    where?: RoleWhereInput
  }

  export type RoleUpdateToOneWithWhereWithoutUserRolesInput = {
    where?: RoleWhereInput
    data: XOR<RoleUpdateWithoutUserRolesInput, RoleUncheckedUpdateWithoutUserRolesInput>
  }

  export type RoleUpdateWithoutUserRolesInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    authorities?: RoleAuthorityUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateWithoutUserRolesInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    authorities?: RoleAuthorityUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type RoleCreateWithoutAuthoritiesInput = {
    name: string
    description?: string | null
    userRoles?: UserRoleCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateWithoutAuthoritiesInput = {
    id?: number
    name: string
    description?: string | null
    userRoles?: UserRoleUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleCreateOrConnectWithoutAuthoritiesInput = {
    where: RoleWhereUniqueInput
    create: XOR<RoleCreateWithoutAuthoritiesInput, RoleUncheckedCreateWithoutAuthoritiesInput>
  }

  export type AuthorityCreateWithoutRolesInput = {
    name: string
    description?: string | null
  }

  export type AuthorityUncheckedCreateWithoutRolesInput = {
    id?: number
    name: string
    description?: string | null
  }

  export type AuthorityCreateOrConnectWithoutRolesInput = {
    where: AuthorityWhereUniqueInput
    create: XOR<AuthorityCreateWithoutRolesInput, AuthorityUncheckedCreateWithoutRolesInput>
  }

  export type RoleUpsertWithoutAuthoritiesInput = {
    update: XOR<RoleUpdateWithoutAuthoritiesInput, RoleUncheckedUpdateWithoutAuthoritiesInput>
    create: XOR<RoleCreateWithoutAuthoritiesInput, RoleUncheckedCreateWithoutAuthoritiesInput>
    where?: RoleWhereInput
  }

  export type RoleUpdateToOneWithWhereWithoutAuthoritiesInput = {
    where?: RoleWhereInput
    data: XOR<RoleUpdateWithoutAuthoritiesInput, RoleUncheckedUpdateWithoutAuthoritiesInput>
  }

  export type RoleUpdateWithoutAuthoritiesInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    userRoles?: UserRoleUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateWithoutAuthoritiesInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    userRoles?: UserRoleUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type AuthorityUpsertWithoutRolesInput = {
    update: XOR<AuthorityUpdateWithoutRolesInput, AuthorityUncheckedUpdateWithoutRolesInput>
    create: XOR<AuthorityCreateWithoutRolesInput, AuthorityUncheckedCreateWithoutRolesInput>
    where?: AuthorityWhereInput
  }

  export type AuthorityUpdateToOneWithWhereWithoutRolesInput = {
    where?: AuthorityWhereInput
    data: XOR<AuthorityUpdateWithoutRolesInput, AuthorityUncheckedUpdateWithoutRolesInput>
  }

  export type AuthorityUpdateWithoutRolesInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuthorityUncheckedUpdateWithoutRolesInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateWithoutLogsInput = {
    username: string
    password: string
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    branch?: BranchCreateNestedOneWithoutUsersInput
    bills?: BillCreateNestedManyWithoutCashierInput
    info?: UserInfoCreateNestedOneWithoutUserInput
    userRoles?: UserRoleCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutLogsInput = {
    id?: number
    username: string
    password: string
    company_id: number
    branch_id?: number | null
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    bills?: BillUncheckedCreateNestedManyWithoutCashierInput
    info?: UserInfoUncheckedCreateNestedOneWithoutUserInput
    userRoles?: UserRoleUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
  }

  export type BranchCreateWithoutLogsInput = {
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutBranchesInput
    users?: UserCreateNestedManyWithoutBranchInput
    products?: ProductCreateNestedManyWithoutBranchInput
    bills?: BillCreateNestedManyWithoutBranchInput
  }

  export type BranchUncheckedCreateWithoutLogsInput = {
    id?: number
    company_id: number
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutBranchInput
    products?: ProductUncheckedCreateNestedManyWithoutBranchInput
    bills?: BillUncheckedCreateNestedManyWithoutBranchInput
  }

  export type BranchCreateOrConnectWithoutLogsInput = {
    where: BranchWhereUniqueInput
    create: XOR<BranchCreateWithoutLogsInput, BranchUncheckedCreateWithoutLogsInput>
  }

  export type UserUpsertWithoutLogsInput = {
    update: XOR<UserUpdateWithoutLogsInput, UserUncheckedUpdateWithoutLogsInput>
    create: XOR<UserCreateWithoutLogsInput, UserUncheckedCreateWithoutLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutLogsInput, UserUncheckedUpdateWithoutLogsInput>
  }

  export type UserUpdateWithoutLogsInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    branch?: BranchUpdateOneWithoutUsersNestedInput
    bills?: BillUpdateManyWithoutCashierNestedInput
    info?: UserInfoUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutLogsInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    bills?: BillUncheckedUpdateManyWithoutCashierNestedInput
    info?: UserInfoUncheckedUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUncheckedUpdateManyWithoutUserNestedInput
  }

  export type BranchUpsertWithoutLogsInput = {
    update: XOR<BranchUpdateWithoutLogsInput, BranchUncheckedUpdateWithoutLogsInput>
    create: XOR<BranchCreateWithoutLogsInput, BranchUncheckedCreateWithoutLogsInput>
    where?: BranchWhereInput
  }

  export type BranchUpdateToOneWithWhereWithoutLogsInput = {
    where?: BranchWhereInput
    data: XOR<BranchUpdateWithoutLogsInput, BranchUncheckedUpdateWithoutLogsInput>
  }

  export type BranchUpdateWithoutLogsInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutBranchesNestedInput
    users?: UserUpdateManyWithoutBranchNestedInput
    products?: ProductUpdateManyWithoutBranchNestedInput
    bills?: BillUpdateManyWithoutBranchNestedInput
  }

  export type BranchUncheckedUpdateWithoutLogsInput = {
    id?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutBranchNestedInput
    products?: ProductUncheckedUpdateManyWithoutBranchNestedInput
    bills?: BillUncheckedUpdateManyWithoutBranchNestedInput
  }

  export type BillItemCreateWithoutProductInput = {
    quantity: number
    unit_price: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    bill: BillCreateNestedOneWithoutItemsInput
  }

  export type BillItemUncheckedCreateWithoutProductInput = {
    id?: number
    bill_id: number
    quantity: number
    unit_price: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type BillItemCreateOrConnectWithoutProductInput = {
    where: BillItemWhereUniqueInput
    create: XOR<BillItemCreateWithoutProductInput, BillItemUncheckedCreateWithoutProductInput>
  }

  export type BillItemCreateManyProductInputEnvelope = {
    data: BillItemCreateManyProductInput | BillItemCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type CompanyCreateWithoutProductsInput = {
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    branches?: BranchCreateNestedManyWithoutCompanyInput
    users?: UserCreateNestedManyWithoutCompanyInput
    bills?: BillCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutProductsInput = {
    id?: number
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    branches?: BranchUncheckedCreateNestedManyWithoutCompanyInput
    users?: UserUncheckedCreateNestedManyWithoutCompanyInput
    bills?: BillUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutProductsInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutProductsInput, CompanyUncheckedCreateWithoutProductsInput>
  }

  export type BranchCreateWithoutProductsInput = {
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutBranchesInput
    users?: UserCreateNestedManyWithoutBranchInput
    logs?: UserLogCreateNestedManyWithoutBranchInput
    bills?: BillCreateNestedManyWithoutBranchInput
  }

  export type BranchUncheckedCreateWithoutProductsInput = {
    id?: number
    company_id: number
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutBranchInput
    logs?: UserLogUncheckedCreateNestedManyWithoutBranchInput
    bills?: BillUncheckedCreateNestedManyWithoutBranchInput
  }

  export type BranchCreateOrConnectWithoutProductsInput = {
    where: BranchWhereUniqueInput
    create: XOR<BranchCreateWithoutProductsInput, BranchUncheckedCreateWithoutProductsInput>
  }

  export type BillItemUpsertWithWhereUniqueWithoutProductInput = {
    where: BillItemWhereUniqueInput
    update: XOR<BillItemUpdateWithoutProductInput, BillItemUncheckedUpdateWithoutProductInput>
    create: XOR<BillItemCreateWithoutProductInput, BillItemUncheckedCreateWithoutProductInput>
  }

  export type BillItemUpdateWithWhereUniqueWithoutProductInput = {
    where: BillItemWhereUniqueInput
    data: XOR<BillItemUpdateWithoutProductInput, BillItemUncheckedUpdateWithoutProductInput>
  }

  export type BillItemUpdateManyWithWhereWithoutProductInput = {
    where: BillItemScalarWhereInput
    data: XOR<BillItemUpdateManyMutationInput, BillItemUncheckedUpdateManyWithoutProductInput>
  }

  export type BillItemScalarWhereInput = {
    AND?: BillItemScalarWhereInput | BillItemScalarWhereInput[]
    OR?: BillItemScalarWhereInput[]
    NOT?: BillItemScalarWhereInput | BillItemScalarWhereInput[]
    id?: IntFilter<"BillItem"> | number
    bill_id?: IntFilter<"BillItem"> | number
    product_id?: IntFilter<"BillItem"> | number
    quantity?: IntFilter<"BillItem"> | number
    unit_price?: DecimalFilter<"BillItem"> | Decimal | DecimalJsLike | number | string
    total?: DecimalFilter<"BillItem"> | Decimal | DecimalJsLike | number | string
  }

  export type CompanyUpsertWithoutProductsInput = {
    update: XOR<CompanyUpdateWithoutProductsInput, CompanyUncheckedUpdateWithoutProductsInput>
    create: XOR<CompanyCreateWithoutProductsInput, CompanyUncheckedCreateWithoutProductsInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutProductsInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutProductsInput, CompanyUncheckedUpdateWithoutProductsInput>
  }

  export type CompanyUpdateWithoutProductsInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branches?: BranchUpdateManyWithoutCompanyNestedInput
    users?: UserUpdateManyWithoutCompanyNestedInput
    bills?: BillUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutProductsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branches?: BranchUncheckedUpdateManyWithoutCompanyNestedInput
    users?: UserUncheckedUpdateManyWithoutCompanyNestedInput
    bills?: BillUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type BranchUpsertWithoutProductsInput = {
    update: XOR<BranchUpdateWithoutProductsInput, BranchUncheckedUpdateWithoutProductsInput>
    create: XOR<BranchCreateWithoutProductsInput, BranchUncheckedCreateWithoutProductsInput>
    where?: BranchWhereInput
  }

  export type BranchUpdateToOneWithWhereWithoutProductsInput = {
    where?: BranchWhereInput
    data: XOR<BranchUpdateWithoutProductsInput, BranchUncheckedUpdateWithoutProductsInput>
  }

  export type BranchUpdateWithoutProductsInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutBranchesNestedInput
    users?: UserUpdateManyWithoutBranchNestedInput
    logs?: UserLogUpdateManyWithoutBranchNestedInput
    bills?: BillUpdateManyWithoutBranchNestedInput
  }

  export type BranchUncheckedUpdateWithoutProductsInput = {
    id?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutBranchNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutBranchNestedInput
    bills?: BillUncheckedUpdateManyWithoutBranchNestedInput
  }

  export type CompanyCreateWithoutBillsInput = {
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    branches?: BranchCreateNestedManyWithoutCompanyInput
    users?: UserCreateNestedManyWithoutCompanyInput
    products?: ProductCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutBillsInput = {
    id?: number
    name: string
    code: string
    email?: string | null
    phone?: string | null
    address?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    branches?: BranchUncheckedCreateNestedManyWithoutCompanyInput
    users?: UserUncheckedCreateNestedManyWithoutCompanyInput
    products?: ProductUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutBillsInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutBillsInput, CompanyUncheckedCreateWithoutBillsInput>
  }

  export type BranchCreateWithoutBillsInput = {
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutBranchesInput
    users?: UserCreateNestedManyWithoutBranchInput
    logs?: UserLogCreateNestedManyWithoutBranchInput
    products?: ProductCreateNestedManyWithoutBranchInput
  }

  export type BranchUncheckedCreateWithoutBillsInput = {
    id?: number
    company_id: number
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutBranchInput
    logs?: UserLogUncheckedCreateNestedManyWithoutBranchInput
    products?: ProductUncheckedCreateNestedManyWithoutBranchInput
  }

  export type BranchCreateOrConnectWithoutBillsInput = {
    where: BranchWhereUniqueInput
    create: XOR<BranchCreateWithoutBillsInput, BranchUncheckedCreateWithoutBillsInput>
  }

  export type UserCreateWithoutBillsInput = {
    username: string
    password: string
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutUsersInput
    branch?: BranchCreateNestedOneWithoutUsersInput
    info?: UserInfoCreateNestedOneWithoutUserInput
    userRoles?: UserRoleCreateNestedManyWithoutUserInput
    logs?: UserLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutBillsInput = {
    id?: number
    username: string
    password: string
    company_id: number
    branch_id?: number | null
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    info?: UserInfoUncheckedCreateNestedOneWithoutUserInput
    userRoles?: UserRoleUncheckedCreateNestedManyWithoutUserInput
    logs?: UserLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutBillsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBillsInput, UserUncheckedCreateWithoutBillsInput>
  }

  export type BillItemCreateWithoutBillInput = {
    quantity: number
    unit_price: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    product: ProductCreateNestedOneWithoutBillItemsInput
  }

  export type BillItemUncheckedCreateWithoutBillInput = {
    id?: number
    product_id: number
    quantity: number
    unit_price: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type BillItemCreateOrConnectWithoutBillInput = {
    where: BillItemWhereUniqueInput
    create: XOR<BillItemCreateWithoutBillInput, BillItemUncheckedCreateWithoutBillInput>
  }

  export type BillItemCreateManyBillInputEnvelope = {
    data: BillItemCreateManyBillInput | BillItemCreateManyBillInput[]
    skipDuplicates?: boolean
  }

  export type CompanyUpsertWithoutBillsInput = {
    update: XOR<CompanyUpdateWithoutBillsInput, CompanyUncheckedUpdateWithoutBillsInput>
    create: XOR<CompanyCreateWithoutBillsInput, CompanyUncheckedCreateWithoutBillsInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutBillsInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutBillsInput, CompanyUncheckedUpdateWithoutBillsInput>
  }

  export type CompanyUpdateWithoutBillsInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branches?: BranchUpdateManyWithoutCompanyNestedInput
    users?: UserUpdateManyWithoutCompanyNestedInput
    products?: ProductUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutBillsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branches?: BranchUncheckedUpdateManyWithoutCompanyNestedInput
    users?: UserUncheckedUpdateManyWithoutCompanyNestedInput
    products?: ProductUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type BranchUpsertWithoutBillsInput = {
    update: XOR<BranchUpdateWithoutBillsInput, BranchUncheckedUpdateWithoutBillsInput>
    create: XOR<BranchCreateWithoutBillsInput, BranchUncheckedCreateWithoutBillsInput>
    where?: BranchWhereInput
  }

  export type BranchUpdateToOneWithWhereWithoutBillsInput = {
    where?: BranchWhereInput
    data: XOR<BranchUpdateWithoutBillsInput, BranchUncheckedUpdateWithoutBillsInput>
  }

  export type BranchUpdateWithoutBillsInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutBranchesNestedInput
    users?: UserUpdateManyWithoutBranchNestedInput
    logs?: UserLogUpdateManyWithoutBranchNestedInput
    products?: ProductUpdateManyWithoutBranchNestedInput
  }

  export type BranchUncheckedUpdateWithoutBillsInput = {
    id?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutBranchNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutBranchNestedInput
    products?: ProductUncheckedUpdateManyWithoutBranchNestedInput
  }

  export type UserUpsertWithoutBillsInput = {
    update: XOR<UserUpdateWithoutBillsInput, UserUncheckedUpdateWithoutBillsInput>
    create: XOR<UserCreateWithoutBillsInput, UserUncheckedCreateWithoutBillsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutBillsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutBillsInput, UserUncheckedUpdateWithoutBillsInput>
  }

  export type UserUpdateWithoutBillsInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    branch?: BranchUpdateOneWithoutUsersNestedInput
    info?: UserInfoUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUpdateManyWithoutUserNestedInput
    logs?: UserLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutBillsInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    info?: UserInfoUncheckedUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUncheckedUpdateManyWithoutUserNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type BillItemUpsertWithWhereUniqueWithoutBillInput = {
    where: BillItemWhereUniqueInput
    update: XOR<BillItemUpdateWithoutBillInput, BillItemUncheckedUpdateWithoutBillInput>
    create: XOR<BillItemCreateWithoutBillInput, BillItemUncheckedCreateWithoutBillInput>
  }

  export type BillItemUpdateWithWhereUniqueWithoutBillInput = {
    where: BillItemWhereUniqueInput
    data: XOR<BillItemUpdateWithoutBillInput, BillItemUncheckedUpdateWithoutBillInput>
  }

  export type BillItemUpdateManyWithWhereWithoutBillInput = {
    where: BillItemScalarWhereInput
    data: XOR<BillItemUpdateManyMutationInput, BillItemUncheckedUpdateManyWithoutBillInput>
  }

  export type BillCreateWithoutItemsInput = {
    bill_number: string
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutBillsInput
    branch: BranchCreateNestedOneWithoutBillsInput
    cashier: UserCreateNestedOneWithoutBillsInput
  }

  export type BillUncheckedCreateWithoutItemsInput = {
    id?: number
    bill_number: string
    company_id: number
    branch_id: number
    cashier_id: number
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type BillCreateOrConnectWithoutItemsInput = {
    where: BillWhereUniqueInput
    create: XOR<BillCreateWithoutItemsInput, BillUncheckedCreateWithoutItemsInput>
  }

  export type ProductCreateWithoutBillItemsInput = {
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutProductsInput
    branch?: BranchCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateWithoutBillItemsInput = {
    id?: number
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    company_id: number
    branch_id?: number | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProductCreateOrConnectWithoutBillItemsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutBillItemsInput, ProductUncheckedCreateWithoutBillItemsInput>
  }

  export type BillUpsertWithoutItemsInput = {
    update: XOR<BillUpdateWithoutItemsInput, BillUncheckedUpdateWithoutItemsInput>
    create: XOR<BillCreateWithoutItemsInput, BillUncheckedCreateWithoutItemsInput>
    where?: BillWhereInput
  }

  export type BillUpdateToOneWithWhereWithoutItemsInput = {
    where?: BillWhereInput
    data: XOR<BillUpdateWithoutItemsInput, BillUncheckedUpdateWithoutItemsInput>
  }

  export type BillUpdateWithoutItemsInput = {
    bill_number?: StringFieldUpdateOperationsInput | string
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutBillsNestedInput
    branch?: BranchUpdateOneRequiredWithoutBillsNestedInput
    cashier?: UserUpdateOneRequiredWithoutBillsNestedInput
  }

  export type BillUncheckedUpdateWithoutItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_number?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: IntFieldUpdateOperationsInput | number
    cashier_id?: IntFieldUpdateOperationsInput | number
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpsertWithoutBillItemsInput = {
    update: XOR<ProductUpdateWithoutBillItemsInput, ProductUncheckedUpdateWithoutBillItemsInput>
    create: XOR<ProductCreateWithoutBillItemsInput, ProductUncheckedCreateWithoutBillItemsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutBillItemsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutBillItemsInput, ProductUncheckedUpdateWithoutBillItemsInput>
  }

  export type ProductUpdateWithoutBillItemsInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutProductsNestedInput
    branch?: BranchUpdateOneWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutBillItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BranchCreateManyCompanyInput = {
    id?: number
    name: string
    code: string
    address?: string | null
    phone?: string | null
    email?: string | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserCreateManyCompanyInput = {
    id?: number
    username: string
    password: string
    branch_id?: number | null
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProductCreateManyCompanyInput = {
    id?: number
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    branch_id?: number | null
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type BillCreateManyCompanyInput = {
    id?: number
    bill_number: string
    branch_id: number
    cashier_id: number
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type BranchUpdateWithoutCompanyInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutBranchNestedInput
    logs?: UserLogUpdateManyWithoutBranchNestedInput
    products?: ProductUpdateManyWithoutBranchNestedInput
    bills?: BillUpdateManyWithoutBranchNestedInput
  }

  export type BranchUncheckedUpdateWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutBranchNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutBranchNestedInput
    products?: ProductUncheckedUpdateManyWithoutBranchNestedInput
    bills?: BillUncheckedUpdateManyWithoutBranchNestedInput
  }

  export type BranchUncheckedUpdateManyWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpdateWithoutCompanyInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branch?: BranchUpdateOneWithoutUsersNestedInput
    bills?: BillUpdateManyWithoutCashierNestedInput
    info?: UserInfoUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUpdateManyWithoutUserNestedInput
    logs?: UserLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    bills?: BillUncheckedUpdateManyWithoutCashierNestedInput
    info?: UserInfoUncheckedUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUncheckedUpdateManyWithoutUserNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpdateWithoutCompanyInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    billItems?: BillItemUpdateManyWithoutProductNestedInput
    branch?: BranchUpdateOneWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    billItems?: BillItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateManyWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BillUpdateWithoutCompanyInput = {
    bill_number?: StringFieldUpdateOperationsInput | string
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branch?: BranchUpdateOneRequiredWithoutBillsNestedInput
    cashier?: UserUpdateOneRequiredWithoutBillsNestedInput
    items?: BillItemUpdateManyWithoutBillNestedInput
  }

  export type BillUncheckedUpdateWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_number?: StringFieldUpdateOperationsInput | string
    branch_id?: IntFieldUpdateOperationsInput | number
    cashier_id?: IntFieldUpdateOperationsInput | number
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: BillItemUncheckedUpdateManyWithoutBillNestedInput
  }

  export type BillUncheckedUpdateManyWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_number?: StringFieldUpdateOperationsInput | string
    branch_id?: IntFieldUpdateOperationsInput | number
    cashier_id?: IntFieldUpdateOperationsInput | number
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyBranchInput = {
    id?: number
    username: string
    password: string
    company_id: number
    user_type?: $Enums.UserType
    status?: $Enums.UserStatus
    failed_login_attempts?: number
    last_failed_login?: Date | string | null
    account_locked_until?: Date | string | null
    last_login_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserLogCreateManyBranchInput = {
    id?: number
    userId: number
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address?: string | null
    user_agent?: string | null
    device_info?: string | null
    created_at?: Date | string
  }

  export type ProductCreateManyBranchInput = {
    id?: number
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    cost_price?: Decimal | DecimalJsLike | number | string | null
    quantity?: number
    min_quantity?: number
    company_id: number
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type BillCreateManyBranchInput = {
    id?: number
    bill_number: string
    company_id: number
    cashier_id: number
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserUpdateWithoutBranchInput = {
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutUsersNestedInput
    bills?: BillUpdateManyWithoutCashierNestedInput
    info?: UserInfoUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUpdateManyWithoutUserNestedInput
    logs?: UserLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutBranchInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    bills?: BillUncheckedUpdateManyWithoutCashierNestedInput
    info?: UserInfoUncheckedUpdateOneWithoutUserNestedInput
    userRoles?: UserRoleUncheckedUpdateManyWithoutUserNestedInput
    logs?: UserLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutBranchInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    user_type?: EnumUserTypeFieldUpdateOperationsInput | $Enums.UserType
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    failed_login_attempts?: IntFieldUpdateOperationsInput | number
    last_failed_login?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    account_locked_until?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_login_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserLogUpdateWithoutBranchInput = {
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLogsNestedInput
  }

  export type UserLogUncheckedUpdateWithoutBranchInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserLogUncheckedUpdateManyWithoutBranchInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpdateWithoutBranchInput = {
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    billItems?: BillItemUpdateManyWithoutProductNestedInput
    company?: CompanyUpdateOneRequiredWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutBranchInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    billItems?: BillItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateManyWithoutBranchInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cost_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    quantity?: IntFieldUpdateOperationsInput | number
    min_quantity?: IntFieldUpdateOperationsInput | number
    company_id?: IntFieldUpdateOperationsInput | number
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BillUpdateWithoutBranchInput = {
    bill_number?: StringFieldUpdateOperationsInput | string
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutBillsNestedInput
    cashier?: UserUpdateOneRequiredWithoutBillsNestedInput
    items?: BillItemUpdateManyWithoutBillNestedInput
  }

  export type BillUncheckedUpdateWithoutBranchInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_number?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    cashier_id?: IntFieldUpdateOperationsInput | number
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: BillItemUncheckedUpdateManyWithoutBillNestedInput
  }

  export type BillUncheckedUpdateManyWithoutBranchInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_number?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    cashier_id?: IntFieldUpdateOperationsInput | number
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BillCreateManyCashierInput = {
    id?: number
    bill_number: string
    company_id: number
    branch_id: number
    status?: $Enums.BillStatus
    payment_method?: $Enums.PaymentMethod
    subtotal: Decimal | DecimalJsLike | number | string
    discount?: Decimal | DecimalJsLike | number | string
    tax?: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserRoleCreateManyUserInput = {
    id?: number
    roleId: number
  }

  export type UserLogCreateManyUserInput = {
    id?: number
    branch_id?: number | null
    action: $Enums.LogAction
    status: $Enums.LogStatus
    ip_address?: string | null
    user_agent?: string | null
    device_info?: string | null
    created_at?: Date | string
  }

  export type BillUpdateWithoutCashierInput = {
    bill_number?: StringFieldUpdateOperationsInput | string
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutBillsNestedInput
    branch?: BranchUpdateOneRequiredWithoutBillsNestedInput
    items?: BillItemUpdateManyWithoutBillNestedInput
  }

  export type BillUncheckedUpdateWithoutCashierInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_number?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: IntFieldUpdateOperationsInput | number
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: BillItemUncheckedUpdateManyWithoutBillNestedInput
  }

  export type BillUncheckedUpdateManyWithoutCashierInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_number?: StringFieldUpdateOperationsInput | string
    company_id?: IntFieldUpdateOperationsInput | number
    branch_id?: IntFieldUpdateOperationsInput | number
    status?: EnumBillStatusFieldUpdateOperationsInput | $Enums.BillStatus
    payment_method?: EnumPaymentMethodFieldUpdateOperationsInput | $Enums.PaymentMethod
    subtotal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    discount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tax?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRoleUpdateWithoutUserInput = {
    role?: RoleUpdateOneRequiredWithoutUserRolesNestedInput
  }

  export type UserRoleUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    roleId?: IntFieldUpdateOperationsInput | number
  }

  export type UserRoleUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    roleId?: IntFieldUpdateOperationsInput | number
  }

  export type UserLogUpdateWithoutUserInput = {
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    branch?: BranchUpdateOneWithoutLogsNestedInput
  }

  export type UserLogUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserLogUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    branch_id?: NullableIntFieldUpdateOperationsInput | number | null
    action?: EnumLogActionFieldUpdateOperationsInput | $Enums.LogAction
    status?: EnumLogStatusFieldUpdateOperationsInput | $Enums.LogStatus
    ip_address?: NullableStringFieldUpdateOperationsInput | string | null
    user_agent?: NullableStringFieldUpdateOperationsInput | string | null
    device_info?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRoleCreateManyRoleInput = {
    id?: number
    userId: number
  }

  export type RoleAuthorityCreateManyRoleInput = {
    id?: number
    authorityId: number
  }

  export type UserRoleUpdateWithoutRoleInput = {
    user?: UserUpdateOneRequiredWithoutUserRolesNestedInput
  }

  export type UserRoleUncheckedUpdateWithoutRoleInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type UserRoleUncheckedUpdateManyWithoutRoleInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type RoleAuthorityUpdateWithoutRoleInput = {
    authority?: AuthorityUpdateOneRequiredWithoutRolesNestedInput
  }

  export type RoleAuthorityUncheckedUpdateWithoutRoleInput = {
    id?: IntFieldUpdateOperationsInput | number
    authorityId?: IntFieldUpdateOperationsInput | number
  }

  export type RoleAuthorityUncheckedUpdateManyWithoutRoleInput = {
    id?: IntFieldUpdateOperationsInput | number
    authorityId?: IntFieldUpdateOperationsInput | number
  }

  export type RoleAuthorityCreateManyAuthorityInput = {
    id?: number
    roleId: number
  }

  export type RoleAuthorityUpdateWithoutAuthorityInput = {
    role?: RoleUpdateOneRequiredWithoutAuthoritiesNestedInput
  }

  export type RoleAuthorityUncheckedUpdateWithoutAuthorityInput = {
    id?: IntFieldUpdateOperationsInput | number
    roleId?: IntFieldUpdateOperationsInput | number
  }

  export type RoleAuthorityUncheckedUpdateManyWithoutAuthorityInput = {
    id?: IntFieldUpdateOperationsInput | number
    roleId?: IntFieldUpdateOperationsInput | number
  }

  export type BillItemCreateManyProductInput = {
    id?: number
    bill_id: number
    quantity: number
    unit_price: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type BillItemUpdateWithoutProductInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    bill?: BillUpdateOneRequiredWithoutItemsNestedInput
  }

  export type BillItemUncheckedUpdateWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_id?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type BillItemUncheckedUpdateManyWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    bill_id?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type BillItemCreateManyBillInput = {
    id?: number
    product_id: number
    quantity: number
    unit_price: Decimal | DecimalJsLike | number | string
    total: Decimal | DecimalJsLike | number | string
  }

  export type BillItemUpdateWithoutBillInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    product?: ProductUpdateOneRequiredWithoutBillItemsNestedInput
  }

  export type BillItemUncheckedUpdateWithoutBillInput = {
    id?: IntFieldUpdateOperationsInput | number
    product_id?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type BillItemUncheckedUpdateManyWithoutBillInput = {
    id?: IntFieldUpdateOperationsInput | number
    product_id?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    unit_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}