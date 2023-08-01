import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { TutorialSearchOptions } from './dto/tutorial-search-options.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { TutorialService } from './tutorial.service';

@Controller('tutorial')
@ApiTags('tutorial')
export class TutorialController {
    constructor(private readonly tutorialService: TutorialService) { }

    //super admin
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(...RoleGroups.ADMINSTRATION)
    @Post('/create-tutorial')
    @ApiBody({ type: CreateTutorialDto })
    @ApiOperation({ summary: 'Create a tutorial' })
    async createTutorial(@Request() req: RequestWithUser,@Body() dto: CreateTutorialDto) {
      return await this.tutorialService.createTutorial(req, dto);
    }
  
    // @Get('/find-tutorial/:id')
    // @UseGuards(JwtAuthGuard, RoleGuard)
    // @Roles(...RoleGroups.ADMINSTRATION)
    // @ApiOperation({ summary: 'update a tutorial' })
    // async findATutorial(@Request() req: RequestWithUser,@Param('id') id: string) {
    //     return await this.tutorialService.findTutorial(req,id);
    // }

    @Delete('/delete-tutorial/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(...RoleGroups.ADMINSTRATION)
    @ApiOperation({ summary: 'delete a tutorial' })
    async deleteTutorial(@Request() req: RequestWithUser,@Param('id') id: string) {
      return await this.tutorialService.deleteTutorial(req,id);
    }
  
  
  
    @Patch('/update-tutorial/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(...RoleGroups.ADMINSTRATION)
    @ApiOperation({ summary: 'update a tutorial' })
    async updateTutorial(@Request() req: RequestWithUser,@Param('id') id: string, @Body()dto: UpdateTutorialDto) {
        return await this.tutorialService.updateTutorial(req,id, dto);
    }

    @Patch('/get-tutorial/:id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(...RoleGroups.ADMINSTRATION)
    @ApiOperation({ summary: 'get tutorial - SA' })
    async getTutorial(@Request() req: RequestWithUser,@Param('id') id: string) {
        return await this.tutorialService.findTutorial(req,id);
    }
  
    @Post('search')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(...RoleGroups.ADMINSTRATION)
    @ApiOperation({ summary: 'Search tutorial details - SA' })
    findAllTutorials(@Request() req: RequestWithUser,@Body() options: TutorialSearchOptions): Promise<Pagination> {
      return this.tutorialService.findAllTutorials(options, req);
    }

    @Post('/me/search')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(...RoleGroups.BUSSINESS_PROFILE_CUSTOMER)
    @ApiOperation({ summary: 'Search tutorial details - users' })
    findAll(@Request() req: RequestWithUser,@Body() options: TutorialSearchOptions): Promise<Pagination> {
      return this.tutorialService.findAll(options, req);
    }
}