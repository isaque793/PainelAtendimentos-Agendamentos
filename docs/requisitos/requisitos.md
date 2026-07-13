# Requisitos Funcionais

## RF01 - Registro do cidadão

O sistema deverá permitir o cadastro de cidadãos e servidores, identificando cada registro por CPF ou MASP. É obrigatório que pelo menos um dos identificadores seja informado. O sistema deverá impedir o cadastro quando ambos estiverem ausentes ou quando houver duplicidade do identificador informado.

-----------------------------------------------------------------------------------------------------------------------

## RF02 - Tipo de atendimento

O sistema deve permitir que o cidadão escolha entre:

- Atendimento imediato
- Atendimento agendado

------------------------------------------------------------------------------------------------------------------------

## RF03 - Lista de serviços

O sistema deve exibir os serviços disponíveis para atendimento.

Os serviços deverão ser carregados do banco de dados.

------------------------------------------------------------------------------------------------------------------------

## RF04 - Geração de senha

Após a identificação e escolha do serviço, o sistema deverá gerar automaticamente uma senha sequencial.

Formato:

A001
A002
A003
...

O prefixo poderá variar conforme o serviço.

-------------------------------------------------------------------------------------------------------------------

## RF05 - Exibição da senha

Após a geração, a senha deverá ser apresentada ao cidadão para anotação.

---------------------------------------------------------------------------------------------------------------------

## RF06 - Reset automático

A tela deverá retornar automaticamente para a tela inicial após um período configurável de inatividade.

Tempo sugerido:

60 segundos.

------------------------------------------------------------------------------------------------------------------

## RF07 - Cancelamento

O sistema deverá permitir cancelar uma senha antes do atendimento.

O cancelamento poderá ser realizado pelo cidadão ou pelo atendente.