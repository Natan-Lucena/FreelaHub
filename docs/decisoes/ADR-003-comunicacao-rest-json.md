# ADR-003: Comunicação REST/JSON entre frontend e API

**Status:** Aceita
**Data:** 16/11/2026
**Responsável:** Emilly Paiva

## Contexto
O sistema é composto por uma aplicação web e uma API backend implantadas como containers separados. A aplicação web precisa consultar e alterar projetos, propostas, contratos e pagamentos, e todas as operações do fluxo principal são iniciadas por uma ação do usuário e respondidas de imediato.

Na Arquitetura Hexagonal adotada (ADR-001), a forma de comunicação com o frontend é um adaptador de entrada. A escolha do protocolo não deve afetar o domínio.

## Decisão
Expor a API como REST sobre HTTPS, com corpo das mensagens em JSON:

- Os recursos são organizados por entidade: `/usuarios`, `/projetos`, `/projetos/{id}/propostas`, `/contratos` e `/contratos/{id}/pagamento`.
- Mudanças de estado do fluxo são representadas como ações sobre o recurso, por exemplo `POST /propostas/{id}/aceite` e `POST /contratos/{id}/confirmacao-entrega`.
- Os controllers Express convertem a requisição em uma chamada ao caso de uso e convertem o resultado em resposta HTTP. Nenhuma regra de negócio fica no controller.
- Os erros de domínio são mapeados para códigos HTTP padronizados (400, 401, 403, 404 e 409), com corpo JSON contendo uma mensagem legível.

## Alternativas consideradas
- **GraphQL:** daria mais flexibilidade nas consultas do frontend, mas o número de telas é pequeno e as consultas são previsíveis. A curva de aprendizado não se justifica no prazo do trabalho.
- **WebSocket:** seria útil para o chat (RF09), que está fora do escopo de implementação. Para o fluxo principal, requisição e resposta atendem.

## Consequências
**Positivas**
- O padrão é conhecido por toda a equipe e pode ser testado com ferramentas simples, como Postman ou curl.
- O contrato da API fica explícito e pode ser documentado rota por rota.
- Um novo adaptador de entrada, como uma CLI ou uma fila, pode reutilizar os mesmos casos de uso.

**Negativas**
- Telas que combinam dados de vários recursos podem exigir mais de uma requisição.
- Notificações em tempo real exigirão um mecanismo adicional no futuro.
