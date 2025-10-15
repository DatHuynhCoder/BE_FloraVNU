import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFlowerDto } from './dto/create-flower.dto';
import { UpdateFlowerDto } from './dto/update-flower.dto';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { Flower } from './schemas/flower.schema';
import { Model } from 'mongoose';
import { normalizeStr } from '../../utils/normalizeStr';
import { SearchFlowerDto } from './dto/search-flower.dto';

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

  //Search flower service
  async search(query: SearchFlowerDto){
    const {
      keyword,
      searchType,
      sort,
      priceMin,
      priceMax,
      occasions,
      types,
      forms,
      page = 1,
      limit = 15
    } = query;

    //mongo query object for finalQuery
    const finalQuery: any = {}

    //keyword search
    if(keyword){
      if(searchType === 'name') {
        finalQuery.basedName = { $regex: normalizeStr(keyword), $options: 'i'}
      } else if (searchType === 'type'){
        finalQuery.basedTypes = { $regex: normalizeStr(keyword), $options: 'i'}
      } else {
        finalQuery.$or = [
          { basedName: { $regex: normalizeStr(keyword), $options: 'i'} },
          { basedTypes: { $regex: normalizeStr(keyword), $options: 'i'} }
        ]
      }
    }

    //price filter
    if(priceMin || priceMax){
      finalQuery.price = {}
      if(priceMin){
        finalQuery.price.$gte = priceMin
      }
      if(priceMax){
        finalQuery.price.$lte = priceMax
      }
    }

    //occasions, forms and types filter
    if(occasions && occasions.length > 0){
      finalQuery.baseOccasion = { $in: occasions.map(oc => normalizeStr(oc)) }
    }
    if(forms && forms.length > 0){
      finalQuery.basedForm = { $in: forms.map(form => normalizeStr(form)) }
    }
    if(types && types.length > 0){
      finalQuery.basedTypes = {
        $in: types.map(type => new RegExp(normalizeStr(type), 'i'))
      }
    }

    //sort example: sort=['price:asc','price:desc']
    let sortOption = {}
    if(sort){
      sort.forEach(item => {
        const [field, order] = item.split(':');
        sortOption[field] = order === 'asc' ? 1 : -1;
      });
    }

    //search and filter flower
    const flowers = await this.FlowerModel.find(finalQuery)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.FlowerModel.countDocuments(finalQuery);
    
    return {
      data: flowers,
      total,
      page,
      limit,
    }

  }

  //Get all flower occasion
  async getAllOccasions(){
    const occasions = await this.FlowerModel.distinct("occasion")

    return {
      data: occasions
    }
  }

  //Get all flower types
  async getAllTypes(){
    const types = await this.FlowerModel.distinct("types")

    return {
      data: types
    }
  }

  //Get all flower forms
  async getAllForms(){
    const forms = await this.FlowerModel.distinct("form")

    return {
      data: forms
    }
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
      //Delete old image on Cloudinary
      await this.cloudinary.deleteImage(checkFlower.image.public_id);

      //update new image to Cloudinary
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
