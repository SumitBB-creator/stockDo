import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Get()
  getCompany() {
    return this.companyService.getCompany();
  }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `logo-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not provided');
    }
    // Return relative URL
    return { url: `/uploads/${file.filename}` };
  }

  @Post()
  updateCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.updateCompany(createCompanyDto);
  }
}
