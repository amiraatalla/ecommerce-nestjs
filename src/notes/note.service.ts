import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { BaseService, Pagination } from 'src/core/shared';
import { CustomerService } from 'src/customer/customer.service';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { StatusEnum } from 'src/users/enums/status.enum';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteSearchOptions } from './dto/note-search-options.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note, NoteDoc } from './entities/notes.entity';

@Injectable()
export class NoteService extends BaseService<NoteDoc> {
  constructor(
    @InjectModel(Note.name) readonly m: Model<NoteDoc>,
    private readonly sysLogsService: SYSLogService,

    private readonly customerService: CustomerService,
  ) {
    super(m);
  }

  async createNote(req: RequestWithUser, dto: CreateNoteDto) {
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');

    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_NOTE,
    });
    const CustomerExist = await this.customerService.findOne({
      owner: { $in: [req.user._id] },
      _id: this.toObjectId(dto.customer),
    });
    if (!CustomerExist) throw new NotFoundException('091,R091');
    return await this.create({
      owner: req.user._id,
      ...dto,
    });
  }

  /**
   * Edit Notes collection.
   */

  async findNote(req: RequestWithUser, id: string) {
    const Note = await this.findOneById(id);
    if (!Note) throw new NotFoundException('144,R144');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_NOTE,
    });
    return Note;
  }

  /**
   * Edit Notes collection.
   */

  async updateNote(req: RequestWithUser, id: string, dto: UpdateNoteDto) {
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const NoteExist = await this.findOne({
      owner: { $in: [req.user._id] },
      _id: this.toObjectId(id),
    });
    if (!NoteExist) throw new NotFoundException('144,R144');
    else {
      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_NOTE,
      });
      return await this.update(id, {
        ...dto,
      });
    }
  }

  /**
   * Search Notes collection.
   */
  async findAll(
    req: RequestWithUser,
    options: NoteSearchOptions,
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
   * Search Notes fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [{ owner: { $regex: new RegExp(searchTerm), $options: 'i' } }],
      },
    });
  }
}
