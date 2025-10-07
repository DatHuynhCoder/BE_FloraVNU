import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  ) { }

  //Create new flower service
  async create(createFlowerDto: CreateFlowerDto, image: Express.Multer.File) {
    //Check if the flower aldready exists
    const compareFlower = await this.FlowerModel.findOne({ name: createFlowerDto.name });
    if (compareFlower) {
      throw new BadRequestException(`Hoa với tên "${createFlowerDto.name}" đã tồn tại`);
    }

    //Upload flower image to Cloudinary
    const uploadImg = await this.cloudinary.uploadImage(image, "FloraVNU/Flowers")

    //normalize name, occasion, form and types
    const normalizedName = normalizeStr(createFlowerDto.name);
    const normalizedTypes = createFlowerDto.types.map(type => normalizeStr(type));
    const basedTypes = normalizedTypes.join('-')
    const normalizedOccasion = normalizeStr(createFlowerDto.occasion)
    const normalizedForm = normalizeStr(createFlowerDto.form)

    //create new flower
    const newFlower = new this.FlowerModel({
      ...createFlowerDto,
      basedName: normalizedName,
      basedTypes: basedTypes,
      baseOccasion: normalizedOccasion,
      basedForm: normalizedForm,
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

  async findOne(id: string) {
    //get flower
    const flower = await this.FlowerModel.findById(id);
    if(!flower){
      throw new NotFoundException('Không tìm thấy hoa');
    }
    return {
      data: flower
    };
  }


  //Update a flower service
  async update(id: string, updateFlowerDto: UpdateFlowerDto, image?: Express.Multer.File) {
    //find the flower to update
    const checkFlower = await this.FlowerModel.findById(id);
    if (!checkFlower) {
      throw new NotFoundException(`Không tìm thấy hoa để cập nhật`);
    }

    let uploadImg;
    if (image) {
      //Xóa ảnh cũ
      await this.cloudinary.deleteImage(checkFlower.image.public_id);

      //update ảnh mới
      uploadImg = await this.cloudinary.uploadImage(image, "FloraVNU/Flowers")
    }

    //update normalize
    const normalizedName = normalizeStr(updateFlowerDto.name);
    const normalizedTypes = updateFlowerDto.types.map(type => normalizeStr(type));
    const basedTypes = normalizedTypes.join('-')
    const normalizedOccasion = normalizeStr(updateFlowerDto.occasion)
    const normalizedForm = normalizeStr(updateFlowerDto.form)

    //update data
    const updateData: any = {
      ...updateFlowerDto,
      basedName: normalizedName,
      basedTypes: basedTypes,
      baseOccasion: normalizedOccasion,
      basedForm: normalizedForm,
    };

    if (uploadImg) {
      updateData.image = {
        url: uploadImg.secure_url,
        public_id: uploadImg.public_id
      }
    }

    //Update flower in DB
    await this.FlowerModel.findByIdAndUpdate(id, updateData, { new: true });

    return {
      message: "Cập nhật hoa thành công !"
    };
  }

  //Delete a flower service
  async remove(id: string) {
    const flower = await this.FlowerModel.findById(id);
    //delete flower image
    if (flower) {
      await this.cloudinary.deleteImage(flower.image.public_id)
    }

    await this.FlowerModel.findByIdAndDelete(id);

    return {
      message: "Xóa hoa thành công !"
    };
  }
}
