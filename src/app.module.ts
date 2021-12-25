import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryModule } from './category/category.module';
import { Category } from './category/entities/category.entity';

@Module({
  imports: [
    CategoryModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || '10.254.112.64',
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      username: process.env.MYSQL_USERNAME || 'root',
      password: process.env.MYSQL_ROOT_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'nodeback',
      entities: [Category],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
