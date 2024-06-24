import * as LadesaTypings from '@ladesa-ro/especificacao';
import { Injectable, NotFoundException } from '@nestjs/common';
import { map, pick } from 'lodash';
import { FilterOperator } from 'nestjs-paginate';
import { IContextoDeAcesso } from '../../../contexto-de-acesso';
import { QbEfficientLoad } from '../../../helpers/ladesa/QbEfficientLoad';
import { LadesaPaginatedResultDto, LadesaSearch } from '../../../helpers/ladesa/search/search-strategies';
import { DatabaseContextService } from '../../../integracao-banco-de-dados';
import { BlocoEntity } from '../../../integracao-banco-de-dados/typeorm/entities';
import { paginateConfig } from '../../../legacy/utils';
import { ArquivoService } from '../../base/arquivo/arquivo.service';
import { ImagemService } from '../../base/imagem/imagem.service';
import { CampusService } from '../campus/campus.service';

// ============================================================================

const aliasBloco = 'bloco';

// ============================================================================

@Injectable()
export class BlocoService {
  constructor(
    private campusService: CampusService,
    private databaseContext: DatabaseContextService,
    private imagemService: ImagemService,
    private arquivoService: ArquivoService,
  ) {}

  get blocoRepository() {
    return this.databaseContext.blocoRepository;
  }

  //

  async blocoFindAll(
    //
    contextoDeAcesso: IContextoDeAcesso,
    dto: LadesaTypings.BlocoListCombinedInput | null = null,
    selection?: string[] | boolean,
  ): Promise<LadesaTypings.BlocoListCombinedSuccessOutput['body']> {
    // =========================================================

    const qb = this.blocoRepository.createQueryBuilder(aliasBloco);

    // =========================================================

    await contextoDeAcesso.aplicarFiltro('bloco:find', qb, aliasBloco, null);

    // =========================================================

    const paginated = await LadesaSearch('/blocos', dto, qb, {
      ...paginateConfig,
      select: [
        //
        'id',
        //
        'nome',
        'codigo',
        'dateCreated',
        //
        'campus.id',
        'campus.razaoSocial',
        'campus.nomeFantasia',
      ],
      relations: {
        campus: true,
      },
      sortableColumns: [
        //
        'nome',
        'codigo',
        'dateCreated',
        //
        'campus.id',
        'campus.razaoSocial',
        'campus.nomeFantasia',
      ],
      searchableColumns: [
        //
        'id',
        //
        'nome',
        'codigo',
        //
      ],
      defaultSortBy: [
        ['nome', 'ASC'],
        ['dateCreated', 'ASC'],
      ],
      filterableColumns: {
        'campus.id': [FilterOperator.EQ],
      },
    });

    // =========================================================

    qb.select([]);
    QbEfficientLoad(LadesaTypings.Tokens.Bloco.Views.FindOneResult, qb, aliasBloco, selection);

    // =========================================================
    const pageItemsView = await qb.andWhereInIds(map(paginated.data, 'id')).getMany();
    paginated.data = paginated.data.map((paginated) => pageItemsView.find((i) => i.id === paginated.id)!);
    // =========================================================

    return LadesaPaginatedResultDto(paginated);
  }

  async blocoFindById(contextoDeAcesso: IContextoDeAcesso | null, dto: LadesaTypings.BlocoFindOneInput, selection?: string[] | boolean): Promise<LadesaTypings.BlocoFindOneResult | null> {
    // =========================================================

    const qb = this.blocoRepository.createQueryBuilder(aliasBloco);

    // =========================================================

    if (contextoDeAcesso) {
      await contextoDeAcesso.aplicarFiltro('bloco:find', qb, aliasBloco, null);
    }

    // =========================================================

    qb.andWhere(`${aliasBloco}.id = :id`, { id: dto.id });

    // =========================================================

    qb.select([]);
    QbEfficientLoad(LadesaTypings.Tokens.Bloco.Views.FindOneResult, qb, aliasBloco, selection);

    // =========================================================

    const bloco = await qb.getOne();

    // =========================================================

    return bloco;
  }

  async blocoFindByIdStrict(contextoDeAcesso: IContextoDeAcesso | null, dto: LadesaTypings.BlocoFindOneInput, selection?: string[] | boolean) {
    const bloco = await this.blocoFindById(contextoDeAcesso, dto, selection);

    if (!bloco) {
      throw new NotFoundException();
    }

    return bloco;
  }

  async blocoFindByIdSimple(contextoDeAcesso: IContextoDeAcesso, id: LadesaTypings.BlocoFindOneInput['id'], selection?: string[]): Promise<LadesaTypings.BlocoFindOneResult | null> {
    // =========================================================

    const qb = this.blocoRepository.createQueryBuilder(aliasBloco);

    // =========================================================

    await contextoDeAcesso.aplicarFiltro('bloco:find', qb, aliasBloco, null);

    // =========================================================

    qb.andWhere(`${aliasBloco}.id = :id`, { id });

    // =========================================================

    qb.select([]);
    QbEfficientLoad(LadesaTypings.Tokens.Bloco.Views.FindOneResult, qb, aliasBloco, selection);

    // =========================================================

    const bloco = await qb.getOne();

    // =========================================================

    return bloco;
  }

  async blocoFindByIdSimpleStrict(contextoDeAcesso: IContextoDeAcesso, id: LadesaTypings.BlocoFindOneInput['id'], selection?: string[]) {
    const bloco = await this.blocoFindByIdSimple(contextoDeAcesso, id, selection);

    if (!bloco) {
      throw new NotFoundException();
    }

    return bloco;
  }

  //

  async blocoGetImagemCapa(contextoDeAcesso: IContextoDeAcesso | null, id: string) {
    const bloco = await this.blocoFindByIdStrict(contextoDeAcesso, { id: id });

    if (bloco.imagemCapa) {
      const [versao] = bloco.imagemCapa.versoes;

      if (versao) {
        const { arquivo } = versao;
        return this.arquivoService.getStreamableFile(null, arquivo.id, null);
      }
    }

    throw new NotFoundException();
  }

  async blocoUpdateImagemCapa(contextoDeAcesso: IContextoDeAcesso, dto: LadesaTypings.BlocoFindOneInput, file: Express.Multer.File) {
    // =========================================================

    const currentBloco = await this.blocoFindByIdStrict(contextoDeAcesso, { id: dto.id });

    // =========================================================

    await contextoDeAcesso.ensurePermission('bloco:update', { dto: { id: currentBloco.id } }, currentBloco.id, this.blocoRepository.createQueryBuilder(aliasBloco));

    // =========================================================

    const { imagem } = await this.imagemService.saveBlocoCapa(file);

    const bloco = {
      id: currentBloco.id,
    } as BlocoEntity;

    this.blocoRepository.merge(bloco, {
      imagemCapa: {
        id: imagem.id,
      },
    });

    await this.blocoRepository.save(bloco);

    // =========================================================

    return true;
  }

  //

  async blocoCreate(contextoDeAcesso: IContextoDeAcesso, dto: LadesaTypings.BlocoCreateCombinedInput) {
    // =========================================================

    await contextoDeAcesso.ensurePermission('bloco:create', { dto });

    // =========================================================

    const dtoBloco = pick(dto.body, ['nome', 'codigo']);

    const bloco = this.blocoRepository.create();

    this.blocoRepository.merge(bloco, {
      ...dtoBloco,
    });

    // =========================================================

    const campus = await this.campusService.campusFindByIdSimpleStrict(contextoDeAcesso, dto.body.campus.id);

    this.blocoRepository.merge(bloco, {
      campus: {
        id: campus.id,
      },
    });

    // =========================================================

    await this.blocoRepository.save(bloco);

    // =========================================================

    return this.blocoFindByIdStrict(contextoDeAcesso, { id: bloco.id });
  }

  async blocoUpdate(contextoDeAcesso: IContextoDeAcesso, dto: LadesaTypings.BlocoUpdateByIDCombinedInput) {
    // =========================================================

    const currentBloco = await this.blocoFindByIdStrict(contextoDeAcesso, {
      id: dto.params.id,
    });

    // =========================================================

    await contextoDeAcesso.ensurePermission('bloco:update', { dto }, dto.params.id, this.blocoRepository.createQueryBuilder(aliasBloco));

    // =========================================================

    const dtoBloco = pick(dto.body, ['nome', 'codigo']);

    const bloco = {
      id: currentBloco.id,
    } as BlocoEntity;

    this.blocoRepository.merge(bloco, {
      ...dtoBloco,
    });

    // =========================================================

    await this.blocoRepository.save(bloco);

    // =========================================================

    return this.blocoFindByIdStrict(contextoDeAcesso, { id: bloco.id });
  }

  //

  async blocoDeleteOneById(contextoDeAcesso: IContextoDeAcesso, dto: LadesaTypings.BlocoFindOneInput) {
    // =========================================================

    await contextoDeAcesso.ensurePermission('bloco:delete', { dto }, dto.id, this.blocoRepository.createQueryBuilder(aliasBloco));

    // =========================================================

    const bloco = await this.blocoFindByIdStrict(contextoDeAcesso, dto);

    // =========================================================

    if (bloco) {
      await this.blocoRepository
        .createQueryBuilder(aliasBloco)
        .update()
        .set({
          dateDeleted: 'NOW()',
        })
        .where('id = :blocoId', { blocoId: bloco.id })
        .andWhere('dateDeleted IS NULL')
        .execute();
    }

    // =========================================================

    return true;
  }
}
