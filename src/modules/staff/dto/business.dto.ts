import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";


//////////////////////////// BUSINESS DTO ////////////////////////////
export class BusinessDto {
    @ApiProperty({ example: '603d2f1e...' })
    @Expose()
    _id: string;

    @ApiProperty({ example: 'QOBEY' })
    @Expose()
    businessName: string;

    @ApiProperty({ example: 'https://simad-images.s3.us-east-1.amazonaws.com/logos/54ef147b-1de9-4b82-bfac-4423b6195c68.jpeg' })
    @Expose()
    logo: string;
}
