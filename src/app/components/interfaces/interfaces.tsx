export interface Relatorio {
  id: number;
  nomePaciente: string;
  nomeProfissional: string;
  especialidade: string;
  dataConsulta: string;
  descricao: string;
}

export type ProfessionalType =
  | "psiquiatra"
  | "psicologo"
  | "fonoaudiologo"
  | "TO"
  | "assistente social"
  | "fisioterapeuta"
  | "outro"
  | string;

export interface Profissional {
  id: number; // vem do MySQL INT
  nome: string;
  email: string;
  senha?: string;
  dataNasc: string;

  especialidade: ProfessionalType;
  outraEspecialidade?: string;

  registroProfissional?: string;

  rolee: string;

  qtdAtendimentos: number;
}

export interface Paciente {
  id: number;
  nome: string;
  dataNasc: string;
  prontuario: string;
  cartaoSUS?: string;
  cpf?: string;
  descricao?: string;
  laudoFile?: File | null;
  status?: "Ativo" | "Inativo";
  qtdConsultasRealizadas: number;
}

export interface Relatorio {
  id: number;
  profissionalId: number;
  profissionalNome: string;
  profissionalEspecialidade: string;

  alunoId: number;   // ✅ ADICIONE ISSO
  alunoNome: string;

  descricao: string;
  data: string;
  createdAt: string;
}