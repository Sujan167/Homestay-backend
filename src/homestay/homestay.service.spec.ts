import { Test, TestingModule } from '@nestjs/testing';
import { HomestayService } from './homestay.service';

describe('HomestayService', () => {
  let service: HomestayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomestayService],
    }).compile();

    service = module.get<HomestayService>(HomestayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
