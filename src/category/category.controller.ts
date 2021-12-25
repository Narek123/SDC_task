import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return await this.categoryService.findAll();
  }

  @Get('tree/:id(\\d+)')
  async findTreeById(@Param('id') id: string) {
    const treeById = await this.categoryService.findTreeById(+id);
    if (!treeById) {
      throw new NotFoundException();
    }
    return treeById;
  }

  @Get(':id(\\d+)')
  async findOne(@Param('id') id: string) {
    const category = await this.categoryService.findOne(+id);

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  @Patch(':id(\\d+)')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id(\\d+)')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
