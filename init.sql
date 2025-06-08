\c sistema_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    idade INTEGER CHECK (idade >= 0 AND idade <= 150),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, email, idade) VALUES
    ('João Silva', 'joao@email.com', 25),
    ('Maria Santos', 'maria@email.com', 30),
    ('Pedro Oliveira', 'pedro@email.com', 22),
    ('Ana Costa', 'ana@email.com', 28)
ON CONFLICT (email) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_nome ON usuarios(nome);

\d usuarios;

SELECT COUNT(*) as total_usuarios FROM usuarios;

PRINT 'Database initialized successfully!';