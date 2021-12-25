import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, Repository, TreeRepository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { Category } from './entities/category.entity';

@Injectable({
  scope: Scope.DEFAULT,
})
export class CategoryService {
  private readonly treeRepository: TreeRepository<Category>;

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {
    this.treeRepository =
      categoryRepository.manager.getTreeRepository(Category);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const [parent, item] = await Promise.all([
      this.findOne(+createCategoryDto.parentId),
      this.findByTitle(createCategoryDto.title),
    ]);

    //if wrong parent_id provided
    if (!parent && createCategoryDto.parentId) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['invalid parentId'],
        error: 'Bad Request',
      });
    }

    //if category exists by title
    if (item) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['Category with title already exists'],
        error: 'Bad Request',
      });
    }

    //if category depth is 100 prevent creating new child
    if (parent) {
      const parentsCount = await this.treeRepository.countAncestors(parent);
      if (parentsCount >= 100) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['child category count in depth exceeded'],
          error: 'Bad Request',
        });
      }
    }

    const category = new Category();
    category.title = createCategoryDto.title;
    category.parent = parent;

    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.treeRepository.findTrees({
      depth: 100,
    });
  }

  async findOne(id: number): Promise<Category | null> {
    if (!id) {
      return null;
    }

    return await this.categoryRepository.findOne(id);
  }

  async findTreeById(id: number): Promise<Category> {
    const category = await this.findOne(id);

    if (!category) {
      throw new NotFoundException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['category not found'],
        error: 'Bad Request',
      });
    }

    await this.treeRepository.findAncestorsTree(category);
    return await this.treeRepository.findDescendantsTree(category);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const [category, parent, item] = await Promise.all([
      this.findOne(id),
      this.findOne(+updateCategoryDto.parentId),
      this.findByTitle(updateCategoryDto.title),
    ]);

    if (!category) {
      throw new NotFoundException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['category not found'],
        error: 'Bad Request',
      });
    }

    //if wrong parentId provided
    if (!parent && updateCategoryDto.parentId) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['invalid parentId'],
        error: 'Bad Request',
      });
    }

    //if category exists by title
    if (item && item.id != category.id) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['Category with title already exists'],
        error: 'Bad Request',
      });
    }

    if (parent) {
      //get parents count and a bottom leaf of tree
      const [parentsCount, child] = await Promise.all([
        this.treeRepository.countAncestors(parent),
        this.treeRepository
          .createDescendantsQueryBuilder(
            'category',
            'categoryClosure',
            category,
          )
          .orderBy('category.parentId', 'DESC')
          .getOne(),
      ]);

      //if depth of tree is exceeded
      if (parentsCount - 1 >= 100) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['child category count in depth exceeded'],
          error: 'Bad Request',
        });
      }

      if (child) {
        const childrenDepth = await this.treeRepository.countAncestors(child);
        //if depth of tree is exceeded
        if (parentsCount - 1 + childrenDepth - 1 >= 100) {
          throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: ['child category count in depth exceeded'],
            error: 'Bad Request',
          });
        }
      }
    }

    category.title = updateCategoryDto.title;
    category.parent = parent || null;

    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.categoryRepository.delete(id);
  }

  async findByTitle(title: string): Promise<Category> {
    return await this.categoryRepository.findOne({ title });
  }
}
