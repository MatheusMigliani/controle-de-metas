# Fechamento temporario de envios de documentos

## Contexto

O sistema precisa impedir novos envios e alteracoes de documentos ate que uma
trava definitiva possa ser implementada no backend. No momento, nao ha acesso
ao ambiente de producao para configurar variaveis nem disponibilidade para
executar migrations.

Este hotfix atua somente no frontend e reduz alteracoes acidentais feitas pela
interface administrativa. Ele nao e uma barreira de seguranca contra chamadas
diretas a API.

## Objetivo

Fechar temporariamente todos os caminhos da interface que criam, substituem,
devolvem ou excluem arquivos, preservando leitura, historico e conclusao de
fluxos que nao alteram o arquivo existente.

## Comportamento

Uma constante central do frontend, `DOCUMENT_SUBMISSIONS_OPEN`, define se os
envios estao abertos. O hotfix publica essa constante como `false`. Nesse
estado:

- ocultar o botao de novo upload e o input de arquivo correspondente;
- desativar o drag-and-drop de arquivos;
- ocultar a acao de reenvio de documento devolvido;
- ocultar a acao de exclusao de documento;
- remover a opcao de aprovacao que substitui o arquivo por um novo PDF;
- ocultar a acao de devolucao para correcao;
- manter a aprovacao usando o arquivo existente;
- manter a confirmacao final pelo analista;
- manter visualizacao, links do Drive e historico;
- exibir um aviso curto de que os envios estao encerrados.

Os handlers de upload, reenvio, exclusao, devolucao e aprovacao com arquivo
devem validar a constante antes de executar. Assim, estados antigos da tela ou
elementos disparados por teclado nao iniciam a requisicao.

## Estrutura

A constante e uma politica de frontend reutilizavel, fora do componente de
Temas. O componente consome essa politica para derivar permissoes e renderizar
as acoes. Isso evita espalhar valores literais e permite reabrir os envios com
uma alteracao pequena e revisavel.

Nenhum endpoint, contrato da API, tabela ou dado existente sera alterado.

## Erros e comunicacao

Se um handler bloqueado for acionado, a interface informa que os envios estao
encerrados e nao faz requisicao. Falhas das operacoes ainda permitidas continuam
usando o tratamento atual.

O aviso de fechamento aparece na area de documentos sem impedir a consulta dos
arquivos existentes.

## Testes

- teste unitario da politica com envios fechados;
- teste dos controles derivados para garantir que mutacoes de arquivo fiquem
  indisponiveis e aprovacao/confirmacao continuem permitidas;
- suite completa do frontend;
- build de producao;
- verificacao manual no dashboard com perfis relevantes.

## Implantacao e reversao

O hotfix segue em branch separada baseada na `gcp-deploy` mais recente. Nao ha
migration nem mudanca de configuracao de producao.

Para reabrir temporariamente, altera-se a constante e publica-se novo deploy.
Para a solucao definitiva, o backend deve se tornar a autoridade da regra e o
frontend deve apenas refletir o estado retornado pela API.
