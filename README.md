# Wallet App

- Sistema para teste do Grupo Grupo Adriano Cobuccio

## Tecnologias Utilizadas
- Node.js
- NestJS
- TypeScript
- PostgreSQL (TypeORM)
- JWT para autenticação
- Swagger para documentação da API
- Docker e Docker Compose para containerização
- Jest para testes unitários e de integração

## Funcionalidades
- Cadastro de Usuários: Registro com validação e senha criptografada.
- Autenticação: Login com geração de token JWT.
- Transferência: Realização de transferências com validação de saldo e operação atômica.
- Reversão de Transações: Possibilidade de reverter uma transferência em caso de inconsistências ou solicitação do usuário.
- Depósito: Rota para adicionar saldo à conta.
- Listagem e Consulta: Endpoints para listar e consultar transações e usuários.

## Como Iniciar
### Pré-requisitos
- Node.js (v20 ou superior)
- Docker e Docker Compose

### Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

### Instalar Dependências

```bash
npm install
```

### Rodar local
```bash
npm run start:dev
```

### Subir aplicação com Docker

```bash
docker compose up --build -d
```

A API estará disponível em http://localhost:3000 e a documentação Swagger em http://localhost:3000/api.

### Executar os Testes
Para rodar todos os testes:
```bash
npm run test:all
```

Para rodar apenas os testes unitarios:

```bash
npm run test
```

Para rodar apenas os testes de integração:

```bash
npm run test:e2e
```

## Estrutura do Projeto
```
wallet-app/
├── src/
│   ├── auth/            # Autenticação (login, JWT, estratégias)
│   ├── users/           # Cadastro e gerenciamento de usuários
│   ├── transactions/    # Transferência, reversão e depósito de saldo
│   ├── common/          # Filtros, interceptors e utilitários
│   ├── app.module.ts    # Módulo raiz da aplicação
│   └── main.ts          # Ponto de entrada
├── test/                # Testes unitários e de integração
├── .env.example         # Exemplo de variáveis de ambiente
├── Dockerfile           # Containerização da aplicação
├── docker-compose.yml   # Orquestração do ambiente (API e PostgreSQL)
└── package.json
```

