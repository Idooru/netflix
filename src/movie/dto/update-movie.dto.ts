import {
  Contains,
  Equals,
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsCreditCard,
  IsDate,
  IsDateString,
  IsDefined,
  IsDivisibleBy,
  IsEmpty,
  IsEnum,
  IsHexColor,
  IsIn,
  IsInt,
  IsLatLong,
  IsNegative,
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotContains,
  NotEquals,
  registerDecorator,
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

enum MovieGenre {
  Fantasy = 'fantasy',
  Action = 'action',
}

@ValidatorConstraint()
class PasswordValidator implements ValidatorConstraintInterface {
  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    if (!value) {
      return false;
    }
    return value.length > 4 && value.length < 8;
  }
  defaultMessage?(arg?: ValidationArguments): string {
    return `비밀번호의 길이는 4 ~ 8자 여야 합니다. 입력된 비밀번호 (${arg?.value})`;
  }
}

function IsPasswordValid(options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: PasswordValidator,
    });
  };
}

@ValidatorConstraint()
class EmailValidator implements ValidatorConstraintInterface {
  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    if (!value) {
      return false;
    }

    if (!(value.length > 12 && value.length < 25)) {
      return false;
    }

    if (!value.includes('@')) {
      return false;
    }

    return true;
  }

  defaultMessage?(args?: ValidationArguments): string {
    if (!args?.value) {
      return '이메일을 입력하지 않았습니다.';
    }

    return `이메일 형식에 어긋납니다. (${args?.value}) `;
  }
}

function IsEmailValid(options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: EmailValidator,
    });
  };
}

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  genre?: string;

  // null || undefined
  // @IsDefined()
  // @IsOptional()
  // @Equals('hello')
  // @NotEquals('hello')
  // null || undefined || ""
  // @IsEmpty()
  // @IsNotEmpty()
  // Array
  // @IsIn(['action', 'fantasy'])
  // @IsNotIn(['action', 'fantasy'])
  // test: string;

  // @IsEnum(MovieGenre)
  // @IsDateString()
  // @IsDivisibleBy(5)
  // @IsPositive()
  // @IsNegative()
  // @Min(100)
  // @Min(50)
  // @Max(100)

  // @Contains('code')
  // @NotContains('code')
  // @IsAlphanumeric()
  // @IsCreditCard()
  // @IsHexColor()
  // @MaxLength(15)
  // @MinLength(5)
  // @IsUUID()
  // @IsLatLong()
  // test: string;
  // @IsPasswordValid()
  // password: string;

  // @IsEmailValid()
  // email: string;
}
