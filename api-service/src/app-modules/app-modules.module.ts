import { Module } from '@nestjs/common';
import { AmbientesModule } from './ambientes/ambientes.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { BaseModule } from './base/base.module';
import { CalendarioModule } from './calendario/calendario.module';
import { EnsinoModule } from './ensino/ensino.module';
import { HorarioAcademicoModule } from './horario-academico/horario-academico.module';
import { GerarHorarioModule } from './gerar-horario/gerar-horario.module';
import { DisponibilidadeProfessorModule } from './horario-academico/disponibilidade-professor/disponibilidade-professor.module';

@Module({
  imports: [
    //
    BaseModule,
    AutenticacaoModule,
    AmbientesModule,
    EnsinoModule,
    CalendarioModule,
    HorarioAcademicoModule,
    DisponibilidadeProfessorModule
    /*GerarHorarioModule*/
  ],
})
export class AppModulesModule { }
