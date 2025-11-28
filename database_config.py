import pg8000
from datetime import datetime, timezone

DB_CONFIG = {
    "database": "neondb",
    "user": "neondb_owner",
    "password": "npg_bVuGgN83hLrp",
    "host": "ep-aged-tooth-a5g5dkoi-pooler.us-east-2.aws.neon.tech",
    "port": 5432
}

def conectar_banco_remoto():
    try:
        return pg8000.connect(**DB_CONFIG)
    except Exception as e:
        print(f"Erro ao conectar ao banco: {e}")
        return None

def executar_query_fetchall(query, params=()):
    conn = conectar_banco_remoto()
    if not conn:
        return None
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        result = cursor.fetchall()
        return result
    except Exception as e:
        print(f"Erro na query: {e}")
        return None
    finally:
        conn.close()

def executar_query_commit(query, params=()):
    conn = conectar_banco_remoto()
    if not conn:
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro na query: {e}")
        return False
    finally:
        conn.close()

def criar_tabelas_remoto():
    queries = [
        '''
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL,
            pontos INT NOT NULL,
            whatsapp VARCHAR(255),
            last_seen TIMESTAMP
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS salas (
            id_sala SERIAL PRIMARY KEY,
            nome_sala VARCHAR(255) NOT NULL,
            valor_inicial INT NOT NULL,
            criador VARCHAR(255) NOT NULL,
            jogadores TEXT,
            whatsapp TEXT
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS apostas (
            id SERIAL PRIMARY KEY,
            id_sala INT NOT NULL,
            id_usuario INT NOT NULL,
            valor_aposta INT NOT NULL,
            status VARCHAR(255) DEFAULT 'pendente',
            resultado VARCHAR(255) DEFAULT 'pendente',
            FOREIGN KEY(id_sala) REFERENCES salas(id_sala),
            FOREIGN KEY(id_usuario) REFERENCES usuarios(id)
        )
        '''
    ]
    for q in queries:
        executar_query_commit(q)

def atualizar_atividade_usuario(id_usuario):
    executar_query_commit(
        "UPDATE usuarios SET last_seen = %s WHERE id = %s",
        (datetime.now(timezone.utc), id_usuario)
    )


def listar_usuarios_online(minutos=5):
    from datetime import timedelta
    limite = datetime.now(timezone.utc) - timedelta(minutes=minutos)
    result = executar_query_fetchall(
        "SELECT nome, last_seen FROM usuarios WHERE last_seen >= %s ORDER BY last_seen DESC",
        (limite,)
    )
    if not result:
        return []
    
    usuarios_online = []
    for nome, last_seen in result:
        if last_seen:
            # Converter para horário local (UTC-3 para Brasil)
            last_seen_local = last_seen - timedelta(hours=3)
            usuarios_online.append({
                'nome': nome,
                'last_seen': last_seen_local.strftime('%H:%M:%S')
            })
    
    return usuarios_online

