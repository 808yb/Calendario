import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEmail()
  @IsNotEmpty()
  guestEmail: string;

  @IsString()
  @IsOptional()
  additionalInfo: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  location: string;
}

export class MeetingIdDTO {
  @IsUUID(4, { message: "Invaild uuid" })
  @IsNotEmpty()
  meetingId: string;
}
