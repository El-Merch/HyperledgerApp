const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { use } = require('react');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const users = [
    {username: 'admin@hotmail.com', password: '1234'},
    {username: 'admin2', password: '1234'}
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (user) {
        res.status(200).json({message: 'Login exitoso'});
    } else {
        res.status(401).json({message: 'Credenciales incorrectas'});
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
});