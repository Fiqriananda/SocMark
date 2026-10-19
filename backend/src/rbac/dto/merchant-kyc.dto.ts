import { IsNotEmpty, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class BankAccountDTO {
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  holderName: string;
}

export class WarehouseAddressDTO {
  @IsString()
  @IsNotEmpty()
  subDistrictId: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;
}

export class MerchantKycDTO {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsNotEmpty()
  storeSlug: string;

  @IsString()
  @MinLength(16, { message: 'Nomor KTP harus minimal 16 digit' })
  idCardNumber: string;

  @IsString()
  @IsOptional()
  taxIdNumber?: string;

  @IsObject()
  @IsNotEmpty()
  bankAccount: BankAccountDTO;

  @IsObject()
  @IsNotEmpty()
  warehouseAddress: WarehouseAddressDTO;

  @IsObject()
  @IsNotEmpty()
  documents: Record<string, any>;
}
