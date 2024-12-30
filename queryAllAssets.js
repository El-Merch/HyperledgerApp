'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const main = async () => {
    try {
        // Configuración de Hyperledger Fabric
        const ccpPath = path.resolve(__dirname, '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'appUser',
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');

        console.log('Consultando todos los activos...');
        const result = await contract.evaluateTransaction('GetAllAssets');
        console.log('Resultado:');
        console.log(JSON.parse(result.toString()));

        await gateway.disconnect();
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

main();
