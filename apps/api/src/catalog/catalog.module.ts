import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Product, ProductSchema } from './schemas/product.schema';

const databaseImports = process.env.MONGODB_URI ? [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])] : [];

@Module({
  imports: databaseImports,
  controllers: [CatalogController],
  providers: [CatalogService]
})
export class CatalogModule {}
