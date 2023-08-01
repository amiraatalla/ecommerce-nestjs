import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { BaseService, Pagination } from 'src/core/shared';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { UsersService } from 'src/users/users.service';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { TutorialSearchOptions } from './dto/tutorial-search-options.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { Tutorial, TutorialDoc } from './entities/tutorial.entity';
import { TypeEnum } from './enums/type.enum';

@Injectable()
export class TutorialService extends BaseService<TutorialDoc>{
    constructor(
        @InjectModel(Tutorial.name) readonly m: Model<TutorialDoc>,
        private readonly usersService: UsersService,
    ) {
        super(m);
    }


    async createTutorial(req: RequestWithUser, dto: CreateTutorialDto) {
        const tutorial = await this.findOne({ name: dto.name, url: dto.url });
        if (tutorial) throw new BadRequestException("159,R159")
        if(req.user.role != RolesEnum.SUPER_ADMIN) throw new BadRequestException("158,R158")
        else {
            return await this.create({
                owner: req.user._id,
                ...dto
            })
        }

    }

    async findTutorial(req: RequestWithUser, id: string) {
        const tutorial = await this.findOneById(id);
        if (!tutorial) throw new NotFoundException("157,R157")
        console.log("tutorial.type", tutorial.type, "req.user.role", req.user.role);
        console.log( tutorial.type.toString() == req.user.role);
        if(req.user.role == RolesEnum.SUPER_ADMIN) return tutorial
        else{
        if (tutorial.type.toString() != req.user.role) throw new ForbiddenException("156,R156")
        else return tutorial;
        }
    }

    async deleteTutorial(req: RequestWithUser, id: string) {
        const tutorial = await this.findOneById(id);
        if (!tutorial) throw new NotFoundException("157,R157")
        // if (tutorial.owner.toString != req.user._id.toString) throw new ForbiddenException("156,R156")
        if(req.user.role != RolesEnum.SUPER_ADMIN) throw new BadRequestException("158,R158")
        return await this.remove(id);
    }

    async updateTutorial(req: RequestWithUser, id: string, dto: UpdateTutorialDto) {
        const tutorial = await this.findOneById(id);
        console.log("tutorial", tutorial, tutorial.owner.toString() == req.user._id.toString());

        if (!tutorial) throw new NotFoundException("157,R157")
        console.log("tutorial.owner", tutorial.owner.toString(), "req.user._id", req.user._id.toString());
        // if (tutorial.owner.toString() != (req.user._id.toString())) throw new ForbiddenException("156,R156")
        if(req.user.role != RolesEnum.SUPER_ADMIN) throw new BadRequestException("158,R158")

        else {
            return await this.update(id, {
                ...dto
            })
        }
    }


    //B-C

    /**
     * Search tutorials collection.
     */
    async findAll(
        options: TutorialSearchOptions,
        req : RequestWithUser
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
            filterByDateTo

        } = options;

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

         
        if (req.user.role == RolesEnum.RESTURANT) {
            aggregation.push({
              $match: {
                $and: [{ type: { $eq: TypeEnum.RESTURANT } }],
              },
            });
          }

          if (req.user.role  == RolesEnum.MERCHANT) {
            aggregation.push({
              $match: {
                $and: [{ type: { $eq: TypeEnum.MERCHANT } }],
              },
            });
          }

          if (req.user.role  == RolesEnum.CUSTOMER) {
            aggregation.push({
              $match: {
                $and: [{ type: { $eq: TypeEnum.CUSTOMER } }],
              },
            });
          }

          if (req.user.role  == RolesEnum.CASHIER) {
            aggregation.push({
              $match: {
                $and: [{ type: { $eq: TypeEnum.CASHIER } }],
              },
            });
          }

          if (req.user.role  == RolesEnum.CHEF) {
            aggregation.push({
              $match: {
                $and: [{ type: { $eq: TypeEnum.CHEF } }],
              },
            });
          }

          if (req.user.role  == RolesEnum.WAITER) {
            aggregation.push({
              $match: {
                $and: [{ type: { $eq: TypeEnum.WAITER } }],
              },
            });
          }

          if (req.user.role  == RolesEnum.INVENTORYMAN) {
            aggregation.push({
              $match: {
                $and: [{ type: { $eq: TypeEnum.INVENTORYMAN } }],
              },
            });
          }
          if (filterByDateFrom && filterByDateTo) {
            aggregation.push(
              //change date to string & match
              {
                $addFields: {
                  createdAtToString: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                },
              },
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        {
                          createdAtToString: { $gte: filterByDateFrom, $lte: filterByDateTo },
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

    async findAllTutorials(
        options: TutorialSearchOptions,
        req : RequestWithUser
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
            filterByDateTo

        } = options;

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
        if (filterByDateFrom && filterByDateTo) {
          aggregation.push(
            //change date to string & match
            {
              $addFields: {
                createdAtToString: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              },
            },
            {
              $match: {
                $and: [
                  {
                    $or: [
                      {
                        createdAtToString: { $gte: filterByDateFrom, $lte: filterByDateTo },
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
     * Search tutorials fields.
     */
    private search(aggregation: any, searchTerm: string): void {
        aggregation.push({
            $match: {
                $or: [
                    { ownerId: { $regex: new RegExp(searchTerm), $options: 'i' } },
                    { tutorialType: { $regex: new RegExp(searchTerm), $options: 'i' } },
                ],
            },
        });
    }

}






