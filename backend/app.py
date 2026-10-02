"""API Flask do Gotcha Online.

Expõe a rota de upload (`/processar`) que recebe um PDF/DOCX, delega a
extração de texto e o cálculo das métricas a `processamento.py` e devolve o
resultado ao frontend em streaming NDJSON (uma linha JSON por evento), para
que a animação 3D possa reagir a cada chunk processado em tempo real.
"""

import os
import json
import uuid
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename

from processamento import analisar_arquivo_stream

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '/tmp/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/', methods=['GET'])
def health_check():
    """Endpoint simples de health-check para verificar se a API está no ar."""
    return "Gotcha Online API está rodando!"


@app.route('/processar', methods=['POST'])
def processar_upload():
    """Recebe o arquivo enviado, salva com nome único e transmite o resultado.

    O arquivo chega no campo `file` do multipart/form-data. Ele é salvo em
    `UPLOAD_FOLDER` com um nome gerado via UUID (evitando colisão entre
    uploads concorrentes) e processado por `analisar_arquivo_stream`, cujos
    eventos NDJSON são repassados diretamente na resposta HTTP.

    Returns:
        flask.Response: Stream `application/x-ndjson` com um objeto JSON por
        linha (eventos de progresso, métricas por chunk e resultado final),
        ou um JSON de erro com status 400 se nenhum arquivo válido for enviado.
    """
    if 'file' not in request.files:
        return jsonify({"erro": "Nenhum arquivo enviado"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"erro": "Nenhum arquivo selecionado"}), 400

    # Nome único por requisição: evita que uploads concorrentes com o mesmo
    # nome de arquivo colidam (um sobrescrevendo/apagando o do outro em processamento).
    extensao_original = os.path.splitext(secure_filename(file.filename))[1]
    filename = f"{uuid.uuid4().hex}{extensao_original}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    def gerar_resposta():
        """Gerador que repassa os eventos NDJSON e limpa o arquivo temporário ao final."""
        try:
            for linha in analisar_arquivo_stream(filepath):
                yield linha

            if os.path.exists(filepath):
                os.remove(filepath)

        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            yield json.dumps({"erro": f"Falha no processamento: {str(e)}"}) + "\n"

    return Response(gerar_resposta(), mimetype='application/x-ndjson')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860)