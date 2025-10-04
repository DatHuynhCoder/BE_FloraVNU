import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFlowerDto } from './dto/create-flower.dto';
import { UpdateFlowerDto } from './dto/update-flower.dto';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { Flower } from './schemas/flower.schema';
import { Model } from 'mongoose';
import { normalizeStr } from 'src/utils/normalizeStr';

@Injectable()
export class FlowerService {
  constructor(
    @InjectModel(Flower.name) private FlowerModel: Model<Flower>,
    private readonly cloudinary: CloudinaryService 
  ){}

  async create(createFlowerDto: CreateFlowerDto, image: Express.Multer.File) {
    //Check if the flower aldready exists
    const compareFlower = await this.FlowerModel.findOne({name: createFlowerDto.name});
    if(compareFlower){
      throw new BadRequestException(`Hoa với tên "${createFlowerDto.name}" đã tồn tại`);
    }

    //Upload flower image to Cloudinary
    const uploadImg = await this.cloudinary.uploadImage(image, "FloraVNU/Flowers")

    //normalize name and types
    const normalizedName = normalizeStr(createFlowerDto.name);
    const normalizedTypes = createFlowerDto.types.map(type => normalizeStr(type));

    const newFlower = new this.FlowerModel({
      ...createFlowerDto,
      basedName: normalizedName,
      basedTypes: normalizedTypes,
      image: {
        url: uploadImg.secure_url,
        public_id: uploadImg.public_id
      }
    })

    await newFlower.save();

    return {
      data: newFlower
    };
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
