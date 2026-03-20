{
"openapi": "3.0.1",
"info": {
"title": "Controle de Progresso - Plano de Ação API",
"description": "Backend API",
"version": "v1"
},
"paths": {
"/auth/google": {
"post": {
"tags": [
"Auth"
],
"summary": "Autentica um usuário usando o ID Token do Google.",
"description": "O frontend deve obter o `credential` (ID Token) via Google Identity Services\r\ne enviá-lo neste endpoint. O backend valida o token, cria o usuário caso não exista\r\n(com role \u003Cb\u003EPending\u003C/b\u003E), e retorna um JWT válido por 7 dias.\r\n \r\nExemplo de request:\r\n`\r\nPOST /auth/google\r\n{\r\n  \"idToken\": \"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...\"\r\n}\r\n`",
"requestBody": {
"description": "Objeto contendo o ID Token retornado pelo Google.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/GoogleLoginDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/GoogleLoginDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/GoogleLoginDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login realizado com sucesso. Retorna JWT e dados do usuário.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthResponseDtoApiResponse"
}
}
}
},
"401": {
"description": "Token inválido, expirado ou não reconhecido pelo Google.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/auth/refresh": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Gera um novo token JWT para o usuário autenticado.",
        "description": "Útil para atualizar as roles do usuário no frontend sem precisar de um novo login do Google.",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthResponseDtoApiResponse"
}
}
}
},
"401": {
"description": "Unauthorized",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/marcos": {
      "get": {
        "tags": [
          "Marcos"
        ],
        "summary": "Lista todos os marcos temporais ordenados por prazo (mais próximo primeiro).",
        "responses": {
          "200": {
            "description": "Lista retornada com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MarcoDtoIEnumerableApiResponse"
}
}
}
}
}
},
"post": {
"tags": [
"Marcos"
],
"summary": "Cria um novo marco temporal. Requer role Admin.",
"description": "Responsáveis disponíveis: `TCMRio`, `CGMRio`, `SMSRioSaude`.\r\nPode informar um ou mais responsáveis.\r\n \r\nExemplo:\r\n`\r\n{\r\n  \"etapa\": \"Entrega do Relatório Semestral\",\r\n  \"responsaveis\": [\"TCMRio\", \"CGMRio\"],\r\n  \"prazo\": \"2026-06-30T00:00:00\"\r\n}\r\n`",
"requestBody": {
"description": "Dados do marco a ser criado.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/CreateMarcoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateMarcoDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/CreateMarcoDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Marco criado com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MarcoDtoApiResponse"
}
}
}
},
"403": {
"description": "Sem permissão (requer Admin).",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/marcos/{id}": {
      "get": {
        "tags": [
          "Marcos"
        ],
        "summary": "Retorna um marco temporal pelo ID.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do marco.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Marco encontrado.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MarcoDtoApiResponse"
}
}
}
},
"404": {
"description": "Marco não encontrado.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "Marcos"
        ],
        "summary": "Atualiza um marco temporal. Todos os campos são opcionais. Requer role Admin.",
        "description": "Ao enviar `responsaveis`, a lista anterior é completamente substituída.\r\nEnvie `null` para não alterar os responsáveis existentes.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do marco a ser atualizado.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Campos a atualizar.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateMarcoDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/UpdateMarcoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateMarcoDto"
}
}
}
},
"responses": {
"200": {
"description": "Marco atualizado com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/MarcoDtoApiResponse"
                }
              }
            }
          },
          "404": {
            "description": "Marco não encontrado.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
}
}
},
"delete": {
"tags": [
"Marcos"
],
"summary": "Remove um marco temporal. Requer role Admin.",
"parameters": [
{
"name": "id",
"in": "path",
"description": "ID do marco a ser removido.",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "Marco removido com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/metas": {
      "get": {
        "tags": [
          "Metas"
        ],
        "summary": "Lista todas as metas cadastradas.",
        "responses": {
          "200": {
            "description": "Lista retornada com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MetaDtoIEnumerableApiResponse"
}
}
}
}
}
},
"post": {
"tags": [
"Metas"
],
"summary": "Cria uma nova meta vinculada a um tópico. Requer role Analista ou superior.",
"description": "A meta é criada com status \u003Cb\u003ENaoIniciada\u003C/b\u003E por padrão.\r\nUm evento SignalR \u003Cb\u003EStepStatusChanged\u003C/b\u003E é emitido para todos os clientes conectados.",
"requestBody": {
"description": "Dados da meta a ser criada.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/CreateMetaDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateMetaDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/CreateMetaDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Meta criada com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MetaDtoApiResponse"
}
}
}
},
"403": {
"description": "Sem permissão (requer Analista+).",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/metas/{id}": {
      "get": {
        "tags": [
          "Metas"
        ],
        "summary": "Retorna uma meta específica pelo ID.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID da meta.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Meta encontrada.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MetaDtoApiResponse"
}
}
}
},
"404": {
"description": "Meta não encontrada.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Metas"
        ],
        "summary": "Remove uma meta. Requer role Admin.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID da meta a ser removida.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Meta removida com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
},
"403": {
"description": "Sem permissão (requer Admin).",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/metas/{id}/status": {
      "patch": {
        "tags": [
          "Metas"
        ],
        "summary": "Atualiza o status de uma meta. Requer role Analista ou superior.",
        "description": "Status disponíveis: `NaoIniciada`, `EmAndamento`, `PendenteAprovacao`,\r\n`Concluido`, `AguardandoRetorno`.\r\n            \r\nEmite evento SignalR \u003Cb\u003EStepStatusChanged\u003C/b\u003E ao alterar.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID da meta.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Novo status.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateMetaStatusDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/UpdateMetaStatusDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/UpdateMetaStatusDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Status atualizado com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MetaDtoApiResponse"
}
}
}
},
"404": {
"description": "Meta não encontrada.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/metas/{id}/document": {
      "patch": {
        "tags": [
          "Metas"
        ],
        "summary": "Anexa ou atualiza o link do repositório de documentos da meta. Requer role Analista ou superior.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID da meta.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "URL do repositório de documentos.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateMetaDocumentDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/UpdateMetaDocumentDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateMetaDocumentDto"
}
}
}
},
"responses": {
"200": {
"description": "Link atualizado com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/MetaDtoApiResponse"
                }
              }
            }
          },
          "404": {
            "description": "Meta não encontrada.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
}
}
}
},
"/metas/{id}/approve": {
"post": {
"tags": [
"Metas"
],
"summary": "Aprova uma meta, definindo status como `Concluido`. Requer role Aprovador ou Admin.",
"description": "Emite evento SignalR \u003Cb\u003EStepApproved\u003C/b\u003E para todos os clientes conectados.",
"parameters": [
{
"name": "id",
"in": "path",
"description": "ID da meta a ser aprovada.",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"description": "Comentário do aprovador (obrigatório).",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/MetaApprovalDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/MetaApprovalDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/MetaApprovalDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Meta aprovada com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MetaDtoApiResponse"
}
}
}
},
"403": {
"description": "Sem permissão (requer Aprovador+).",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "404": {
            "description": "Meta não encontrada.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
}
}
}
},
"/metas/{id}/return": {
"post": {
"tags": [
"Metas"
],
"summary": "Devolve uma meta para revisão, definindo status como `AguardandoRetorno`. Requer role Aprovador ou Admin.",
"description": "Emite evento SignalR \u003Cb\u003EStepReturned\u003C/b\u003E para todos os clientes conectados.",
"parameters": [
{
"name": "id",
"in": "path",
"description": "ID da meta a ser devolvida.",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"description": "Comentário explicando o motivo da devolução.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/MetaApprovalDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/MetaApprovalDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/MetaApprovalDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Meta devolvida com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MetaDtoApiResponse"
}
}
}
},
"403": {
"description": "Sem permissão (requer Aprovador+).",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "404": {
            "description": "Meta não encontrada.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
}
}
}
},
"/setores": {
"get": {
"tags": [
"Setores"
],
"summary": "Retorna todos os setores cadastrados.",
"responses": {
"200": {
"description": "Lista de setores retornada com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/SetorDtoIEnumerableApiResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Setores"
        ],
        "summary": "Cria um novo setor.",
        "requestBody": {
          "description": "Dados do setor a ser criado.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateSetorDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/CreateSetorDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CreateSetorDto"
}
}
}
},
"responses": {
"201": {
"description": "Setor criado com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/SetorDtoApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/setores/{id}": {
      "get": {
        "tags": [
          "Setores"
        ],
        "summary": "Retorna um setor pelo seu ID.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do setor.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Setor encontrado.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SetorDtoApiResponse"
}
}
}
},
"404": {
"description": "Setor não encontrado.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "Setores"
        ],
        "summary": "Atualiza um setor existente.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do setor a ser atualizado.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Novos dados do setor.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateSetorDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/UpdateSetorDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateSetorDto"
}
}
}
},
"responses": {
"200": {
"description": "Setor atualizado com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/SetorDtoApiResponse"
                }
              }
            }
          },
          "404": {
            "description": "Setor não encontrado.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
}
}
}
},
"/stats/overview": {
"get": {
"tags": [
"Stats"
],
"summary": "Retorna a visão geral das metas: total, percentual concluído e contagem por status.",
"description": "Exemplo de resposta:\r\n`\r\n{\r\n  \"totalMetas\": 42,\r\n  \"percentualConcluidas\": 61.9,\r\n  \"naoIniciadas\": 8,\r\n  \"emAndamento\": 10,\r\n  \"pendentesAprovacao\": 2,\r\n  \"concluidas\": 26,\r\n  \"aguardandoRetorno\": 4\r\n}\r\n`",
"responses": {
"200": {
"description": "Estatísticas retornadas com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/OverviewStatsDtoApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/stats/por-tema": {
      "get": {
        "tags": [
          "Stats"
        ],
        "summary": "Retorna as métricas agrupadas por tema: total de metas, concluídas e percentual de conclusão.",
        "responses": {
          "200": {
            "description": "Estatísticas por tema retornadas com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StatsporTemaDtoIEnumerableApiResponse"
}
}
}
}
}
}
},
"/temas": {
"get": {
"tags": [
"Temas"
],
"summary": "Lista todos os temas com seus tópicos, pontos focais e metas aninhadas.",
"responses": {
"200": {
"description": "Lista retornada com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/TemaDtoIEnumerableApiResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Temas"
        ],
        "summary": "Cria um novo tema. Requer role Admin.",
        "requestBody": {
          "description": "Dados do tema a ser criado.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateTemaDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/CreateTemaDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CreateTemaDto"
}
}
}
},
"responses": {
"201": {
"description": "Tema criado com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/TemaDtoApiResponse"
                }
              }
            }
          },
          "403": {
            "description": "Sem permissão (requer Admin).",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
}
}
}
},
"/temas/{id}": {
"get": {
"tags": [
"Temas"
],
"summary": "Retorna um tema específico com todos os seus tópicos, pontos focais e metas.",
"parameters": [
{
"name": "id",
"in": "path",
"description": "ID do tema.",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "Tema encontrado e retornado com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/TemaDtoApiResponse"
                }
              }
            }
          },
          "404": {
            "description": "Tema não encontrado.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
}
}
},
"patch": {
"tags": [
"Temas"
],
"summary": "Atualiza o nome de um tema. Requer role Admin.",
"parameters": [
{
"name": "id",
"in": "path",
"description": "ID do tema a ser atualizado.",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"description": "Novo nome do tema.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UpdateTemaDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTemaDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/UpdateTemaDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Tema atualizado com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TemaDtoApiResponse"
}
}
}
},
"404": {
"description": "Tema não encontrado.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Temas"
        ],
        "summary": "Remove um tema e todos os seus tópicos e metas (cascade). Requer role Admin.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do tema a ser removido.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Tema removido com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
},
"404": {
"description": "Tema não encontrado.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/topicos": {
      "get": {
        "tags": [
          "Topicos"
        ],
        "summary": "Lista todos os tópicos com pontos focais e metas aninhadas.",
        "responses": {
          "200": {
            "description": "Lista retornada com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TopicoDtoIEnumerableApiResponse"
}
}
}
}
}
},
"post": {
"tags": [
"Topicos"
],
"summary": "Cria um novo tópico com pontos focais. Requer role Admin.",
"description": "Pontos focais são textos livres (nomes de pessoas). Exemplo:\r\n`\r\n{\r\n  \"temaId\": \"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\r\n  \"descricao\": \"Promover medidas que reduzam...\",\r\n  \"setorResponsavel\": \"Secretaria de Licitações\",\r\n  \"pontosFocais\": [\"João Silva\", \"Maria Souza\"]\r\n}\r\n`",
"requestBody": {
"description": "Dados do tópico incluindo pontos focais.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/CreateTopicoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateTopicoDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/CreateTopicoDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Tópico criado com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TopicoDtoApiResponse"
}
}
}
},
"403": {
"description": "Sem permissão (requer Admin).",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/topicos/{id}": {
      "get": {
        "tags": [
          "Topicos"
        ],
        "summary": "Retorna um tópico com setor responsável, pontos focais e metas.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do tópico.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Tópico encontrado com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TopicoDtoApiResponse"
}
}
}
},
"404": {
"description": "Tópico não encontrado.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "Topicos"
        ],
        "summary": "Atualiza descrição, setor responsável e/ou pontos focais de um tópico. Requer role Admin.",
        "description": "Ao enviar `pontosFocais`, a lista anterior é completamente substituída.\r\nEnvie `null` para não alterar os pontos focais existentes.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do tópico a ser atualizado.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Campos a atualizar (todos opcionais).",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTopicoDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/UpdateTopicoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTopicoDto"
}
}
}
},
"responses": {
"200": {
"description": "Tópico atualizado com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/TopicoDtoApiResponse"
                }
              }
            }
          },
          "404": {
            "description": "Tópico não encontrado.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
}
}
},
"delete": {
"tags": [
"Topicos"
],
"summary": "Remove um tópico e todas as suas metas (cascade). Requer role Admin.",
"parameters": [
{
"name": "id",
"in": "path",
"description": "ID do tópico a ser removido.",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "Tópico removido com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/users/me": {
      "get": {
        "tags": [
          "Users"
        ],
        "summary": "Retorna os dados do usuário autenticado.",
        "description": "Extrai o ID do usuário a partir do JWT e retorna seus dados completos.\r\nÚtil para o frontend carregar o perfil após o login.",
        "responses": {
          "200": {
            "description": "Dados do usuário retornados com sucesso.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserDtoApiResponse"
}
}
}
},
"401": {
"description": "Token JWT ausente ou inválido.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          },
          "404": {
            "description": "Usuário não encontrado no banco de dados.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ObjectApiResponse"
}
}
}
}
}
}
},
"/users": {
"get": {
"tags": [
"Users"
],
"summary": "Lista todos os usuários cadastrados. Requer role Admin.",
"responses": {
"200": {
"description": "Lista retornada com sucesso.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UserDtoIEnumerableApiResponse"
                }
              }
            }
          },
          "401": {
            "description": "Não autenticado.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"403": {
"description": "Sem permissão (requer Admin).",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/users/{id}/role": {
      "patch": {
        "tags": [
          "Users"
        ],
        "summary": "Atualiza a role de um usuário. Requer role Admin.",
        "description": "Após a atualização, o sistema notifica o usuário em tempo real via SignalR\r\n(evento \u003Cb\u003EUserRoleChanged\u003C/b\u003E no hub `/hubs/role`).\r\n            \r\nRoles disponíveis: `Pending`, `Visualizador`, `Analista`, `Aprovador`, `Admin`",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do usuário a ser atualizado.",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Nova role a ser atribuída.",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateRoleDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/UpdateRoleDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateRoleDto"
}
}
}
},
"responses": {
"200": {
"description": "Role atualizada com sucesso. Notificação SignalR enviada.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UserDtoApiResponse"
                }
              }
            }
          },
          "403": {
            "description": "Sem permissão (requer Admin).",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"404": {
"description": "Usuário não encontrado.",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ObjectApiResponse"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "AuthResponseDto": {
        "type": "object",
        "properties": {
          "token": {
            "type": "string",
            "description": "JWT válido por 7 dias. Use como Bearer token em todas as requisições.",
            "nullable": true
          },
          "userId": {
            "type": "string",
            "description": "ID interno do usuário no sistema.",
            "nullable": true
          },
          "name": {
            "type": "string",
            "description": "Nome completo do usuário (retornado pelo Google).",
            "nullable": true
          },
          "email": {
            "type": "string",
            "description": "E-mail do usuário (retornado pelo Google).",
            "nullable": true
          },
          "picture": {
            "type": "string",
            "description": "URL da foto de perfil do Google (pode ser null).",
            "nullable": true
          },
          "role": {
            "type": "string",
            "description": "Role atual do usuário: Pending | Visualizador | Analista | Aprovador | Admin.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Resposta do login bem-sucedido."
      },
      "AuthResponseDtoApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "$ref": "#/components/schemas/AuthResponseDto"
},
"error": {
"type": "string",
"description": "Mensagem de erro. Null em caso de sucesso.",
"nullable": true
}
},
"additionalProperties": false,
"description": "Envelope padrão de todas as respostas da API."
},
"CreateMarcoDto": {
"type": "object",
"properties": {
"etapa": {
"type": "string",
"description": "Nome da etapa do marco.",
"nullable": true
},
"responsaveis": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ResponsavelMarco"
            },
            "description": "Um ou mais responsáveis: TCMRio, CGMRio, SMSRioSaude.",
            "nullable": true
          },
          "prazo": {
            "type": "string",
            "description": "Data final do prazo.",
            "format": "date-time"
          }
        },
        "additionalProperties": false,
        "description": "Payload para criação de um Marco Temporal."
      },
      "CreateMetaDto": {
        "type": "object",
        "properties": {
          "topicoId": {
            "type": "string",
            "description": "ID do Tópico ao qual a meta será vinculada.",
            "format": "uuid"
          },
          "descricao": {
            "type": "string",
            "description": "Descrição da meta.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para criação de uma Meta."
      },
      "CreateSetorDto": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "description": "Nome do setor.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para criação de um Setor."
      },
      "CreateTemaDto": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "description": "Nome do tema. Ex: \"Gestão das Contratações (Estratégico)\".",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para criação de um novo Tema."
      },
      "CreateTopicoDto": {
        "type": "object",
        "properties": {
          "temaId": {
            "type": "string",
            "description": "ID do Tema ao qual este tópico será vinculado.",
            "format": "uuid"
          },
          "descricao": {
            "type": "string",
            "description": "Descrição do tópico.",
            "nullable": true
          },
          "setorResponsavel": {
            "type": "string",
            "description": "Setor ou órgão responsável.",
            "nullable": true
          },
          "pontosFocais": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Lista de nomes dos pontos focais (texto livre). Mínimo 1.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para criação de um Tópico."
      },
      "GoogleLoginDto": {
        "type": "object",
        "properties": {
          "idToken": {
            "type": "string",
            "description": "ID Token retornado pelo Google Identity Services (campo `credential`).",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para autenticação via Google."
      },
      "MarcoDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID do marco.",
            "format": "uuid"
          },
          "etapa": {
            "type": "string",
            "description": "Nome da etapa do marco.",
            "nullable": true
          },
          "responsaveis": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Lista de responsáveis: TCMRio, CGMRio, SMSRioSaude.",
            "nullable": true
          },
          "prazo": {
            "type": "string",
            "description": "Data final do prazo.",
            "format": "date-time"
          },
          "createdAt": {
            "type": "string",
            "description": "Data de criação do marco.",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "description": "Data da última atualização do marco.",
            "format": "date-time"
          }
        },
        "additionalProperties": false,
        "description": "Representação de um Marco Temporal."
      },
      "MarcoDtoApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "$ref": "#/components/schemas/MarcoDto"
},
"error": {
"type": "string",
"description": "Mensagem de erro. Null em caso de sucesso.",
"nullable": true
}
},
"additionalProperties": false,
"description": "Envelope padrão de todas as respostas da API."
},
"MarcoDtoIEnumerableApiResponse": {
"type": "object",
"properties": {
"success": {
"type": "boolean",
"description": "Indica se a operação foi bem-sucedida."
},
"data": {
"type": "array",
"items": {
"$ref": "#/components/schemas/MarcoDto"
            },
            "description": "Payload da resposta. Null em caso de erro.",
            "nullable": true
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "MetaApprovalDto": {
        "type": "object",
        "properties": {
          "comment": {
            "type": "string",
            "description": "Comentário do aprovador. Obrigatório tanto na aprovação quanto na devolução.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para aprovar ou devolver uma Meta."
      },
      "MetaDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID da meta.",
            "format": "uuid"
          },
          "topicoId": {
            "type": "string",
            "description": "ID do Tópico ao qual esta meta pertence.",
            "format": "uuid"
          },
          "descricao": {
            "type": "string",
            "description": "Descrição da meta.",
            "nullable": true
          },
          "status": {
            "type": "string",
            "description": "Status atual: NaoIniciada | EmAndamento | PendenteAprovacao | Concluido | AguardandoRetorno.",
            "nullable": true
          },
          "documentUrl": {
            "type": "string",
            "description": "URL do repositório de documentos (opcional).",
            "nullable": true
          },
          "approverComment": {
            "type": "string",
            "description": "Comentário do aprovador na última aprovação/devolução (opcional).",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "description": "Data de criação da meta.",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "description": "Data da última atualização da meta.",
            "format": "date-time"
          }
        },
        "additionalProperties": false,
        "description": "Representação de uma Meta."
      },
      "MetaDtoApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "$ref": "#/components/schemas/MetaDto"
},
"error": {
"type": "string",
"description": "Mensagem de erro. Null em caso de sucesso.",
"nullable": true
}
},
"additionalProperties": false,
"description": "Envelope padrão de todas as respostas da API."
},
"MetaDtoIEnumerableApiResponse": {
"type": "object",
"properties": {
"success": {
"type": "boolean",
"description": "Indica se a operação foi bem-sucedida."
},
"data": {
"type": "array",
"items": {
"$ref": "#/components/schemas/MetaDto"
            },
            "description": "Payload da resposta. Null em caso de erro.",
            "nullable": true
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "MetaStatus": {
        "enum": [0, 1, 2, 3, 4],
        "type": "integer",
        "format": "int32"
      },
      "ObjectApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "description": "Payload da resposta. Null em caso de erro.",
            "nullable": true
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "OverviewStatsDto": {
        "type": "object",
        "properties": {
          "totalMetas": {
            "type": "integer",
            "description": "Total de metas cadastradas.",
            "format": "int32"
          },
          "percentualConcluidas": {
            "type": "number",
            "description": "Percentual de metas com status Concluido (0-100).",
            "format": "double"
          },
          "naoIniciadas": {
            "type": "integer",
            "description": "Quantidade de metas com status NaoIniciada.",
            "format": "int32"
          },
          "emAndamento": {
            "type": "integer",
            "description": "Quantidade de metas com status EmAndamento.",
            "format": "int32"
          },
          "pendentesAprovacao": {
            "type": "integer",
            "description": "Quantidade de metas com status PendenteAprovacao.",
            "format": "int32"
          },
          "concluidas": {
            "type": "integer",
            "description": "Quantidade de metas com status Concluido.",
            "format": "int32"
          },
          "aguardandoRetorno": {
            "type": "integer",
            "description": "Quantidade de metas com status AguardandoRetorno.",
            "format": "int32"
          }
        },
        "additionalProperties": false,
        "description": "Visão geral das métricas de todas as metas do sistema."
      },
      "OverviewStatsDtoApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "$ref": "#/components/schemas/OverviewStatsDto"
},
"error": {
"type": "string",
"description": "Mensagem de erro. Null em caso de sucesso.",
"nullable": true
}
},
"additionalProperties": false,
"description": "Envelope padrão de todas as respostas da API."
},
"ProblemDetails": {
"type": "object",
"properties": {
"type": {
"type": "string",
"nullable": true
},
"title": {
"type": "string",
"nullable": true
},
"status": {
"type": "integer",
"format": "int32",
"nullable": true
},
"detail": {
"type": "string",
"nullable": true
},
"instance": {
"type": "string",
"nullable": true
}
},
"additionalProperties": {

        }
      },
      "ResponsavelMarco": {
        "enum": [0, 1, 2],
        "type": "integer",
        "format": "int32"
      },
      "SetorDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID do setor.",
            "format": "uuid"
          },
          "nome": {
            "type": "string",
            "description": "Nome do setor.",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "description": "Data de criação do setor.",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "description": "Data da última atualização do setor.",
            "format": "date-time"
          }
        },
        "additionalProperties": false,
        "description": "Representação de um Setor."
      },
      "SetorDtoApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "$ref": "#/components/schemas/SetorDto"
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "SetorDtoIEnumerableApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/SetorDto"
            },
            "description": "Payload da resposta. Null em caso de erro.",
            "nullable": true
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "StatsporTemaDto": {
        "type": "object",
        "properties": {
          "temaId": {
            "type": "string",
            "description": "ID do tema.",
            "format": "uuid"
          },
          "temaName": {
            "type": "string",
            "description": "Nome do tema.",
            "nullable": true
          },
          "totalMetas": {
            "type": "integer",
            "description": "Total de metas no tema.",
            "format": "int32"
          },
          "concluidas": {
            "type": "integer",
            "description": "Quantidade de metas concluídas no tema.",
            "format": "int32"
          },
          "percentualConcluidas": {
            "type": "number",
            "description": "Percentual de metas concluídas no tema (0-100).",
            "format": "double"
          }
        },
        "additionalProperties": false,
        "description": "Métricas de conclusão de metas agrupadas por Tema."
      },
      "StatsporTemaDtoIEnumerableApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/StatsporTemaDto"
            },
            "description": "Payload da resposta. Null em caso de erro.",
            "nullable": true
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "TemaDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID do tema.",
            "format": "uuid"
          },
          "nome": {
            "type": "string",
            "description": "Nome do tema, ex: \"Gestão das Contratações (Estratégico)\".",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "description": "Data de criação.",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "description": "Data da última atualização.",
            "format": "date-time"
          },
          "topicos": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TopicoDto"
            },
            "description": "Tópicos vinculados a este tema.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Representação completa de um Tema com tópicos e metas aninhados."
      },
      "TemaDtoApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "$ref": "#/components/schemas/TemaDto"
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "TemaDtoIEnumerableApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TemaDto"
            },
            "description": "Payload da resposta. Null em caso de erro.",
            "nullable": true
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "TopicoDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID do tópico.",
            "format": "uuid"
          },
          "temaId": {
            "type": "string",
            "description": "ID do Tema ao qual este tópico pertence.",
            "format": "uuid"
          },
          "descricao": {
            "type": "string",
            "description": "Descrição do tópico.",
            "nullable": true
          },
          "setorResponsavel": {
            "type": "string",
            "description": "Setor ou órgão responsável pelo tópico.",
            "nullable": true
          },
          "pontosFocais": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Lista de nomes dos pontos focais (texto livre, um ou mais).",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "description": "Data de criação.",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "description": "Data de atualização.",
            "format": "date-time"
          },
          "metas": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/MetaDto"
            },
            "description": "Metas vinculadas a este tópico.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Representação completa de um Tópico com pontos focais e metas."
      },
      "TopicoDtoApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "$ref": "#/components/schemas/TopicoDto"
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "TopicoDtoIEnumerableApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/TopicoDto"
            },
            "description": "Payload da resposta. Null em caso de erro.",
            "nullable": true
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "UpdateMarcoDto": {
        "type": "object",
        "properties": {
          "etapa": {
            "type": "string",
            "description": "Novo nome da etapa (opcional).",
            "nullable": true
          },
          "responsaveis": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ResponsavelMarco"
            },
            "description": "Nova lista de responsáveis — substitui a anterior (opcional).",
            "nullable": true
          },
          "prazo": {
            "type": "string",
            "description": "Nova data de prazo (opcional).",
            "format": "date-time",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para atualização de um Marco Temporal. Todos os campos são opcionais."
      },
      "UpdateMetaDocumentDto": {
        "type": "object",
        "properties": {
          "documentUrl": {
            "type": "string",
            "description": "URL do repositório de documentos (ex: link do SharePoint, Google Drive, etc.).",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para atualizar o link do repositório de documentos."
      },
      "UpdateMetaStatusDto": {
        "type": "object",
        "properties": {
          "status": {
            "$ref": "#/components/schemas/MetaStatus"
          }
        },
        "additionalProperties": false,
        "description": "Payload para atualização de status de uma Meta."
      },
      "UpdateRoleDto": {
        "type": "object",
        "properties": {
          "role": {
            "$ref": "#/components/schemas/UserRole"
          }
        },
        "additionalProperties": false,
        "description": "Payload para atualização de role de um usuário."
      },
      "UpdateSetorDto": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "description": "Novo nome do setor.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para atualização de um Setor."
      },
      "UpdateTemaDto": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "description": "Novo nome do tema.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para atualização do nome de um Tema."
      },
      "UpdateTopicoDto": {
        "type": "object",
        "properties": {
          "descricao": {
            "type": "string",
            "description": "Nova descrição (opcional).",
            "nullable": true
          },
          "setorResponsavel": {
            "type": "string",
            "description": "Novo setor responsável (opcional).",
            "nullable": true
          },
          "pontosFocais": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Nova lista completa de pontos focais. Se informada, substitui a anterior. Se null, mantém a atual.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Payload para atualização parcial de um Tópico."
      },
      "UserDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID interno do usuário.",
            "format": "uuid"
          },
          "name": {
            "type": "string",
            "description": "Nome completo.",
            "nullable": true
          },
          "email": {
            "type": "string",
            "description": "E-mail.",
            "nullable": true
          },
          "picture": {
            "type": "string",
            "description": "URL da foto de perfil.",
            "nullable": true
          },
          "role": {
            "type": "string",
            "description": "Role atual: Pending | Visualizador | Analista | Aprovador | Admin.",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "description": "Data de criação do usuário.",
            "format": "date-time"
          }
        },
        "additionalProperties": false,
        "description": "Dados públicos de um usuário."
      },
      "UserDtoApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "$ref": "#/components/schemas/UserDto"
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "UserDtoIEnumerableApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "Indica se a operação foi bem-sucedida."
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/UserDto"
            },
            "description": "Payload da resposta. Null em caso de erro.",
            "nullable": true
          },
          "error": {
            "type": "string",
            "description": "Mensagem de erro. Null em caso de sucesso.",
            "nullable": true
          }
        },
        "additionalProperties": false,
        "description": "Envelope padrão de todas as respostas da API."
      },
      "UserRole": {
        "enum": [0, 1, 2, 3, 4],
        "type": "integer",
        "format": "int32"
      }
    },
    "securitySchemes": {
      "Bearer": {
        "type": "http",
        "description": "JWT Authorization header. Example: 'Bearer {token}'",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }

},
"security": [
{
"Bearer": []
}
]
}
