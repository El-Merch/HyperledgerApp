const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Mock de usuarios para autenticación
const users = [
    { username: 'admin@hotmail.com', password: '1234' },
    { username: 'admin2', password: '1234' },
];

// Configuración de base de datos
const dbConfig = {
    host: 'localhost', // Cambia si es diferente
    user: 'root',
    password: 'yourpassword',
    database: 'green_chain',
};

// Configuración de blockchain
const blockchainConfig = {
    ccpPath: path.resolve(__dirname, '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'),
    walletPath: path.join(__dirname, './wallet'),
};

// Endpoint de autenticación
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (user) {
        res.status(200).json({ message: 'Login exitoso' });
    } else {
        res.status(401).json({ message: 'Credenciales incorrectas' });
    }
});

// Endpoint para obtener el trayecto de un producto
app.get('/api/food-track/:foodName', async (req, res) => {
    const { foodName } = req.params;

    try {
        // Configuración de la blockchain
        const ccp = JSON.parse(fs.readFileSync(blockchainConfig.ccpPath, 'utf8'));
        const wallet = await Wallets.newFileSystemWallet(blockchainConfig.walletPath);

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'appUser',
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');

        // Consultar datos de la blockchain
        const result = await contract.evaluateTransaction('GetAllAssets');
        const assets = JSON.parse(result.toString());

        // Buscar el alimento en los datos de la blockchain
        const asset = assets.find((item) => item.Record.ProductName === foodName);
        if (!asset) {
            return res.status(404).json({ error: 'Producto no encontrado en la blockchain' });
        }

        const { ID } = asset.Record;

        // Consultar base de datos
        const connection = await mysql.createConnection(dbConfig);

        const [dailyOps] = await connection.execute(`
            SELECT * FROM daily_op 
            WHERE id IN (
                SELECT fk_id_dailyop 
                FROM operation_statistics 
                WHERE fk_id_environmental = (SELECT id FROM environmental WHERE system_id = ?)
            )
        `, [ID]);

        const [transport] = await connection.execute(`
            SELECT * FROM transport WHERE order_Id = ?
        `, [ID]);

        const [delivery] = await connection.execute(`
            SELECT * FROM delivery_confirmation WHERE transport_id = ?
        `, [transport[0]?.id_transport]);

        // Responder con los datos completos
        res.json({
            blockchain: asset.Record,
            dailyOps,
            transport,
            delivery,
        });

        await connection.end();
        await gateway.disconnect();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos del alimento' });
    }
});

// Configuración del servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
