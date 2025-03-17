import { Injectable } from '@nestjs/common';
import { CreateHomestayDto } from './dto/create-homestay.dto';
import { UpdateHomestayDto } from './dto/update-homestay.dto';

@Injectable()
export class HomestayService {
  create(createHomestayDto: CreateHomestayDto) {
    return 'This action adds a new homestay';
  }

  findAll() {
    return `This action returns all homestay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} homestay`;
  }

  update(id: number, updateHomestayDto: UpdateHomestayDto) {
    return `This action updates a #${id} homestay`;
  }

  remove(id: number) {
    return `This action removes a #${id} homestay`;
  }
}

// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class HomestayService {
//   constructor(private prisma: PrismaService) {}

//   // Owner registers a homestay (without community registration)
//   async registerHomestay(
//     ownerId: number,
//     homestayData: { name: string; description: string },
//   ) {
//     const user = await this.prisma.user.findUnique({
//       where: { id: ownerId },
//     });

//     if (
//       !user ||
//       user.role !== 'OWNER' ||
//       user.verificationStatus !== VerificationStatus.VERIFIED
//     ) {
//       throw new Error('User is not verified or not an owner');
//     }

//     const homestay = await this.prisma.homestay.create({
//       data: {
//         ownerId: ownerId,
//         name: homestayData.name,
//         description: homestayData.description,
//         status: HomestayStatus.PENDING,
//       },
//     });

//     return homestay;
//   }

//   // Owner requests to register a homestay in a community
//   async requestCommunityRegistration(
//     ownerId: number,
//     homestayId: number,
//     communityId: number,
//   ) {
//     const homestay = await this.prisma.homestay.update({
//       where: { id: homestayId },
//       data: {
//         communityId: communityId, // Link to the community
//         status: HomestayStatus.PENDING,
//       },
//     });

//     return homestay;
//   }

//   // Community owner verifies homestay for inclusion
//   async verifyHomestayInCommunity(
//     communityOwnerId: number,
//     homestayId: number,
//   ) {
//     const communityOwner = await this.prisma.user.findUnique({
//       where: { id: communityOwnerId },
//     });

//     if (!communityOwner || communityOwner.role !== 'COMMUNITY_OWNER') {
//       throw new Error('Only community owners can verify homestays');
//     }

//     const homestay = await this.prisma.homestay.update({
//       where: { id: homestayId },
//       data: { status: HomestayStatus.VERIFIED },
//     });

//     return homestay;
//   }
// }
