import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteSearchOptions } from './dto/note-search-options.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteService } from './note.service';

@Controller('note')
@ApiTags('note')
export class NoteController {
  constructor(
    private readonly noteService: NoteService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiBody({ type: CreateNoteDto })
  @ApiOperation({ summary: 'Create a Note' })
  async create(@Body() dto: CreateNoteDto, @Req() req: RequestWithUser) {
    return await this.noteService.createNote(req, dto);
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiOperation({ summary: 'Get a Note' })
  async getNote(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.noteService.findNote(req,id);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiBody({ type: UpdateNoteDto })
  @ApiOperation({ summary: 'Update a Note' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateNoteDto) {
    return await this.noteService.updateNote(req,id, dto);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Notes' })
  async search(@Req() req: RequestWithUser,@Body() options: NoteSearchOptions) : Promise<Pagination>{
    return await this.noteService.findAll(req,options);
  }


}