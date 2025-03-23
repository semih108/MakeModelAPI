import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Cache } from 'cache-manager';
import {
  MakeData,
  Model,
  SubModel,
  AutoDetails,
  SearchResult,
} from './auto.types';

@Injectable()
export class AutoService {
  private autoData: Map<string, MakeData> = new Map();
  private readonly dataPath = join(__dirname, '../data');
  private isLoaded = false;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private loadDataOnce(): void {
    if (this.isLoaded) return;

    // 👇 Lade nur beim ersten Zugriff
    this.loadAllAutoData();
    this.isLoaded = true;
  }

  private loadAllAutoData(): void {
    try {
      const files = readdirSync(this.dataPath);

      // Filter for auto detail JSON files
      const autoDetailFiles = files.filter((file) =>
        file.includes('_detail_subModel_autoDetails.json'),
      );

      for (const file of autoDetailFiles) {
        try {
          const data = JSON.parse(
            readFileSync(join(this.dataPath, file), 'utf8'),
          ) as MakeData;

          // Extract make name from filename
          // Assuming filename format: models_MAKE_detail_subModel_autoDetails.json
          const makeMatch = file.match(/models_([^_]+)_detail/);
          if (makeMatch && makeMatch[1]) {
            const make = makeMatch[1].toLowerCase();
            this.autoData.set(make, data);
            console.log(`Loaded auto data for: ${make}`);
          }
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
        }
      }

      console.log(`Loaded auto data for ${this.autoData.size} makes`);
    } catch (error) {
      console.error('Failed to load auto data:', error);
    }
  }

  getAllMakes(): string[] {
    this.loadDataOnce();
    return Array.from(this.autoData.keys());
  }

  getMakeDetails(make: string): MakeData | undefined {
    this.loadDataOnce();
    return this.autoData.get(make.toLowerCase());
  }

  async getModelsByMake(make: string): Promise<Model[]> {
    this.loadDataOnce();
    const cacheKey = `models_${make.toLowerCase()}`;
    const cachedData = await this.cacheManager.get<Model[]>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const makeData = this.autoData.get(make.toLowerCase());
    const models = makeData ? makeData.models || [] : [];

    await this.cacheManager.set(cacheKey, models, 3600); // Cache for 1 hour
    return models;
  }

  async getSubModelsByMakeAndModel(
    make: string,
    model: string,
  ): Promise<SubModel[]> {
    const models = await this.getModelsByMake(make);
    const foundModel = models.find(
      (m) => m.name.toLowerCase() === model.toLowerCase(),
    );
    return foundModel ? foundModel.subModels || [] : [];
  }

  async getAutoDetailsByMakeModelSubModel(
    make: string,
    model: string,
    subModel: string,
  ): Promise<AutoDetails | null> {
    const subModels = await this.getSubModelsByMakeAndModel(make, model);
    const foundSubModel = subModels.find(
      (sm) => sm.name.toLowerCase() === subModel.toLowerCase(),
    );
    return foundSubModel ? foundSubModel.autoDetails || null : null;
  }

  // Search across all makes/models/submodels
  searchAutoDetails(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    this.loadDataOnce();

    for (const [make, makeData] of this.autoData.entries()) {
      if (!makeData.models) continue;

      for (const model of makeData.models) {
        if (!model.subModels) continue;

        for (const subModel of model.subModels) {
          // Check if any field in autoDetails matches the search term
          if (
            subModel.autoDetails &&
            JSON.stringify(subModel.autoDetails)
              .toLowerCase()
              .includes(searchTerm)
          ) {
            results.push({
              make,
              model: model.name,
              subModel: subModel.name,
              details: subModel.autoDetails,
            });
          }
        }
      }
    }

    return results;
  }
}
