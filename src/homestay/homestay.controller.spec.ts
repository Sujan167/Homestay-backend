import { Test, TestingModule } from '@nestjs/testing';
import { HomestayController } from './homestay.controller';
import { HomestayService } from './homestay.service';

describe('HomestayController', () => {
  let controller: HomestayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomestayController],
      providers: [HomestayService],
    }).compile();

    controller = module.get<HomestayController>(HomestayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
