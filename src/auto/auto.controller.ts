import { Controller, Get, Param, Query } from '@nestjs/common';
import { AutoService } from './auto.service';
import {
  MakeData,
  Model,
  SubModel,
  AutoDetails,
  SearchResult,
} from './auto.types';

@Controller('auto')
export class AutoController {
  constructor(private readonly autoService: AutoService) {}

  @Get('makes')
  getAllMakes(): string[] {
    return this.autoService.getAllMakes();
  }

  @Get('makes/:make')
  getMakeDetails(@Param('make') make: string): MakeData | undefined {
    return this.autoService.getMakeDetails(make);
  }

  @Get('makes/:make/models')
  async getModelsByMake(@Param('make') make: string): Promise<Model[]> {
    return this.autoService.getModelsByMake(make);
  }

  @Get('makes/:make/models/:model/submodels')
  async getSubModelsByMakeAndModel(
    @Param('make') make: string,
    @Param('model') model: string,
  ): Promise<SubModel[]> {
    return this.autoService.getSubModelsByMakeAndModel(make, model);
  }

  @Get('makes/:make/models/:model/submodels/:subModel/details')
  async getAutoDetails(
    @Param('make') make: string,
    @Param('model') model: string,
    @Param('subModel') subModel: string,
  ): Promise<AutoDetails | null> {
    return this.autoService.getAutoDetailsByMakeModelSubModel(
      make,
      model,
      subModel,
    );
  }

  @Get('search')
  searchAutoDetails(@Query('q') query: string): SearchResult[] {
    if (!query || query.trim() === '') {
      return [];
    }
    return this.autoService.searchAutoDetails(query);
  }
}
