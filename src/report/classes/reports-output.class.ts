export class CustomerOutput {
    cat: string
    customerCount: number
    AllCustomersCount: number
    totalCount: number
}
//done successfull
export class NoMovingOutput {
    cat: string
    name: string
    noMovingDays: number
    lastTransaction: Date
}
//done successfully
export class SlowMovingOutput {
    cat: string
    name: string
    expectedMonthlyQtySold: number
    actualMonthlyQtySold: number
}
//done successfuly
export class TopRecordsOutput {
    cat: string
    name: string
    count: number
    value: number
}
//done successfuly
export class AvgBasketSizeOutput {
    count: number
    avg: number
}

export class GrossSalesOutput {
    cat: string
    name: string
    totalAmount: number
    date: Date
}

export class LogsSystemDataOutput {
    email: string
    role: string
    action: string
    date: Date
    time: Date
}