# Gotcha Online - Frontend

Aplicação web interativa para o **Gotcha Online**, desenvolvida com **Vite**, **Three.js** e **TailwindCSS**.

---

## 📂 Estrutura Modular (`src/`)

```text
frontend/
├── assets/
│   ├── images/           # Logotipos institucionais (IF Sudeste MG, FAPEMIG)
│   └── favicons/         # Favicon em formato vetorial SVG
├── src/
│   ├── scene/            # Componentes e Motor Gráfico 3D (Three.js)
│   │   ├── shaders.js    # Shaders GLSL customizados (background e folhas)
│   │   ├── treeNodes.js  # Sprites Canvas 2D e nós squircle da árvore
│   │   ├── background.js # Malha de fundo quadriculada animada com ruído
│   │   ├── leafManager.js# Gerenciamento de folhas (chunks), animações e inferência
│   │   └── index.js      # Ponto de entrada da cena Three.js e render loop
│   └── app/              # Regras de Negócio e Comportamento da UI
│       ├── config.js     # Variáveis de ambiente (VITE_BACKEND_URL, VITE_HF_TOKEN)
│       ├── utils.js      # Função utilitária de classificação de risco
│       ├── theme.js      # Gerenciamento de tema escuro/claro e localStorage
│       ├── uploadHandler.js# Eventos de upload e drag-and-drop global
│       ├── apiService.js # Consumo do streaming NDJSON da API via fetch
│       ├── eventProcessor.js# Tratamento dos eventos de análise
│       ├── modals.js     # Modais de rodapé, tabela detalhada e PDF
│       └── main.js       # Ponto de entrada principal da aplicação (bootstrap)
├── index.html            # Estrutura HTML principal da aplicação
├── style.css             # Estilos adicionais e suporte a temas
├── nginx.conf            # Configuração do Nginx para produção
├── Dockerfile            # Containerização da aplicação frontend
├── vite.config.js        # Config do Vite (remove comentários do index.html só no build)
└── package.json          # Configurações do Vite e dependências npm
```

---

## 🧹 Comentários e build de produção

Os módulos em `src/` (JS) e `style.css` já saem sem comentários no `npm run build`, pois o Vite os minifica por padrão. O único arquivo que a minificação padrão não cobre é o próprio `index.html`: o plugin em `vite.config.js` remove os comentários HTML e das linhas `//` dos `<script>` inline dele automaticamente durante o build — o `npm run dev` continua com os comentários normalmente, para facilitar a depuração.

---

## 🚀 Comandos

- **Desenvolvimento**:
  ```bash
  npm run dev
  ```
- **Build de Produção**:
  ```bash
  npm run build
  ```
- **Preview do Build**:
  ```bash
  npm run preview
  ```
