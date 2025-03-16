import { Module } from '@nestjs/common';
import { AutoController } from './auto.controller';
import { AutoService } from './auto.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  controllers: [AutoController],
  providers: [AutoService],
  exports: [AutoService],
})
export class AutoModule {}
