import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt-payload.dto';
import { StaffService } from 'src/modules/staff/staff.service';
import { BusinessesService } from 'src/modules/businesses/businesses.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly staffService: StaffService,
    private readonly businessesService: BusinessesService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> | null {
    // Check for static user first
    if (username === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD) {
      return {
        staffId: process.env.ADMIN_STAFF_ID,
        username: process.env.ADMIN_USERNAME,
        name: process.env.ADMIN_DEFAULT_NAME,
        role: process.env.ADMIN_DEFAULT_ROLE,
        lastLogin: new Date(),
      };
    }

    const staff = await this.staffService.findByUsername(username);
    if (staff && (await (staff as any).correctPassword(pass))) {
      const { _id, username, firstName, lastName, role } = staff as any;
      return { staffId: _id, username, firstName, lastName, role };
    }
    return null;
  }

  async verify(token: string): Promise<any> {
    const decoded: JwtPayload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    const staff = await this.staffService.findByUsername(decoded.username || decoded.email);
    return staff;
  }

  public async buildUserObject(staff: any): Promise<any> {
    let business = null;
    if (staff.role === 'BUSINESS_OWNER') {
      // console.log("Finding business for staff:", staff.staffId || staff._id);
      business = await this.businessesService.findByPrimaryStaffAccount(staff._id.toString());
    }
    // console.log("Building user object for staff:", business);
    return {
      staffId: staff.staffId || staff._id,
      username: staff.username,
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
      ...(business && {
        businessId: business._id,
        businessName: business.businessName,
      }),
    };
  }


  async login(staff: any): Promise<any> {
    // Handle static admin
    if (staff.staffId === process.env.ADMIN_STAFF_ID) {
      const payload: JwtPayload = {
        username: process.env.ADMIN_USERNAME,
        sub: process.env.ADMIN_STAFF_ID,
      };

      return {
        staff: {
          _id: process.env.ADMIN_STAFF_ID,
          username: process.env.ADMIN_USERNAME,
          name: process.env.ADMIN_DEFAULT_NAME,
          role: process.env.ADMIN_DEFAULT_ROLE,
          mustChangePassword: false,
          lastLogin: new Date(),
        },
        accessToken: this.jwtService.sign(payload),
      };
    }

    //  ALWAYS load full staff from DB
    const staffDoc = await this.staffService.findByUsername(staff.username);
    if (!staffDoc) {
      throw new UnauthorizedException('Staff not found');
    }

    // Update last login
    staffDoc.lastLogin = new Date();
    await staffDoc.save();

    const payload: JwtPayload = {
      username: staffDoc.username,
      sub: staffDoc._id.toString(), //  from DB
      mustChangePassword: staffDoc.mustChangePassword, // optional but useful
    };

    const userObject = await this.buildUserObject(staffDoc);
    console.log("Built user object for login:", userObject);
    return {
      staff: {
        ...userObject,
        mustChangePassword: staffDoc.mustChangePassword, //  safe
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

}
