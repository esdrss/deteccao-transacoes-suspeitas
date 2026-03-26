🕵️‍♂️ Sistema de Detecção de Transações Suspeitas

Bem-vindo ao Sistema de Detecção de Transações Suspeitas! Este projeto foi desenvolvido para analisar bases de dados financeiras (arquivos CSV e Excel) e identificar anomalias e possíveis fraudes utilizando métodos estatísticos rigorosos.

Ele foi projetado com foco em Matemática Computacional Aplicada a Big Data, suportando a leitura de arquivos massivos através de processamento em lotes (streaming) e garantindo alta performance no lado do cliente e do servidor.
✨ Principais Funcionalidades

    Múltiplos Métodos Estatísticos: Escolha a abordagem ideal para a sua base de dados:

        Sigma (Regra Empírica): Rápido e performático para dados que seguem uma distribuição normal.

        Z-score: Mede o desvio padrão de cada dado em relação à média.

        IQR (Intervalo Interquartil): Foca nos 50% centrais dos dados, evitando que fraudes extremas distorçam a linha de corte.

        MAD (Desvio Absoluto da Mediana): A métrica com maior resiliência estatística contra valores atípicos.

    Otimização para Big Data (Streaming): Utiliza o Algoritmo de Welford para calcular média e variância em uma única passagem (espaço O(1)), evitando estouro de memória em arquivos CSV gigantes.

    Filtragem Vetorizada: Aplica Álgebra Booleana para separar as anomalias em blocos, otimizando o tempo de execução.

    Visualização Gráfica Dinâmica: Gráficos interativos renderizados via Canvas (Chart.js), com restrição de cardinalidade (Downsampling) para não travar o navegador.

    Interface Acessível e Moderna: Suporte a Tema Claro/Escuro e internacionalização nativa (Português, Inglês e Espanhol).

🛠️ Tecnologias Utilizadas

    Backend: Python 3, FastAPI, Uvicorn, Pandas (processamento de dados e matemática computacional).

    Frontend: HTML5, CSS3, JavaScript Vanilla, Chart.js.

    Armazenamento: Sistema de arquivos local (arquivos brutos salvos com UUID e metadados em JSON).

🚀 Como executar o projeto no seu computador

Siga os passos abaixo para configurar o ambiente e rodar a aplicação localmente.
1. Pré-requisitos

Você precisará ter instalado no seu computador:

    Python 3.8+ (Recomendado adicionar ao PATH durante a instalação).

    Um editor de código, como o VS Code.

2. Configurando o Ambiente

Abra o terminal (ou o terminal integrado do VS Code) na pasta onde você salvou os arquivos do projeto e siga estes passos:

Crie um ambiente virtual (recomendado para isolar as dependências):
Bash

python -m venv venv

Ative o ambiente virtual:

    No Windows:
    Bash

    .\venv\Scripts\activate

    No Mac/Linux:
    Bash

    source venv/bin/activate

Instale as bibliotecas necessárias:
O projeto depende de algumas bibliotecas fundamentais para a API e processamento de dados. Instale-as executando:
Bash

pip install fastapi uvicorn pandas openpyxl xlrd python-multipart

(Nota: openpyxl e xlrd são necessários para o Pandas conseguir ler arquivos Excel modernos e antigos, e o python-multipart é usado pelo FastAPI para receber os arquivos via upload).
3. Rodando o Servidor

Com tudo instalado e o ambiente virtual ativo, basta rodar o arquivo principal:
Bash

python main.py

Você verá no terminal uma mensagem indicando que o servidor iniciou (algo como Uvicorn running on http://127.0.0.1:8000).
4. Acessando a Interface

Abra o seu navegador favorito e acesse:
👉 http://127.0.0.1:8000
💡 Como usar a ferramenta

    Envie um arquivo: Na seção "Enviar Arquivo", faça o upload da sua base de dados (CSV ou Excel). O sistema procurará automaticamente por uma coluna chamada valor (você pode alterar isso nas configurações).

    Ajuste os Parâmetros: Na seção de "Configuração da Análise", escolha o método estatístico desejado (ex: Z-score, MAD) e a sensibilidade (k).

    Big Data: Se o seu arquivo CSV for muito grande, ative a opção Leitura em Lotes (CSV) para usar a engine de streaming.

    Analise e Visualize: Na tabela de bases de dados, clique em Analisar. Ao final, você poderá ver as transações suspeitas destacadas na tabela e explorá-las no Gráfico de Tendência.

👥 Créditos

Desenvolvido com dedicação por:

    Débora Ribeiro, Esdras Vitor, Tiago Lucas

    Esdras Vitor

    Tiago Lucas
