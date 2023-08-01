export enum RolesEnum {
    SUPER_ADMIN = 'SUPER_ADMIN',
    CASHIER = 'CASHIER',
    INVENTORYMAN = 'INVENTORYMAN',
    CHEF= 'CHEF',
    CUSTOMER = 'CUSTOMER',
    RESTURANT='RESTURANT',
    MERCHANT='MERCHANT',
    WAITER= 'WAITER',
}

export const RoleGroups = {
    ADMINSTRATION: [RolesEnum.SUPER_ADMIN],
    REGISTRATION: [RolesEnum.RESTURANT, RolesEnum.MERCHANT,RolesEnum.CUSTOMER],
    BUSSINESS: [RolesEnum.RESTURANT, RolesEnum.MERCHANT],
    BUSSINESS_ADMINSTRATION: [RolesEnum.RESTURANT, RolesEnum.MERCHANT,RolesEnum.SUPER_ADMIN],
    BUSSINESS_CUSTOMER: [RolesEnum.RESTURANT, RolesEnum.MERCHANT,RolesEnum.CUSTOMER],
    BUSSINESS_CASHIER: [RolesEnum.RESTURANT, RolesEnum.MERCHANT, RolesEnum.CASHIER],
    BUSSINESS_CASHIER_INVENTORY: [RolesEnum.RESTURANT, RolesEnum.MERCHANT, RolesEnum.CASHIER, RolesEnum.INVENTORYMAN],
    BUSSINESS_CASHIER_CUSTOMER: [RolesEnum.RESTURANT, RolesEnum.MERCHANT, RolesEnum.CASHIER, RolesEnum.CUSTOMER],
    BUSSINESS_CASHIER_WAITER_CUSTOMER: [RolesEnum.RESTURANT, RolesEnum.MERCHANT, RolesEnum.CASHIER, RolesEnum.CUSTOMER ,RolesEnum.WAITER],
    BUSSINESS_CASHIER_WAITER: [RolesEnum.RESTURANT, RolesEnum.MERCHANT, RolesEnum.CASHIER ,RolesEnum.WAITER],
    BUSSINESS_PROFILE_CUSTOMER: [
        RolesEnum.RESTURANT,
        RolesEnum.MERCHANT,
        RolesEnum.CASHIER,
        RolesEnum.WAITER,
        RolesEnum.CHEF,
        RolesEnum.INVENTORYMAN,
        RolesEnum.CUSTOMER
      ],
    PROFILE: [
        // RolesEnum.RESTURANT,
        // RolesEnum.MERCHANT,
        RolesEnum.CASHIER,
        RolesEnum.WAITER,
        RolesEnum.CHEF,
        RolesEnum.INVENTORYMAN
      ],


}  

