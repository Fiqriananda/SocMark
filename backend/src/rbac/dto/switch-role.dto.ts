import { IsNotEmpty, IsString } from 'class-validator';

export class SwitchRoleDTO {
  @IsString()
  @IsNotEmpty({ message: 'Role target tidak boleh kosong' })
  role: string;
}
