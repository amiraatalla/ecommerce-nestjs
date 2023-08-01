import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SearchOptions } from '.';

describe('SearchOptions', () => {
  it('should create a valid SearchOptions object', async () => {
    const dto: SearchOptions = {
      offset: 0,
      size: 10,
      sort: '',
      dir: 'asc',
      searchTerm: '',
    };
    const validated = plainToClass(SearchOptions, dto, { enableImplicitConversion: true });
    const errors = validateSync(validated, { skipMissingProperties: false });

    expect(errors).toEqual([]);
  });
});
