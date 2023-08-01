import { createMock } from '@golevelup/ts-jest';
import { Document, Model, Types } from 'mongoose';
import { Pagination } from '.';
import { InvalidIdException, RecordExistsException, RecordNotFoundException } from '../exceptions';
import { BaseService } from './base.service';

const mockDoc = (mock?: { _id?: string }): any => {
  return {
    _id: mock?._id ?? new Types.ObjectId().toHexString(),
  };
};

const mockDocs = (n: number) => {
  const docs: any[] = [];
  while (n-- > 0) {
    docs.push(mockDoc({ _id: n.toString() }));
  }
  return docs;
};

describe('UsersService', () => {
  let service: BaseService<any>;
  let model: Model<Document>;

  beforeEach(async () => {
    model = createMock({});
    service = new BaseService(model);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toObjectId', () => {
    it('should transform a string into ObjectID if it was valid', async () => {
      const id = Types.ObjectId();
      const response = service.toObjectId(id.toHexString());

      expect(response).toEqual(id);
    });
    it('should not error and return the input ObjectID', async () => {
      const id = Types.ObjectId();
      const response = service.toObjectId(id);

      expect(response).toEqual(id);
    });
    it('should throw an error when the string is not a valid ObjectID', async () => {
      const id = 'not valid ObjectID';
      try {
        service.toObjectId(id);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidIdException);
      }
    });
  });
  describe('sort', () => {
    it('should take ascending sort and append it to aggregation pipeline', async () => {
      const aggregation = [];
      service.sort(aggregation, 'field', 'asc');

      expect(aggregation).toEqual([{ $sort: { field: 1 } }]);
    });
    it('should take descending sort and append it to aggregation pipeline', async () => {
      const aggregation = [];
      service.sort(aggregation, 'field', 'desc');

      expect(aggregation).toEqual([{ $sort: { field: -1 } }]);
    });
  });

  describe('filter', () => {
    it('should take filterBy array and append it as match stages to aggregation pipeline', async () => {
      const aggregation = [];
      const id = Types.ObjectId();
      service.filter(aggregation, [{ field1: 'value' }, { field2: id.toHexString() }]);

      expect(aggregation).toEqual([{ $match: { $and: [{ field1: 'value' }, { field2: id }] } }]);
    });
  });

  describe('paginate', () => {
    it('should take offset and limit and add pagination to aggregation pipeline', async () => {
      const aggregation = [];
      service.paginate(aggregation, 0, 10);

      expect(aggregation).toEqual([{ $skip: 0 }, { $limit: 10 }]);
    });
  });

  describe('exists', () => {
    it('should return true that a document found matching the filter', async () => {
      const filter = { field: 'value' };
      jest.spyOn(model, 'exists').mockReturnValue(true as any);
      const response = await service.exists(filter);

      expect(model.exists).toHaveBeenCalledTimes(1);
      expect(response).toEqual(true);
    });
  });

  describe('count', () => {
    it('should return the count of documents found matching the filter', async () => {
      const filter = { field: 'value' };
      jest.spyOn(model, 'countDocuments').mockReturnValue(5 as any);
      const response = await service.count(filter);

      expect(model.countDocuments).toHaveBeenCalledTimes(1);
      expect(response).toEqual(5);
    });
  });

  describe('create', () => {
    it('should insert a new document', async () => {
      const doc = mockDoc();
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(doc));
      const response = await service.create(doc);

      expect(model.create).toHaveBeenCalledTimes(1);
      expect(response).toEqual(doc);
    });

    it('return error that it document has a duplicate field', async () => {
      const doc = mockDoc();
      const error = { code: 11000 };
      jest.spyOn(model, 'create').mockImplementationOnce(() => {
        throw error;
      });
      const response = await service.create(doc).catch((e) => e);

      expect(model.create).toHaveBeenCalledTimes(1);
      expect(response).toBeInstanceOf(RecordExistsException);
    });

    it('return any other error that document has failed to save', async () => {
      const doc = mockDoc();
      const error = { message: 'error-message' };
      jest.spyOn(model, 'create').mockImplementationOnce(() => {
        throw error;
      });
      const response = await service.create(doc).catch((e) => e);

      expect(model.create).toHaveBeenCalledTimes(1);
      expect(response.message).toEqual(error.message);
      expect(response).not.toBeInstanceOf(RecordExistsException);
    });
  });

  describe('findOneById', () => {
    it('should find and return one document by id', async () => {
      const doc = mockDoc();
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(doc),
      } as any);
      const response = await service.findOneById(doc._id);

      expect(model.findById).toHaveBeenCalledTimes(1);
      expect(response).toEqual(doc);
    });

    it('return error that it did not find a document', async () => {
      const id = Types.ObjectId();
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);
      const response = await service.findOneById(id).catch((e) => e);

      expect(model.findById).toHaveBeenCalledTimes(1);
      expect(response).toBeInstanceOf(RecordNotFoundException);
    });
  });

  describe('findOne', () => {
    it('should find and return one document that matches filter', async () => {
      const doc = mockDoc();
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(doc),
      } as any);
      const response = await service.findOne(doc._id);

      expect(model.findOne).toHaveBeenCalledTimes(1);
      expect(response).toEqual(doc);
    });
  });

  describe('find', () => {
    it('should find and return all document that match filter', async () => {
      const docs = mockDocs(5);
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(docs),
      } as any);
      const response = await service.find();

      expect(model.find).toHaveBeenCalledTimes(1);
      expect(response).toEqual(docs);
    });
  });

  describe('update', () => {
    it('should find and update a document by id', async () => {
      const doc = mockDoc();
      const updates = { field: 'key' };
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce(doc);
      const response = await service.update(doc._id, updates);

      expect(model.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(response).toEqual(doc);
    });

    it('return error that no document was found', async () => {
      const doc = mockDoc();
      const updates = { field: 'key' };
      jest.spyOn(model, 'findByIdAndUpdate').mockImplementationOnce(() => null);
      const response = await service.update(doc._id, updates).catch((e) => e);

      expect(model.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(response).toBeInstanceOf(RecordNotFoundException);
    });
  });

  describe('remove', () => {
    it('should find and remove a document by id', async () => {
      const doc = mockDoc();
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValueOnce(doc);
      const response = await service.remove(doc._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(response).toEqual(true);
    });

    it('return error that no document was found', async () => {
      const doc = mockDoc();
      jest.spyOn(model, 'findByIdAndDelete').mockImplementationOnce(() => null);
      const response = await service.remove(doc._id).catch((e) => e);

      expect(model.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(response).toBeInstanceOf(RecordNotFoundException);
    });
  });

  describe('aggregate', () => {
    it('should perform aggregation pipeline to return all documents that match', async () => {
      const docs = mockDocs(5);
      const pagination = new Pagination({ count: docs.length, content: docs });
      jest.spyOn(model, 'aggregate').mockReturnValueOnce([pagination] as any);
      const response = await service.aggregate([], 0, 5);

      expect(model.aggregate).toHaveBeenCalledTimes(1);
      expect(response).toEqual(pagination);
    });
  });

  describe('aggregateOne', () => {
    it('should perform aggregation pipeline to return one document that match', async () => {
      const doc = mockDoc();
      jest.spyOn(model, 'aggregate').mockReturnValueOnce([doc] as any);
      const response = await service.aggregateOne([]);

      expect(model.aggregate).toHaveBeenCalledTimes(1);
      expect(response).toEqual(doc);
    });
  });
});
