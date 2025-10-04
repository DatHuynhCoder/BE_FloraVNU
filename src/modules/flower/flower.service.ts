import { Injectable } from '@nestjs/common';
import { CreateFlowerDto } from './dto/create-flower.dto';
import { UpdateFlowerDto } from './dto/update-flower.dto';

@Injectable()
export class FlowerService {
  create(createFlowerDto: CreateFlowerDto) {
    return 'This action adds a new flower';
  }

  findAll() {
    return `This action returns all flower`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flower`;
  }

  update(id: number, updateFlowerDto: UpdateFlowerDto) {
    return `This action updates a #${id} flower`;
  }

  remove(id: number) {
    return `This action removes a #${id} flower`;
  }
}
