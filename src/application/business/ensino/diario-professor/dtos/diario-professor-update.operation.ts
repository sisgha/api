import { InputType } from '@nestjs/graphql';
import { OmitType } from '@nestjs/swagger';
import * as Dto from '@sisgea/spec';
import * as yup from 'yup';
import { DtoProperty, ValidationContractUuid, createDtoOperationOptions, createValidationContract } from '../../../../../infrastructure';
import { DiarioProfessorFindOneByIdInputValidationContract, DiarioProfessorFindOneResultDto } from './diario-professor-find-one.operation';
import { DiarioProfessorInputDtoValidationContract } from './diario-professor-input.operation';
import { DiarioProfessorDto, DiarioProfessorDtoProperties } from './diario-professor.dto';

// ======================================================

export const DiarioProfessorUpdateInputDtoValidationContract = createValidationContract(() => {
  return yup.object().concat(DiarioProfessorFindOneByIdInputValidationContract()).concat(DiarioProfessorInputDtoValidationContract().partial().omit([])).shape({});
});

// ======================================================

@InputType('DiarioProfessorUpdateInputDto')
export class DiarioProfessorUpdateInputDto implements Dto.IDiarioProfessorUpdateDto {
  @DtoProperty(DiarioProfessorDtoProperties.DIARIO_PROFESSOR_ID)
  id!: string;

  //

  @DtoProperty(DiarioProfessorDtoProperties.DIARIO_PROFESSOR_SITUACAO, { required: false })
  situacao?: boolean;

  @DtoProperty(DiarioProfessorDtoProperties.DIARIO_PROFESSOR_DIARIO_INPUT, { required: false })
  diario?: Dto.IObjectUuid;

  @DtoProperty(DiarioProfessorDtoProperties.DIARIO_PROFESSOR_VINCULO_PROFESSOR_INPUT, { required: false })
  vinculoProfessor?: Dto.IObjectUuid;

  //
}

export class DiarioProfessorUpdateWithoutIdInputDto extends OmitType(DiarioProfessorUpdateInputDto, ['id'] as const) {}

export const DIARIO_PROFESSOR_UPDATE = createDtoOperationOptions({
  description: 'Realiza a alteração de vínculo de diário e professor.',

  gql: {
    name: 'diarioProfessorUpdate',

    inputDtoType: () => DiarioProfessorUpdateInputDto,
    inputDtoValidationContract: DiarioProfessorUpdateInputDtoValidationContract,

    returnType: () => DiarioProfessorDto,
  },

  swagger: {
    inputBodyType: DiarioProfessorUpdateWithoutIdInputDto,

    inputBodyValidationContract: createValidationContract(() => DiarioProfessorUpdateInputDtoValidationContract().omit(['id'])),

    params: [
      {
        name: 'id',
        description: 'ID de vínculo de diário e professor.',
        validationContract: ValidationContractUuid,
      },
    ],

    returnType: DiarioProfessorFindOneResultDto,
  },
});
