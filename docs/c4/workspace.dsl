workspace "FreelaHub: Marketplace de Freelancers" "Modelo C4 do trabalho final de Arquitetura de Software (Tema 11)" {

    !identifiers hierarchical

    model {
        cliente = person "Cliente" "Pessoa ou empresa que publica projetos e contrata freelancers."
        freelancer = person "Freelancer" "Profissional que busca projetos e envia propostas."
        admin = person "Administrador" "Modera usuários, projetos e disputas."

        gatewayPagamento = softwareSystem "Gateway de Pagamento" "Processa pagamentos (ex.: Mercado Pago ou Stripe em modo sandbox)." "Externo"
        servicoEmail = softwareSystem "Serviço de E-mail" "Envia notificações por e-mail (ex.: SendGrid)." "Externo"

        freelahub = softwareSystem "FreelaHub" "Plataforma que conecta clientes a freelancers, gerenciando projetos, propostas, contratos e pagamentos." {
            webapp = container "Aplicação Web" "Interface para clientes, freelancers e administradores." "React + TypeScript" "Browser"
            api = container "API Backend" "Regras de negócio do marketplace, organizada em Arquitetura Hexagonal (domínio + portas + adaptadores)." "Node.js + Express + TypeScript" {
                # Fatia RF04 e RF07: propostas e notificações
                rotasPropostas = component "Rotas de Propostas" "POST e GET /projetos/{id}/propostas. Converte HTTP em chamadas aos casos de uso." "Express Router" "Adaptador"
                enviarProposta = component "EnviarProposta" "Caso de uso: valida perfil, RN02 e RN03, cria a proposta PENDENTE e notifica o cliente." "TypeScript" "Caso de uso"
                listarPropostas = component "ListarPropostasDoProjeto" "Caso de uso: lista as propostas de um projeto para o cliente dono." "TypeScript" "Caso de uso"
                proposta = component "Proposta" "Entidade de domínio com o ciclo PENDENTE -> ACEITA ou RECUSADA." "TypeScript" "Domínio"
                propostaRepository = component "PropostaRepository" "Porta de saída para persistência de propostas." "Interface TypeScript" "Porta"
                projetoConsulta = component "ProjetoConsulta" "Porta de saída de leitura do dono, título e status do projeto." "Interface TypeScript" "Porta"
                notificationService = component "NotificationService" "Porta de saída para notificações de eventos do fluxo." "Interface TypeScript" "Porta"
                postgresPropostaRepository = component "PostgresPropostaRepository" "Implementa PropostaRepository sobre a tabela propostas." "pg" "Adaptador"
                postgresProjetoConsulta = component "PostgresProjetoConsulta" "Implementa ProjetoConsulta sobre a tabela projetos." "pg" "Adaptador"
                consoleNotification = component "ConsoleNotificationAdapter" "Implementa NotificationService registrando destinatário, assunto e corpo no console." "TypeScript" "Adaptador"
            }
            db = container "Banco de Dados" "Armazena usuários, projetos, propostas, contratos e pagamentos." "PostgreSQL" "Database"
        }

        # Relações no nível de contexto
        cliente -> freelahub "Publica projetos, avalia propostas e paga freelancers"
        freelancer -> freelahub "Busca projetos, envia propostas e entrega trabalhos"
        admin -> freelahub "Modera a plataforma"
        freelahub -> gatewayPagamento "Solicita cobranças e repasses" "HTTPS/REST"
        freelahub -> servicoEmail "Envia notificações" "HTTPS/REST"
        gatewayPagamento -> freelahub "Confirma status de pagamento" "Webhook HTTPS"
        servicoEmail -> cliente "Entrega notificações por e-mail" "SMTP"
        servicoEmail -> freelancer "Entrega notificações por e-mail" "SMTP"

        # Relações no nível de container
        cliente -> freelahub.webapp "Usa" "HTTPS"
        freelancer -> freelahub.webapp "Usa" "HTTPS"
        admin -> freelahub.webapp "Usa" "HTTPS"
        freelahub.webapp -> freelahub.api "Faz requisições" "JSON/HTTPS (REST) + JWT"
        freelahub.api -> freelahub.db "Lê e grava dados" "SQL (via adaptador de repositório)"
        freelahub.api -> gatewayPagamento "Cria cobranças e repasses" "HTTPS/REST (adaptador de pagamento)"
        freelahub.api -> servicoEmail "Envia e-mails" "HTTPS/REST (adaptador de notificação)"
        gatewayPagamento -> freelahub.api "Notifica pagamento confirmado" "Webhook HTTPS"

        # Relações no nível de componente: propostas e notificações
        freelahub.webapp -> freelahub.api.rotasPropostas "Envia e consulta propostas" "JSON/HTTPS + JWT"
        freelahub.api.rotasPropostas -> freelahub.api.enviarProposta "Executa"
        freelahub.api.rotasPropostas -> freelahub.api.listarPropostas "Executa"
        freelahub.api.enviarProposta -> freelahub.api.proposta "Cria"
        freelahub.api.enviarProposta -> freelahub.api.projetoConsulta "Consulta status e dono do projeto"
        freelahub.api.enviarProposta -> freelahub.api.propostaRepository "Verifica duplicidade e salva"
        freelahub.api.enviarProposta -> freelahub.api.notificationService "Notifica nova proposta"
        freelahub.api.listarPropostas -> freelahub.api.projetoConsulta "Verifica o dono do projeto"
        freelahub.api.listarPropostas -> freelahub.api.propostaRepository "Lista por projeto"
        freelahub.api.postgresPropostaRepository -> freelahub.api.propostaRepository "Implementa"
        freelahub.api.postgresProjetoConsulta -> freelahub.api.projetoConsulta "Implementa"
        freelahub.api.consoleNotification -> freelahub.api.notificationService "Implementa"
        freelahub.api.postgresPropostaRepository -> freelahub.db "Lê e grava propostas" "SQL"
        freelahub.api.postgresProjetoConsulta -> freelahub.db "Lê projetos" "SQL"
        freelahub.api.consoleNotification -> servicoEmail "Simula o envio (mensagem registrada no console)"
    }

    views {
        systemContext freelahub "Contexto" {
            include *
            autolayout lr
            description "Diagrama de Contexto (C4 nível 1) do FreelaHub."
        }

        container freelahub "Containers" {
            include *
            exclude "servicoEmail -> cliente"
            exclude "servicoEmail -> freelancer"
            autolayout lr
            description "Diagrama de Containers (C4 nível 2) do FreelaHub."
        }

        component freelahub.api "Componentes-Propostas" {
            include freelahub.webapp freelahub.db servicoEmail
            include freelahub.api.rotasPropostas freelahub.api.enviarProposta freelahub.api.listarPropostas freelahub.api.proposta
            include freelahub.api.propostaRepository freelahub.api.projetoConsulta freelahub.api.notificationService
            include freelahub.api.postgresPropostaRepository freelahub.api.postgresProjetoConsulta freelahub.api.consoleNotification
            autolayout lr
            description "Diagrama de Componentes (C4 nível 3) da API: fatia de propostas e notificações (RF04 e RF07)."
        }

        styles {
            element "Person" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Externo" {
                background #999999
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Database" {
                shape Cylinder
            }
            element "Browser" {
                shape WebBrowser
            }
            element "Component" {
                background #85bbf0
                color #000000
            }
            element "Domínio" {
                background #f5da81
            }
            element "Caso de uso" {
                background #a9dfbf
            }
            element "Porta" {
                shape Hexagon
            }
            element "Adaptador" {
                background #d7dbdd
            }
        }
    }
}
