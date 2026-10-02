# Estágio 1: Compilar o Frontend com Node
FROM node:20-slim AS builder
WORKDIR /app

# Copia os arquivos de pacotes e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código e gera o build de produção
COPY . .

# URL do backend e (opcional) token de autorização, injetados no bundle em
# tempo de build (Vite só expõe env vars prefixadas com VITE_). Passe via
# --build-arg ou docker-compose (variáveis no ambiente/.env da raiz).
# Self-host (campus): VITE_BACKEND_URL=/api/processar, sem VITE_HF_TOKEN.
# Demo público (HF Space): VITE_BACKEND_URL=https://<space>.hf.space/processar + VITE_HF_TOKEN.
ARG VITE_BACKEND_URL
ARG VITE_HF_TOKEN
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_HF_TOKEN=$VITE_HF_TOKEN

RUN npm run build

# Estágio 2: Servidor Web Nginx de produção
FROM nginx:alpine
# Copia os arquivos gerados pela compilação do Vite
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia o arquivo de configuração customizado do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
