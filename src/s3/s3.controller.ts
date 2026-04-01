import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('s3')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @Post('presigned-url')
  getPresignedUrl(@Body() body: { folder: string; contentType: string }) {
    return this.s3Service.getPresignedUrl(body.folder, body.contentType);
  }
}
