# Usa uma imagem oficial do Python levinha
FROM python:3.10-slim

# Define a pasta de trabalho dentro do container
WORKDIR /app

# Copia o requirements e instala as bibliotecas
COPY requirements.txt .
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# ADICIONE ESTA LINHA: Baixa os tokenizadores de sentença do NLTK
RUN python -m nltk.downloader punkt

# Baixa os modelos GPT-2 da Hugging Face durante o build para embuti-los na imagem (evitando download em runtime offline)
RUN python -c "from transformers import GPT2Tokenizer, GPT2LMHeadModel; GPT2Tokenizer.from_pretrained('gpt2'); GPT2LMHeadModel.from_pretrained('gpt2')"

# Copia o resto do seu código (app.py, modelos treinados, etc)
COPY . .

# Cria a pasta temporária e dá permissão de escrita
RUN mkdir -p /tmp/uploads && chmod 777 /tmp/uploads

# Expõe a porta obrigatória do Hugging Face
EXPOSE 7860

# Comando para iniciar a sua API
# Gunicorn com 1 worker + 4 threads: o gargalo é CPU-bound num único modelo,
# então múltiplos workers apenas duplicariam GPT-2/ExtraTrees na RAM (risco de OOM
# em ambientes com memória limitada, como o free tier do HF Spaces).
CMD ["gunicorn", "--workers", "1", "--threads", "4", "--timeout", "300", "--bind", "0.0.0.0:7860", "app:app"]