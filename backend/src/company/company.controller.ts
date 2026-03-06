import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { memoryStorage } from 'multer';
import { SupabaseService } from '../common/services/supabase.service';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly supabaseService: SupabaseService,
  ) { }

  @Get()
  getCompany() {
    return this.companyService.getCompany();
  }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
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

    // For now, return a data URL or just a success message
    // In actual production with Vercel, we will integrate Supabase Storage here.
    return {
      message: 'Logo received',
      filename: file.originalname,
      size: file.size
    };
  }

  @Post()
  updateCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.updateCompany(createCompanyDto);
  }
}
