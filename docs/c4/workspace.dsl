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
            api = container "API Backend" "Regras de negócio do marketplace, organizada em Arquitetura Hexagonal (domínio + portas + adaptadores)." "Node.js + Express + TypeScript"
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
        }
    }
}
