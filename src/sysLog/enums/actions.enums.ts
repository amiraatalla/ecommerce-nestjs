export enum ActionsEnum {
  /*
   *User
   */
  CREATE_USER = 'Create User',
  SEARCH_USER = 'Search User',
  GET_ME_USER = 'Get Me User',
  UPDATE_ME_USER = 'Update Me User',
  DELETE_ME_USER = 'Delete Me User',
  GET_USER = 'Get User',
  UPDATE_USER = 'Update User',
  DELETE_USER = 'Delete User',

  /*
   *User
   */
  CREATE_CUSTOMER = 'Create Customer',
  SEARCH_CUSTOMER = 'Search Customer',
  GET_ME_CUSTOMER = 'Get Me Customer',
  UPDATE_ME_CUSTOMER = 'Update Me Customer',
  DELETE_ME_CUSTOMER = 'Delete Me Customer',
  GET_CUSTOMER = 'Get Customer',
  UPDATE_CUSTOMER = 'Update Customer',
  DELETE_CUSTOMER = 'Delete Customer',

  /**
   * Coupon
   */

  CREATE_COUPON = 'CREATE_COUPON',
  UPDATE_COUPON = 'UPDATE_COUPON',
  GET_COUPON = 'GET_COUPON',

  CREATE_CART = 'CREATE_CART',
  UPDATE_CART = 'UPDATE_CART',
  GET_CART = 'GET_CART',
  /**
 * Warehouse
 */

  CREATE_WAREHOUSE = 'CREATE_WAREHOUSE',
  UPDATE_WAREHOUSE = 'UPDATE_WAREHOUSE',
  GET_WAREHOUSE = 'GET_WAREHOUSE',
  SEARCH_WAREHOUSE = 'SEARCH_WAREHOUSE',


  /**
* Warehouse
*/

  CREATE_TABLE = 'CREATE_TABLE',
  UPDATE_TABLE = 'UPDATE_TABLE',
  DELETE_TABLE = 'DELETE_TABLE',
  GET_TABLE = 'GET_TABLE',
  SEARCH_TABLE = 'SEARCH_TABLE',

  /**
   * Coupon
   */

  CREATE_NOTE = 'CREATE_NOTE',
  UPDATE_NOTE = 'UPDATE_NOTE',
  GET_NOTE = 'GET_NOTE',

  /**
   * ENTITIES
   */

  CREATE_ENTITIES = 'CREATE_ENTITIES',
  UPDATE_ENTITIES = 'UPDATE_ENTITIES',
  DELETE_ENTITIES = 'DELETE_ENTITIES',

  /**
   * ORDER
   */

  CREATE_ORDER = 'CREATE_ORDER',
  GET_ORDER = 'GET_ORDER',
  UPDATE_ORDER = 'UPDATE_ORDER',
  DELETE_ORDER = 'DELETE_ORDER',

  /*
   * Auth
   */
  SIGN_IN = 'Sign in',
  LOG_OUT = 'Log out',
  PROTECTED = 'Protected',
  //
  FAILED_SIGN_IN = 'Sign in Failed',
  /*
   * io4
   */
  CREATE_IO4 = 'Create io4',
  SEARCH_IO4 = 'Search io4',
  GET_IO4 = 'Get io4',
  UPDATE_IO4 = 'Update io4',
  UPDATE_IO4_ITEM_CODE = 'Update io4 Item Code',
  /*
   * io4 archive
   */
  CREATE_IO4_ARCHIVE_BY_ID = 'Create io4 archive by id',
  CREATE_IO4_ARCHIVE_ALL = 'Create io4 archive all',
  /*
   * proxy
   */
  BUSSINESS_CLIENTS_GET_STATIONS = 'Bussiness clients Get Stations',
  GET_CITYES = 'Get Cityes',
  BUSSINESS_CLIENTS_GET_CITYES = 'Bussiness clients Get Cityes',
  BUSSINESS_CLIENTS_GET_REGIONS = 'Bussiness clients Get Regions',
  PAYMENT_METHOD = 'Payment Method',
  BUSSINESS_CLIENTS_PARCELS_DELIVERIES = 'Bussiness clients Parcels deliveries',
  BUSSINESS_CLIENTS_PARCELS_RETURNS = 'Bussiness clients Parcels Returns',
  BUSSINESS_CLIENTS_GET_DOCUMENTS_SHIPPING_LABEL_PARCELS = 'Bussiness clients Get Documents Shipping-label Parcels',
  GET_DOCUMENTS_SHIPPING_LABEL_PARCELS = 'Get Documents Shipping-label Parcels',
  BUSSINESS_CLIENTS_GET_PARCELS = 'Bussiness clients Get Parcels',
  BUSSINESS_CLIENTS_GET_PARCELS_ID = 'Bussiness clients Get Parcels id',
  GET_BUSSINESS_CLIENTS = 'Get Bussiness clients',
  BUSSINESS_CLIENTS_GET_PAYMENT_METHOD = 'Bussiness clients Get Payment Method',
  PRODUCTS_STOCK_CSV = 'Products Stock CSV',
  GET_CHECK_STATUS = 'Get Check States',
  /*
   * packages
   */
  CREATE_PACKAGE = 'Create Package',
  SEARCH_PACKAGES = 'Search Packages',
  GET_PACKAGE = 'Get Package',
  UPDATE_PACKAGE = 'Update Package',
  UPDATE_PACKAGE_STATUS = 'Update Package Status',
  /*
   * logs
   */
  SEARCH_LOGS = 'Search logs',
  GET_LOG = 'Get log',
  DELETE_LOG = 'Delete log',
}

export const ActionsGroups = {
  USER: [
    ActionsEnum.CREATE_USER,
    ActionsEnum.SEARCH_USER,
    ActionsEnum.GET_ME_USER,
    ActionsEnum.UPDATE_ME_USER,
    ActionsEnum.DELETE_ME_USER,
    ActionsEnum.GET_USER,
    ActionsEnum.UPDATE_USER,
    ActionsEnum.DELETE_USER,
  ],
  CUSTOMER: [
    ActionsEnum.CREATE_CUSTOMER,
    ActionsEnum.SEARCH_CUSTOMER,
    ActionsEnum.GET_ME_CUSTOMER,
    ActionsEnum.UPDATE_ME_CUSTOMER,
    ActionsEnum.DELETE_ME_CUSTOMER,
    ActionsEnum.GET_CUSTOMER,
    ActionsEnum.UPDATE_CUSTOMER,
    ActionsEnum.DELETE_CUSTOMER,
  ],

  COUPON: [
    ActionsEnum.CREATE_COUPON,
    ActionsEnum.UPDATE_COUPON,
    ActionsEnum.GET_COUPON,
  ],

  CART: [
    ActionsEnum.CREATE_CART,
    ActionsEnum.UPDATE_CART,
    ActionsEnum.GET_CART,
  ],
  WAREHOUSE: [
    ActionsEnum.CREATE_WAREHOUSE,
    ActionsEnum.UPDATE_WAREHOUSE,
    ActionsEnum.GET_WAREHOUSE,
    ActionsEnum.SEARCH_WAREHOUSE,
  ],
  TABLE: [
    ActionsEnum.CREATE_TABLE,
    ActionsEnum.UPDATE_TABLE,
    ActionsEnum.GET_TABLE,
    ActionsEnum.SEARCH_TABLE,
  ],
  NOTE: [
    ActionsEnum.CREATE_NOTE,
    ActionsEnum.UPDATE_NOTE,
    ActionsEnum.GET_NOTE,
  ],
  ENTITIES: [
    ActionsEnum.CREATE_ENTITIES,
    ActionsEnum.UPDATE_ENTITIES,
    ActionsEnum.DELETE_ENTITIES,
  ],
  ORDER: [
    ActionsEnum.CREATE_ORDER,
    ActionsEnum.UPDATE_ORDER,
    ActionsEnum.DELETE_ORDER,
    ActionsEnum.GET_ORDER,
  ],
  AUTH: [ActionsEnum.SIGN_IN, ActionsEnum.LOG_OUT, ActionsEnum.PROTECTED],
  IO4: [
    ActionsEnum.CREATE_IO4,
    ActionsEnum.SEARCH_IO4,
    ActionsEnum.GET_IO4,
    ActionsEnum.UPDATE_IO4,
    ActionsEnum.UPDATE_IO4_ITEM_CODE,
  ],
  PROXY: [
    ActionsEnum.BUSSINESS_CLIENTS_GET_STATIONS,
    ActionsEnum.GET_CITYES,
    ActionsEnum.BUSSINESS_CLIENTS_GET_CITYES,
    ActionsEnum.BUSSINESS_CLIENTS_GET_REGIONS,
    ActionsEnum.PAYMENT_METHOD,
    ActionsEnum.BUSSINESS_CLIENTS_PARCELS_DELIVERIES,
    ActionsEnum.BUSSINESS_CLIENTS_PARCELS_RETURNS,
    ActionsEnum.BUSSINESS_CLIENTS_GET_DOCUMENTS_SHIPPING_LABEL_PARCELS,
    ActionsEnum.GET_DOCUMENTS_SHIPPING_LABEL_PARCELS,
    ActionsEnum.BUSSINESS_CLIENTS_GET_PARCELS,
    ActionsEnum.BUSSINESS_CLIENTS_GET_PARCELS_ID,
    ActionsEnum.GET_BUSSINESS_CLIENTS,
    ActionsEnum.BUSSINESS_CLIENTS_GET_PAYMENT_METHOD,
    ActionsEnum.PRODUCTS_STOCK_CSV,
    ActionsEnum.GET_CHECK_STATUS,
  ],
  PACKAGE: [
    ActionsEnum.CREATE_PACKAGE,
    ActionsEnum.SEARCH_PACKAGES,
    ActionsEnum.GET_PACKAGE,
    ActionsEnum.UPDATE_PACKAGE,
    ActionsEnum.UPDATE_PACKAGE_STATUS,
  ],
  LOGS: [ActionsEnum.SEARCH_LOGS, ActionsEnum.GET_LOG, ActionsEnum.DELETE_LOG],
};
