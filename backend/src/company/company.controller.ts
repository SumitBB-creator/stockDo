import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
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
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not provided');
    }

    try {
      const publicUrl = await this.supabaseService.uploadFile(file, 'logos');
      return {
        message: 'Logo uploaded successfully',
        url: publicUrl,
        filename: file.originalname,
        size: file.size,
      };
    } catch (error) {
      const errorMessage = error.message.includes('not found')
        ? `${error.message}. Please create a public bucket named "logos" in your Supabase dashboard.`
        : error.message;
      throw new BadRequestException(`Failed to upload logo: ${errorMessage}`);
    }
  }

  @Post()
  updateCompany(@Body() data: any) {
    return this.companyService.updateCompany(data);
  }
}
