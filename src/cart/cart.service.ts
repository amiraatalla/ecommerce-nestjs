import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { BaseService, Pagination } from 'src/core/shared';
import { generateCode } from 'src/core/utils';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { StockItemDataService } from 'src/stock-item-data/stock-item-data.service';
import { StatusEnum } from 'src/users/enums/status.enum';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartSearchOptions } from './dto/cart-search-options.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart, CartDoc } from './entities/cart.entity';
import {
  WarehouseStockItems,
  WarehouseStockItemsDoc,
} from 'src/stock-item-data/entities/stock-item.entity';
import { UpdateQtyDto } from './dto/update-qty.dto';
import { resourceLimits } from 'worker_threads';
import { CartItems } from './dto/create-item.dto';
import { AddItemDto } from './dto/add-item.dto';

@Injectable()
export class CartService extends BaseService<CartDoc> {
  constructor(
    @InjectModel(Cart.name) readonly m: Model<CartDoc>,
    @InjectModel(WarehouseStockItems.name)
    readonly warehouseStockItems: Model<WarehouseStockItemsDoc>,
    private readonly sysLogsService: SYSLogService,
    @Inject(forwardRef(() => StockItemDataService))
    private readonly stockItemService: StockItemDataService,

  ) {
    super(m);
  }


  /// done

  async createCart(req: RequestWithUser, dto: CreateCartDto) {
    let CartItem = {};
    let CartItems = [];
    let nameLocalized;
    let qty;
    let stockItemId;
    let sellingPrice;

    for (const item in dto.cartItems) {
      const stockItem = await this.stockItemService.findOneById(
        dto.cartItems[item].stockItemId,
      );
      console.log('stockItem', stockItem);

      if (stockItem) {
        const warehouseItem = await this.warehouseStockItems.findOne({
          _id: stockItem.warehouseStockItemsData,
        });
        console.log('warehouseItem', warehouseItem);

        qty = dto.cartItems[item].qty;
        nameLocalized = stockItem.nameLocalized;
        stockItemId = this.toObjectId(stockItem._id);
        sellingPrice = warehouseItem.sellingPrice;


        CartItem = {
          stockItemId: stockItemId,
          nameLocalized: nameLocalized,
          qty: qty,
          sellingPrice: sellingPrice,
        }
        console.log("CartItem", CartItem);

        CartItems.push(CartItem);
      }
    }
    console.log("CartItems", CartItems);



    const Cart = await this.create({
      entityId: this.toObjectId(dto.entityId),
      customerId: this.toObjectId(dto.customerId),
      cartItems: CartItems,

    });
    console.log("Cart", Cart);
    return Cart;
  }


  async addItemsToCart(req: RequestWithUser, dto: AddItemDto) {
    let CartItem = {};
    let nameLocalized;
    let qty = 0;
    let stockItemId;
    let sellingPrice;
    let subTotal = 0;
    let itemTotal = 0;
    let img;
    let result;


    const Cart = await this.findOne({ customerId: this.toObjectId(req.user._id) });
    if (!Cart) throw new NotFoundException('026,R026');
    const stockItem = await this.stockItemService.findOne({
      _id: this.toObjectId(dto.stockItemId)
    });

    console.log("stockItem");

    if (stockItem) {
      const warehouseItem = await this.warehouseStockItems.findOne({
        _id: stockItem.warehouseStockItemsData,
      });
      console.log('warehouseItem', warehouseItem);

      sellingPrice = warehouseItem.sellingPrice;
      nameLocalized = stockItem.nameLocalized;
      stockItemId = stockItem._id;
      img = stockItem.picture;
      qty = dto.qty;
      itemTotal = qty * sellingPrice;

      CartItem = {
        stockItemId: stockItemId,
        nameLocalized: nameLocalized,
        qty: qty,
        sellingPrice: sellingPrice,
        itemTotal: itemTotal,
        img: img,
      }

      subTotal = Cart.subTotal + itemTotal;
      console.log("subTo", subTotal, Cart.subTotal);

    }

    if (Cart.entityId.equals(this.toObjectId(stockItem.entityId))) {
      console.log("3");
      if (Cart.cartItems.length > 0) {
        console.log("4");
        subTotal = Cart.subTotal + (dto.qty * sellingPrice);
        console.log("subTo2", subTotal, Cart.subTotal);

        const target = await this.findOne({
          _id: Cart._id,
          'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
        }, {
          cartItems: { $elemMatch: { stockItemId: this.toObjectId(dto.stockItemId) } }
        }
        );
        console.log("target", target);
        if (target) {
          result = await this.updateOne({
            _id: Cart._id,
            'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
          }, {
            $set: {
              'cartItems.$.qty': target.cartItems[0].qty + dto.qty,
              'cartItems.$.itemTotal': target.cartItems[0].itemTotal + (dto.qty * sellingPrice),
            },
            subTotal: subTotal
          }
          );
        }
        else {
          console.log("1");
          result = await this.update(Cart._id, { subTotal: subTotal, entityId: this.toObjectId(stockItem.entityId), $push: { cartItems: CartItem } })
        }
      }
      else {
        console.log("6");
        let CartItems = [];
        CartItems.push(CartItem);
        result = await this.update(Cart._id, { subTotal: itemTotal, entityId: this.toObjectId(stockItem.entityId), cartItems: CartItems })
  
      }
  }
    else {
      console.log("2");
      let CartItems = [];
      CartItems.push(CartItem);
      result = await this.update(Cart._id, { subTotal: itemTotal, entityId: this.toObjectId(stockItem.entityId), cartItems: CartItems })

    }


    let aggregation = [];
    aggregation.push(
      {
        $match:
          { _id: this.toObjectId(result._id) }
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerData'
        }
      }
    );
    const data = await this.m.aggregate(aggregation);
    return data[0];

  }



  /**
   * Edit Carts collection.
   */

  async findMyCart(req: RequestWithUser) {
    let aggregation = [];
    aggregation.push(
      {
        $match: {
          customerId: req.user._id
        }
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerData'
        }
      }


    );
    const result = await this.m.aggregate(aggregation);
    if (!result) throw new NotFoundException('026,R026');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_CART,
    });
    return result[0];
  }


  /**
   * Edit Carts collection.
   */

  async findCart(req: RequestWithUser, id: string) {
    let aggregation = [];
    aggregation.push(
      {
        $match:
          { _id: this.toObjectId(id) }
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerData'
        }
      }


    );
    const result = await this.m.aggregate(aggregation);
    if (!result) throw new NotFoundException('026,R026');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_CART,
    });
    return result[0];
  }

  /**
   * Edit Carts collection.
   */
  async deleteItemFromCart(req: RequestWithUser, dto: UpdateQtyDto) {
    let result;
    const Cart = await this.findOne({ customerId: req.user._id });
    if (!Cart) throw new NotFoundException('026,R026');
    let qty = 0;

    console.log("Cart", Cart);
    if (Cart.cartItems.length > 0) {
      const target = await this.findOne({
        _id: Cart._id,
        'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
      }, {
        cartItems: { $elemMatch: { stockItemId: this.toObjectId(dto.stockItemId) } }
      }
      );
      console.log("target", target);
      let subTotal = Cart.subTotal - target.cartItems[0].itemTotal;
      console.log("subTotal", subTotal, target.cartItems[0].itemTotal);


      result = await this.updateOne({
        _id: Cart._id,
        'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
      }, {
        $pull: {
          'cartItems': target.cartItems[0],
        },
        subTotal: subTotal
      }
      );
    }//endif
    else {
      result = await this.updateOne({ _id: Cart._id }, { CartItems: [], subTotal: 0 });
    }//end else
    let aggregation = [];
    aggregation.push(
      {
        $match:
          { _id: this.toObjectId(result._id) }
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerData'
        }
      }
    );
    const data = await this.m.aggregate(aggregation);
    return data[0];

  }


  async increaseItemQty(req: RequestWithUser, dto: UpdateQtyDto) {
    let result;
    const Cart = await this.findOne({ customerId: req.user._id });
    if (!Cart) throw new NotFoundException('026,R026');
    // let items = [];
    let qty = 0;
    const target = await this.findOne({
      _id: Cart._id,
      'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
    }, {
      cartItems: { $elemMatch: { stockItemId: this.toObjectId(dto.stockItemId) } }
    }
    );
    console.log("target", target);
    let subTotal = Cart.subTotal + (1 * target.cartItems[0].sellingPrice);
    result = await this.updateOne({
      _id: Cart._id,
      'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
    }, {
      $set: {
        'cartItems.$.qty': target.cartItems[0].qty + 1,
        'cartItems.$.itemTotal': target.cartItems[0].itemTotal + (1 * target.cartItems[0].sellingPrice),
      },
      subTotal: subTotal
    }
    );

    let aggregation = [];
    aggregation.push(
      {
        $match:
          { _id: this.toObjectId(result._id) }
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerData'
        }
      }
    );
    const data = await this.m.aggregate(aggregation);
    return data[0];

  }


  async decreaseItemQty(req: RequestWithUser, dto: UpdateQtyDto) {
    let result;
    const Cart = await this.findOne({ customerId: req.user._id });
    if (!Cart) throw new NotFoundException('026,R026');
    let qty = 0;
    const target = await this.findOne({
      _id: Cart._id,
      'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
    }, {
      cartItems: { $elemMatch: { stockItemId: this.toObjectId(dto.stockItemId) } }
    }
    );


    console.log("target", target.cartItems[0].qty);
    if (target.cartItems[0].qty > 1) {
      let subTotal = Cart.subTotal - (1 * target.cartItems[0].sellingPrice);
      result = await this.updateOne({
        _id: Cart._id,
        'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
      }, {
        $set: {
          'cartItems.$.qty': target.cartItems[0].qty - 1,
          'cartItems.$.itemTotal': target.cartItems[0].itemTotal - (1 * target.cartItems[0].sellingPrice),
        },
        subTotal: subTotal
      }
      );
    }
    else {
      let subTotal = Cart.subTotal - (1 * target.cartItems[0].sellingPrice);
      result = await this.updateOne({
        _id: Cart._id,
        'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
      },
        {
          $pull: {
            'cartItems': target.cartItems[0],
          },
          subTotal: subTotal
        }
      );
    }

    //     const emptyData = await this.findOne({
    //       _id: Cart._id,
    //       'cartItems.stockItemId': this.toObjectId(dto.stockItemId)
    //     }, {
    //       cartItems: {
    //         $and:[
    //           { $elemMatch: { stockItemId: this.toObjectId(dto.stockItemId) }},
    //           {$eq:[qty, 0]}
    //         ]
    //       }
    //     }
    //     );
    // console.log("emptyData",emptyData);

    let aggregation = [];
    aggregation.push(
      {
        $match:
          { _id: this.toObjectId(result._id) }
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerData'
        }
      }
    );
    const data = await this.m.aggregate(aggregation);
    return data[0];

  }


  /**
   * Search Carts collection.  //done
   */
  async findAll(
    entityId: Types.ObjectId,
    options: CartSearchOptions,
    req: RequestWithUser,
  ): Promise<Pagination> {
    const aggregation = [];

    const {
      dir,
      offset,
      size,
      searchTerm,
      filterBy,
      attributesToRetrieve,
      filterByDateFrom,
      filterByDateTo,
    } = options;

    aggregation.push({ $match: { entityId } });
    const sort = 'index';



    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }

    aggregation.push(
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerData'
        }
      }
    )

    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        //change date to string & match
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    createdAtToString: {
                      $gte: filterByDateFrom,
                      $lte: filterByDateTo,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }
    return await this.aggregate(aggregation, offset, size);
  }

  /**
   * Search Carts fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [{ customerId: { $regex: new RegExp(searchTerm), $options: 'i' } }],
      },
    });
  }

}
