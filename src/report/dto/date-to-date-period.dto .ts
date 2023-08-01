import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

/*
 * Used to decide the pagination, search and filter in every search.
 */
export class DateToDatePeriodDto {


    /**
   * Used to filter by date from like 2022-01-01
   */
     @IsOptional()
     @IsString()
     @ApiProperty({ type: String, example: '2022-01-01' })
     firstDate?: string;
   
     /**
      * Used to filter by date to like 2024-01-02
      */
     @IsOptional()
     @IsString()
     @ApiProperty({ type: String, example: '2023-01-02' })
     secondDate?: string;



    /**
   * Used to filter by date from like 2022-01-01
   */
    @IsOptional()
    @IsString()
    @ApiProperty({ type: String, example: '2023-01-03' })
    thirdDate?: string;
  
    /**
     * Used to filter by date to like 2024-01-02
     */
    @IsOptional()
    @IsString()
    @ApiProperty({ type: String, example: '2024-01-02' })
    fourthDate?: string;

}
