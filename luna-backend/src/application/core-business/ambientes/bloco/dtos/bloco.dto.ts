import { ObjectType } from '@nestjs/graphql';
import * as yup from 'yup';
import { BlocoFindOneResultDto } from '.';
import { CommonPropertyUuid, IBlocoModel, ICampusModel, IEntityDate, ObjectUuidDto } from '../../../(dtos)';
import { DtoProperty, ValidationContractObjectUuid, ValidationContractString, ValidationContractUuid, createDtoPropertyMap, createValidationContract } from '../../../../../infrastructure';
import { CampusDto } from '../../campus/dtos';

// ======================================================

export const BlocoDtoValidationContract = createValidationContract(() => {
  return yup.object({
    id: ValidationContractUuid(),

    //

    nome: ValidationContractString(),
    codigo: ValidationContractString(),

    //

    campus: ValidationContractObjectUuid({ required: true }).defined().required(),
  });
});

// ======================================================

export const BlocoDtoProperties = createDtoPropertyMap({
  BLOCO_ID: CommonPropertyUuid('ID do bloco'),

  BLOCO_NOME: {
    nullable: false,
    description: 'Nome do bloco.',
    //
    gql: {
      type: () => String,
    },
    swagger: {
      type: 'string',
    },
  },

  BLOCO_CODIGO: {
    nullable: false,
    description: 'Código / Letra / Número do bloco.',
    //
    gql: {
      type: () => String,
    },
    swagger: {
      type: 'string',
    },
  },

  BLOCO_CAMPUS_INPUT: {
    nullable: false,
    description: 'Campus que o bloco pertence.',
    //
    gql: {
      type: () => ObjectUuidDto,
    },
    swagger: {
      type: () => ObjectUuidDto,
    },
  },

  BLOCO_CAMPUS_OUTPUT: {
    nullable: false,
    description: 'Campus que o bloco pertence.',
    //
    gql: {
      type: () => CampusDto,
    },
    swagger: {
      type: () => BlocoFindOneResultDto,
    },
  },
});

// ======================================================

@ObjectType('Bloco')
export class BlocoDto implements IBlocoModel {
  @DtoProperty(BlocoDtoProperties.BLOCO_ID)
  id!: string;

  //

  @DtoProperty(BlocoDtoProperties.BLOCO_NOME)
  nome!: string;

  @DtoProperty(BlocoDtoProperties.BLOCO_CODIGO)
  codigo!: string;

  @DtoProperty(BlocoDtoProperties.BLOCO_CAMPUS_OUTPUT)
  campus!: ICampusModel;

  //

  dateCreated!: IEntityDate;
  dateUpdated!: IEntityDate;
  dateDeleted!: IEntityDate | null;
}

// ======================================================
