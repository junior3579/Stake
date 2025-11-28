import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from database_config import criar_tabelas_remoto
from socketio_instance import init_socketio
from routes.auth import auth_bp
from routes.usuarios import usuarios_bp
from routes.salas import salas_bp
from routes.apostas import apostas_bp
from routes.online import online_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
socketio = init_socketio(app)

# Habilitar CORS
CORS(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(usuarios_bp, url_prefix='/api')
app.register_blueprint(salas_bp, url_prefix="/api")
app.register_blueprint(apostas_bp, url_prefix="/api")
app.register_blueprint(online_bp, url_prefix="/api")

# Criar tabelas no banco de dados
with app.app_context():
    criar_tabelas_remoto()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    # Porta obrigatória no Render
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)