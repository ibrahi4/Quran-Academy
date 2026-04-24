import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateContactDto } from "./dto/create-contact.dto";

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({ data: dto });
    this.logger.log(`New contact message: ${contact.id} - ${contact.email}`);
    // TODO: Send email notification
    return contact;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.contact.count(),
    ]);
    return { contacts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
