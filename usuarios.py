from flask import Blueprint, request, jsonify
from database_config import executar_query_fetchall, executar_query_commit

usuarios_bp = Blueprint('usuarios', __name__)

def validar_pontos(pontos):
    try:
        pontos_int = int(pontos)
        if pontos_int <= 0:
            return None, "O valor de pontos deve ser maior que 0"
        if pontos_int % 2 != 0:
            return None, "Não aceita número ímpar, apenas par"
        return pontos_int, None
    except:
        return None, "Por favor, insira um valor válido"

@usuarios_bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    usuarios = executar_query_fetchall("SELECT id, nome, pontos, whatsapp FROM usuarios")
    if not usuarios:
        return jsonify([])
    
    usuarios_list = []
    for u in usuarios:
        usuarios_list.append({
            'id': u[0],
            'nome': u[1],
            'pontos': u[2],
            'whatsapp': u[3] if u[3] else "Não cadastrado"
        })
    
    return jsonify(usuarios_list)

@usuarios_bp.route('/usuarios', methods=['POST'])
def cadastrar_usuario():
    data = request.get_json()
    nome = data.get('nome')
    senha = data.get('senha')
    pontos = data.get('pontos')
    whatsapp = data.get('whatsapp', 'Não cadastrado')
    
    if not nome or not senha or not pontos:
        return jsonify({'error': 'Nome, senha e pontos são obrigatórios'}), 400
    
    # Verificar se usuário já existe
    existe = executar_query_fetchall("SELECT id FROM usuarios WHERE nome = %s", (nome,))
    if existe:
        return jsonify({'error': 'Usuário já existe'}), 400
    
    # Validar pontos
    pontos_validos, erro = validar_pontos(pontos)
    if pontos_validos is None:
        return jsonify({'error': erro}), 400
    
    # Cadastrar usuário
    sucesso = executar_query_commit(
        "INSERT INTO usuarios (nome, senha, pontos, whatsapp) VALUES (%s, %s, %s, %s)",
        (nome, senha, pontos_validos, whatsapp)
    )
    
    if sucesso:
        return jsonify({'message': f'Usuário {nome} cadastrado com sucesso'})
    else:
        return jsonify({'error': 'Erro ao cadastrar usuário'}), 500

@usuarios_bp.route('/usuarios/<int:id_usuario>/senha', methods=['PUT'])
def alterar_senha_usuario(id_usuario):
    data = request.get_json()
    nova_senha = data.get('nova_senha')
    
    if not nova_senha:
        return jsonify({'error': 'Nova senha é obrigatória'}), 400
    
    sucesso = executar_query_commit(
        "UPDATE usuarios SET senha = %s WHERE id = %s",
        (nova_senha, id_usuario)
    )
    
    if sucesso:
        return jsonify({'message': 'Senha alterada com sucesso'})
    else:
        return jsonify({'error': 'Erro ao alterar senha'}), 500

@usuarios_bp.route('/usuarios/<int:id_usuario>/pontos', methods=['PUT'])
def atualizar_pontos_usuario(id_usuario):
    data = request.get_json()
    novos_pontos = data.get('pontos')
    
    if not novos_pontos:
        return jsonify({'error': 'Pontos são obrigatórios'}), 400
    
    pontos_validos, erro = validar_pontos(novos_pontos)
    if pontos_validos is None:
        return jsonify({'error': erro}), 400
    
    sucesso = executar_query_commit(
        "UPDATE usuarios SET pontos = %s WHERE id = %s",
        (pontos_validos, id_usuario)
    )
    
    if sucesso:
        return jsonify({'message': 'Pontos atualizados com sucesso'})
    else:
        return jsonify({'error': 'Erro ao atualizar pontos'}), 500

@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['DELETE'])
def remover_usuario(id_usuario):
    # Verificar se usuário existe
    existe = executar_query_fetchall("SELECT * FROM usuarios WHERE id = %s", (id_usuario,))
    if not existe:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    sucesso = executar_query_commit("DELETE FROM usuarios WHERE id = %s", (id_usuario,))
    
    if sucesso:
        return jsonify({'message': f'Usuário {id_usuario} removido com sucesso'})
    else:
        return jsonify({'error': 'Erro ao remover usuário'}), 500

@usuarios_bp.route('/usuarios/<int:id_usuario>/saldo', methods=['GET'])
def buscar_saldo_usuario(id_usuario):
    result = executar_query_fetchall("SELECT pontos FROM usuarios WHERE id = %s", (id_usuario,))
    if result:
        return jsonify({'saldo': result[0][0]})
    return jsonify({'error': 'Usuário não encontrado'}), 404

