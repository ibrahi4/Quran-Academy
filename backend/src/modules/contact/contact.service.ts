import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({ data: dto });
    this.logger.log(`New contact message: ${contact.id} - ${contact.email}`);
    return contact;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.contact.count(),
    ]);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException("Contact not found");
    return contact;
  }

  async update(id: string, dto: UpdateContactDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.status === "REPLIED") {
      data.repliedAt = new Date();
    }
    const updated = await this.prisma.contact.update({ where: { id }, data });
    this.logger.log(`Contact updated: ${id} - status: ${updated.status}`);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contact.delete({ where: { id } });
    this.logger.log(`Contact deleted: ${id}`);
    return { message: "Contact deleted successfully" };
  }
}
