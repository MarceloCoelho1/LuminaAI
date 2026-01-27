import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { StorageService } from '../storage/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(
    private storageService: StorageService,
    private prisma: PrismaService
  ) { }

  async upload(file: Express.Multer.File, tenantId: string) {
    const fileId = randomUUID();
    const key = `tenants/${tenantId}/${fileId}-${file.originalname}`;

    await this.storageService.uploadFile(file, key);

    const document = await this.prisma.document.create({
      data: {
        title: file.originalname,
        storageKey: key,
        mimeType: file.mimetype,
        size: file.size,
        tenantId,
        status: 'PENDING'
      }
    });

    return document;
  }

  create(createDocumentDto: CreateDocumentDto) {
    return 'This action adds a new document';
  }

  findAll() {
    return `This action returns all documents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
