'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const main = async () => {
    try {
        // Conexión a la base de datos local
        const db = await mysql.createConnection({
            host: 'host.docker.internal',
            user: 'root',
            password: '',
            database: 'green_chain'
        }); 

        console.log('Conexión a la base de datos exitosa.');

        // Configuración de Hyperledger Fabric
        const ccpPath = path.resolve(__dirname, '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const wallet = await Wallets.newFileSystemWallet('./wallet');

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'appUser',
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');

        console.log('Conectado a la red de Hyperledger Fabric.');

        // Recuperar datos de la base de datos
        const [orders] = await db.query('SELECT id, customer_id, total_price, status FROM primaryorder;');

        // Subir datos al ledger
        for (const order of orders) {
            try {
                console.log(`Subiendo pedido con ID: ${order.id}`);
                await contract.submitTransaction(
                    'CreateOrder',
                    `${order.id}`,
                    `${order.customer_id}`,
                    `${order.total_price}`,
                    `${order.status}`
                );
                console.log(`Pedido ${order.id} subido exitosamente.`);
            } catch (err) {
                console.error(`Error subiendo el pedido ${order.id}: ${err.message}`);
            }
        }        

        console.log('Todos los pedidos han sido subidos al ledger.');

        await gateway.disconnect();
        await db.end();
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

main();