import { Relatorio } from '@/types';

const nomes = [
  'Maria Eduarda', 'João Pedro', 'Lucas Henrique', 'Ana Clara', 'Eduardo Silva',
  'Cláudio Mendes', 'Fernanda Alves', 'Rafael Costa', 'Juliana Rocha',
  'Bruno Martins', 'Camila Nogueira', 'Gabriel Santos', 'Patrícia Lima',
  'Renato Oliveira', 'Beatriz Fonseca', 'Daniel Ribeiro', 'Larissa Pacheco',
  'Felipe Araujo', 'Carla Moreira', 'Thiago Barros',

  'Amanda Silva', 'Pedro Henrique', 'Matheus Santos', 'Isabela Rocha',
  'Marcos Vinícius', 'Paula Fernanda', 'Diego Alves', 'Natália Costa',
  'Rodrigo Lima', 'Aline Pacheco', 'Victor Hugo', 'Daniela Martins',
  'André Luiz', 'Letícia Gomes', 'Caio Ribeiro', 'Juliano Freitas',
  'Vanessa Moura', 'Igor Teixeira', 'Priscila Farias', 'Leonardo Cunha',

  'Bianca Lopes', 'Gustavo Rangel', 'Renata Guedes', 'Samuel Batista',
  'Carolina Azevedo', 'Vinícius Prado', 'Débora Macedo', 'Thiago Rezende',
  'Mariana Peixoto', 'Alexandre Pinho', 'Tatiane Paes', 'Lucas Figueiredo',
  'Patrícia Dantas', 'Henrique Lobo', 'Larissa Duarte', 'Bruno Tavares',
  'Elaine Campos', 'Felipe Neves', 'Cíntia Borges', 'Murilo Siqueira',

  'Rafaela Antunes', 'Eduardo Maluf', 'Camila Bastos', 'Otávio Guimarães',
  'Flávia Cardoso', 'Jorge Salgado', 'Natasha Barcellos', 'Ruan Medeiros',
  'Danielly Porto', 'Alan Vasconcelos', 'Juliana Pires', 'Fábio Seabra',
  'Michele Paiva', 'Renan Coelho', 'Simone Rios', 'Arthur Monteiro',

  'Luana Bernardes', 'Cristiano Morais', 'Sabrina Nunes', 'Alex Sandro',
  'Kelly Andrade', 'Paulo Sérgio', 'Monique Lacerda', 'Rafael Furtado',
  'Vanessa Gallo', 'Diego Pinheiro', 'Nathalia Queiroz', 'Marcelo Abreu',
  'Jéssica Pimenta', 'Wesley Brito', 'Talita Franco', 'Ricardo Paolini',

  'Mayara Falcão', 'Douglas Freire', 'Cristiane Leal', 'Iuri Mattos',
  'Adriana Rezende', 'Fabrício Mota', 'Luciana Torres', 'Brayan Ponce',
  'Elisa Portela', 'Fernando Falcetti', 'Sheila Bernardes', 'Ramon Duarte',
  'Silvia Paredes', 'Jefferson Lins', 'Karla Meireles', 'Elias Ventura'
];

const descricoes = [
  'Aluno com diagnóstico de TEA nível 1. Boa interação social, necessita apoio em organização.',
  'Aluno com TEA nível 2. Apresenta dificuldade de comunicação verbal.',
  'Aluno com TEA nível 3. Necessita acompanhamento constante.',
  'Aluno com atraso no desenvolvimento da linguagem.',
  'Aluno com dificuldades de atenção e concentração.',
  'Aluno apresenta boa evolução nas atividades propostas.',
  'Aluno com sensibilidade sensorial elevada.',
  'Aluno com dificuldade de interação social.',
  'Aluno em acompanhamento psicológico contínuo.',
  'Aluno responde bem às terapias multidisciplinares.'
];

export const initialUsers: User[] = [
  // Profissionais
  {
    id: 'prof1',
    nome: 'Dr. Carlos Silva',
    email: 'carlos@escola.com',
    senha: '123',
    role: 'profissional',
    especialidade: 'psiquiatra',
    registroProfissional: 'CRM 123456'
  },
  {
    id: 'prof2',
    nome: 'Dra. Ana Santos',
    email: 'ana@escola.com',
    senha: '123',
    role: 'profissional',
    especialidade: 'psicologo',
    registroProfissional: 'CRP 06/123456'
  },
  {
    id: 'prof3',
    nome: 'Dra. Maria Aparecida',
    email: 'maria@escola.com',
    senha: '123',
    role: 'profissional',
    especialidade: 'fonoaudiologo',
    registroProfissional: 'CRFa 2-12345'
  },

  // Secretaria
  {
    id: 'sec1',
    nome: 'Paula Secretária',
    email: 'secretaria@escola.com',
    senha: '123',
    role: 'secretaria'
  },

  // Alunos mockados
  ...generateMockAlunos()
];

export const initialRelatorios: Relatorio[] = [
  {
    id: 'rel1',
    profissionalId: 'prof1',
    profissionalNome: 'Dr. Carlos Silva',
    profissionalEspecialidade: 'psiquiatra',
    alunoId: 'aluno1',
    alunoNome: 'João Pedro',
    descricao: 'Consulta inicial. Aluno apresentou boa receptividade. Realizamos atividades de integração.',
    data: '2026-01-20',
    createdAt: new Date('2026-01-20T10:00:00').toISOString()
  },
  {
    id: 'rel2',
    profissionalId: 'prof2',
    profissionalNome: 'Dra. Ana Santos',
    profissionalEspecialidade: 'psicologo',
    alunoId: 'aluno2',
    alunoNome: 'Maria Eduarda',
    descricao: 'Sessão de acompanhamento. Aluna fez atividade recreativa de desenho para expressão emocional.',
    data: '2026-01-21',
    createdAt: new Date('2026-01-21T14:30:00').toISOString()
  },
  {
    id: 'rel3',
    profissionalId: 'prof3',
    profissionalNome: 'Maria Costa',
    profissionalEspecialidade: 'fonoaudiologo',
    alunoId: 'aluno3',
    alunoNome: 'Lucas Oliveira',
    descricao: 'Exercícios de pronúncia e dicção. Aluno mostrou evolução significativa.',
    data: '2026-01-22',
    createdAt: new Date('2026-01-22T09:15:00').toISOString()
  }
];

export function initializeLocalStorage() {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem('relatorios')) {
    localStorage.setItem('relatorios', JSON.stringify(initialRelatorios));
  }
}

export function getUsers(): User[] {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : initialUsers;
}


export async function getUsers2(): Promise<User[]> {
  try {
    const response = await fetch("http://192.168.32.108:3000/pacientes");
    const data = await response.json();

    const pacientesFormatados: User[] = data.map((p: any) => ({
      id: String(p.id),
      nome: p.nome,
      role: "aluno",
      cpf: p.cpf,
      cartaoSUS: p.cartao_sus,
      descricao: p.descricao,
      ativo: true,
    }));

    return pacientesFormatados;

  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return [];
  }
}


export function getRelatorios(): Relatorio[] {
  const relatorios = localStorage.getItem('relatorios');
  return relatorios ? JSON.parse(relatorios) : initialRelatorios;
}

export function saveRelatorio(relatorio: Relatorio) {
  const relatorios = getRelatorios();
  relatorios.push(relatorio);
  localStorage.setItem('relatorios', JSON.stringify(relatorios));
}

export function saveUser(user: User) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
}

export function updateRelatorio(id: string, relatorio: Partial<Relatorio>) {
  const relatorios = getRelatorios();
  const index = relatorios.findIndex(r => r.id === id);
  if (index !== -1) {
    relatorios[index] = { ...relatorios[index], ...relatorio };
    localStorage.setItem('relatorios', JSON.stringify(relatorios));
  }
}

export function deleteRelatorio(id: string) {
  const relatorios = getRelatorios();
  const filtered = relatorios.filter(r => r.id !== id);
  localStorage.setItem('relatorios', JSON.stringify(filtered));
}

export function updateUser(id: string, user: Partial<User>) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...user };
    localStorage.setItem('users', JSON.stringify(users));
  }
}

export function deleteUser(id: number) {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem('users', JSON.stringify(filtered));
}

export const saveUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export function generateMockAlunos(): User[] {
  const alunos: User[] = [];

  for (let i = 1; i <= 150; i++) {
  const ano = 1980 + (i % 30);
  const mes = String((i % 12) + 1).padStart(2, '0');
  const dia = String((i % 28) + 1).padStart(2, '0');
  

  alunos.push({
    id: `aluno-${i}`,
    nome: nomes[(i - 1) % nomes.length],
    email: '',
    senha: '',
    role: 'aluno',
    cpf: `000.000.000-${String(i).padStart(2, '0')}`,
    cartaoSUS: `898000000000${String(i).padStart(2, '0')}`,
    descricao: descricoes[(i - 1) % descricoes.length],
    ativo: i % 10 !== 0,

    // 👇 NOVOS CAMPOS
    prontuario: `00${i+1}`,
    dataNasc: `${ano}-${mes}-${dia}`,
  });
}


  return alunos;
}
