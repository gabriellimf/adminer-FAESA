const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://usuario:senha123@localhost:5432/sistema_db',
  ssl: false
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
    client.release();
  } catch (err) {
    console.error('❌ Erro ao conectar com PostgreSQL:', err);
  }
}

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id DESC');
    res.render('index', { usuarios: result.rows });
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.render('index', { usuarios: [] });
  }
});

app.post('/usuarios', async (req, res) => {
  const { nome, email, idade } = req.body;

  try {
    await pool.query(
      'INSERT INTO usuarios (nome, email, idade) VALUES ($1, $2, $3)',
      [nome, email, parseInt(idade)]
    );
    console.log('✅ Usuário adicionado:', { nome, email, idade });
    res.redirect('/');
  } catch (err) {
    console.error('❌ Erro ao adicionar usuário:', err);
    res.status(500).send('Erro ao adicionar usuário');
  }
});

app.post('/usuarios/:id/delete', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [parseInt(id)]);
    console.log('✅ Usuário deletado:', id);
    res.redirect('/');
  } catch (err) {
    console.error('❌ Erro ao deletar usuário:', err);
    res.status(500).send('Erro ao deletar usuário');
  }
});

app.get('/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as timestamp, COUNT(*) as total_usuarios FROM usuarios');
    res.json({
      status: 'ok',
      timestamp: result.rows[0].timestamp,
      total_usuarios: result.rows[0].total_usuarios,
      database: 'PostgreSQL',
      version: '1.0.0'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error('❌ Erro na aplicação:', err.stack);
  res.status(500).send('Algo deu errado!');
});

app.listen(port, '0.0.0.0', async () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log('🔗 Sistema disponível na porta 8080 da máquina local');
  console.log('📊 Adminer disponível em http://localhost:8081');
  console.log('🐳 Portainer disponível em http://localhost:9000');

  await testConnection();
});

process.on('SIGINT', async () => {
  console.log('🛑 Encerrando servidor...');
  await pool.end();
  process.exit(0);
});