import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsIn,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  IsPositive,
  IsObject,
} from 'class-validator';
import { escapeRegexSpecialCharacters } from '../utils';

/**
 * Used to decide the pagination, search and filter in every search.
 */
export class SearchOptions {
  /**
   * Documents to skip.
   * @example 0
   */
  @IsNumber()
  @Min(0)
  @ApiProperty()
  offset: number;

  /**
   * Number of records to return in 1 page.
   * @example 10
   */
  @IsPositive({message:'145,R145'})
  @ApiProperty()
  size: number;

  /**
   * Applies sort to the result according to the provided field.
   */
  @IsOptional()
  @IsString()
  @ApiProperty({example: ''})
  sort? = '';

  /**
   * Sets the direction of sorting.
   * @example asc
   */
  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({example:'asc'})
  dir?: string;

  /**
   * Used to text search with the provide value.
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => escapeRegexSpecialCharacters(value))
  @ApiProperty()
  searchTerm? = '';

  /**
   * Used to filter the results according to provided field/s.
   * `[{field: value}]`
   */
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @ApiProperty({ example: [] })
  filterBy?: Record<string, any>[] = [];

  /**
   * Fields to select from the entity.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ example: [] })
  attributesToRetrieve?: string[] = [];

    /**
   * Used to filter by date from like 2022-01-01
   */
     @IsOptional()
     @IsString()
     @ApiProperty({ type: String, example: '2022-01-01' })
     filterByDateFrom?: string;
   
     /**
      * Used to filter by date to like 2024-01-02
      */
     @IsOptional()
     @IsString()
     @ApiProperty({ type: String, example: '2024-01-02' })
     filterByDateTo?: string;
}
