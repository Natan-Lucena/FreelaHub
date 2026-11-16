# FreelaHub: Marketplace de Freelancers

Trabalho final da disciplina **Arquitetura de Software (2026.2)**, UFC Campus Quixadá.
Tema 11: Marketplace de Freelancers.

## Sobre o sistema
Plataforma que conecta **clientes** a **freelancers**. O cliente publica um projeto, os freelancers enviam propostas, o cliente aceita uma delas e o pagamento fica retido até a confirmação da entrega.

O documento completo de requisitos está em [`docs/requisitos`](docs/requisitos).

## Funcionalidades
**Implementadas:**
- [ ] RF01: Cadastro e autenticação de usuários (JWT)
- [ ] RF02: Publicação de projeto
- [ ] RF03: Listagem e filtro de projetos
- [ ] RF04: Envio de proposta
- [ ] RF05: Aceite de proposta e geração de contrato
- [ ] RF06: Pagamento com retenção (escrow), simulado
- [ ] RF07: Notificações por e-mail, simuladas

**Apenas documentadas:**
- RF08: Avaliações mútuas
- RF09: Chat entre cliente e freelancer
- RF10: Moderação e disputas

**Fluxo principal demonstrado:** publicar projeto, enviar proposta, aceitar proposta, gerar contrato, reter pagamento e liberar pagamento na entrega.

## Estilo arquitetural
**Hexagonal (Ports and Adapters).** O domínio (Projeto, Proposta, Contrato, Pagamento) não depende de framework, banco de dados ou gateway. Ele se comunica com o exterior por **portas** (interfaces), e cada tecnologia entra como um **adaptador**. As decisões estão registradas em [`docs/decisoes`](docs/decisoes).

## Stack
React + TypeScript, Node.js + Express + TypeScript, PostgreSQL e Docker Compose.

## Arquitetura (C4)
Os diagramas estão em [`docs/c4/workspace.dsl`](docs/c4/workspace.dsl).

**Visualizar online:** cole o conteúdo do arquivo em [playground.structurizr.com](https://playground.structurizr.com).

**Visualizar localmente com Docker:**
```bash
cd docs/c4
docker run -it --rm -p 8080:8080 -v "$(pwd)":/usr/local/structurizr structurizr/structurizr local
# abra http://localhost:8080
```

| Visão | Status |
|---|---|
| Contexto | Pronto |
| Container | Pronto |
| Componentes | Previsto para 23/11 |
| Código | Previsto para 23/11 |

## Estrutura do repositório
```
docs/
  c4/workspace.dsl        diagramas C4 (Structurizr DSL)
  decisoes/               ADRs (decisões arquiteturais)
  requisitos/             documento de requisitos
backend/src/
  domain/                 entidades e regras de negócio (núcleo)
  application/            casos de uso e portas (interfaces)
  adapters/
    in/http/              controllers Express (adaptador de entrada)
    out/persistence/      repositórios PostgreSQL
    out/payment/          gateway de pagamento (simulado)
    out/notification/     e-mail (simulado)
frontend/
```

## Cronograma
| Data | Entrega |
|---|---|
| 16/11 e 17/11 | Aplicativo definido, funcionalidades, estilo arquitetural, repositório, diagramas de Contexto e Container |
| 23/11 e 24/11 | Diagramas de Componentes e Código |
| 01/12, 07/12 e 08/12 | Código rodando, conformidade com os diagramas e apresentação |
