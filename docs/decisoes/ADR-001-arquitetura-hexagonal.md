# ADR-001: Adoção da Arquitetura Hexagonal

**Status:** Aceita
**Data:** 16/11/2026

## Contexto
O FreelaHub é um marketplace que conecta clientes e freelancers. O núcleo do sistema tem regras de negócio próprias (ciclo de vida de projetos, propostas, contratos e pagamentos) e depende de vários elementos externos: banco de dados, gateway de pagamento, serviço de e-mail e a interface web.

Para o tema 11, os estilos indicados são Microkernel, Hexagonal e Clean Architecture.

## Decisão
Adotar majoritariamente a **Arquitetura Hexagonal (Ports and Adapters)** no backend:

- **Domínio:** entidades e regras de negócio, sem dependência de frameworks.
- **Aplicação:** casos de uso que orquestram o domínio e declaram as **portas**:
  - Portas de entrada: casos de uso como `PublicarProjeto`, `EnviarProposta`, `AceitarProposta`, `LiberarPagamento`.
  - Portas de saída: `ProjetoRepository`, `PropostaRepository`, `ContratoRepository`, `PaymentGateway`, `NotificationService`.
- **Adaptadores:**
  - Entrada: controllers HTTP (Express).
  - Saída: repositórios PostgreSQL, `FakePaymentAdapter` e `ConsoleNotificationAdapter`.

## Alternativas consideradas
- **Microkernel:** faria sentido se o foco fosse extensibilidade por plugins (por exemplo, métodos de pagamento plugáveis). Foi descartado porque o principal desafio do sistema é isolar o domínio das integrações, e não carregar plugins em tempo de execução.
- **Clean Architecture:** é muito próxima da Hexagonal e foi usada como inspiração na separação entre domínio e aplicação. Escolhemos a Hexagonal como estilo principal porque a ideia de portas e adaptadores representa diretamente as integrações externas do marketplace.

## Consequências
**Positivas**
- O domínio pode ser testado sem banco de dados e sem serviços externos.
- Trocar o gateway de pagamento simulado por um real (Mercado Pago, Stripe) exige apenas um novo adaptador.
- A estrutura de pastas reflete o estilo arquitetural, o que facilita verificar a conformidade com os diagramas.

**Negativas**
- Mais interfaces e arquivos do que uma arquitetura em camadas simples.
- Exige disciplina da equipe para que o domínio não importe código dos adaptadores.
