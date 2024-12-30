# Documentación del Proyecto en Hyperledger Fabric

## Introducción
Este proyecto utiliza Hyperledger Fabric para gestionar pedidos y condiciones de transporte. El chaincode implementa varias funciones para interactuar con el ledger, y se conecta a una aplicación Node.js para realizar consultas y transacciones.

---

## 1. Requisitos Previos

### a. **Instalar Docker y Docker Compose**
- **Docker Desktop** para Windows (compatible con WSL 2):
  - Descarga e instala Docker Desktop desde [Docker](https://www.docker.com/products/docker-desktop/).
  - Habilita la integración con WSL 2 durante la instalación.

### b. **Instalar Node.js**
- Descarga la versión LTS desde [Node.js](https://nodejs.org/).
- Verifica la instalación:
  ```bash
  node --version
  npm --version
  ```

### c. **Instalar los Binarios y Ejemplos de Fabric**
- Descarga y configura los binarios y ejemplos:
  ```bash
  curl -sSL https://bit.ly/2ysbOFE | bash -s
  cd fabric-samples
  ```
- Verifica que tienes el script `network.sh`:
  ```bash
  cd test-network
  ./network.sh --help
  ```

---

## 2. Iniciar la Red de Hyperledger Fabric

### a. **Levantar la Red**
1. Ve al directorio `fabric-samples/test-network`:
   ```bash
   cd fabric-samples/test-network
   ```

2. Inicia la red y crea un canal llamado `mychannel` con soporte de CA:
   ```bash
   ./network.sh up createChannel -ca -c mychannel
   ```

   Esto hará lo siguiente:
   - Configurar un canal (`mychannel`).
   - Crear los contenedores necesarios (peers, orderer, CA, etc.).
   - Generar certificados y credenciales para las organizaciones.

3. Verifica que los contenedores estén corriendo:
   ```bash
   docker ps
   ```

   Busca contenedores como `ca.org1.example.com`, `peer0.org1.example.com`, y `orderer.example.com`.


---

## 3. Desplegar un Chaincode

### a. **Actualizar el Chaincode**

#### Ubicación del Chaincode:
`fabric-samples/asset-transfer-basic/chaincode-javascript/lib/assetTransfer.js`

Agrega las siguientes funciones al chaincode:

```javascript
async CreateOrder(ctx, orderId, customerId, totalPrice, status) {
    const order = {
        ID: orderId,
        CustomerID: customerId,
        TotalPrice: parseFloat(totalPrice),
        Status: status,
        docType: 'order',
    };
    await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(order)));
    return JSON.stringify(order);
}

async ReadOrder(ctx, orderId) {
    const orderJSON = await ctx.stub.getState(orderId);
    if (!orderJSON || orderJSON.length === 0) {
        throw new Error(`El pedido ${orderId} no existe.`);
    }
    return orderJSON.toString();
}

async GetAllAssets(ctx) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');

    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        allResults.push({ Key: result.value.key, Record: record });
        result = await iterator.next();
    }
    return JSON.stringify(allResults);
}
```

---

### b. **Despliegue del Chaincode**
1. Despliega el chaincode actualizado:
   ```bash
   ./network.sh deployCC -c mychannel -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript -ccl javascript
   ```

2. Verifica que el chaincode esté comprometido:
   ```bash
   docker exec peer0.org1.example.com peer lifecycle chaincode querycommitted -C mychannel
   ```

---

## 4. Configurar una Aplicación Node.js


### a. **Crear el Proyecto Node.js**
1. Crea un directorio para la aplicación:
   ```bash
   mkdir HyperledgerApp
   cd HyperledgerApp

   Debe de quedar algo asi:

   -Nombre_App/
    --fabric-samples
    --HyperledgerApp
   ```

2. Inicializa un proyecto de Node.js:
   ```bash
   npm init -y
   ```

3. Instala las dependencias necesarias:
   ```bash
   npm install fabric-network fabric-ca-client mysql2 grpc @grpc/grpc-js
   ```


### b. **Registrar el Administrador**

#### Apartir de aqui los archivos se crean en la carpeta de HyperledgerApp

1. Crea un archivo `enrollAdmin.js`:
   ```javascript
    'use strict';

    const FabricCAServices = require('fabric-ca-client');
    const { Wallets } = require('fabric-network');
    const fs = require('fs');
    const path = require('path');

    const main = async () => {
        try {
            const ccpPath = path.resolve(__dirname, '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
            const ca = new FabricCAServices(caInfo.url);

            const wallet = await Wallets.newFileSystemWallet('./wallet');

            const adminIdentity = await wallet.get('admin');
            if (adminIdentity) {
                console.log('El administrador ya está registrado.');
                return;
            }

            const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            const identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };

            await wallet.put('admin', identity);
            console.log('El administrador se ha registrado correctamente.');
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    };

    main();

   ```

2. Ejecuta el script:
   ```bash
   node enrollAdmin.js
   ```
---

### c. **Registrar un Usuario**
1. Crea un archivo `registerUser.js`:
   ```javascript
    'use strict';

    const FabricCAServices = require('fabric-ca-client');
    const { Wallets } = require('fabric-network');
    const fs = require('fs');
    const path = require('path');

    const main = async () => {
        try {
            const ccpPath = path.resolve(__dirname, '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
            const ca = new FabricCAServices(caInfo.url);

            const wallet = await Wallets.newFileSystemWallet('./wallet');

            const userIdentity = await wallet.get('appUser');
            if (userIdentity) {
                console.log('El usuario "appUser" ya está registrado.');
                return;
            }

            const adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                console.log('El administrador no está registrado en la wallet.');
                return;
            }

            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');

            const secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: 'appUser',
                role: 'client',
            }, adminUser);

            const enrollment = await ca.enroll({ enrollmentID: 'appUser', enrollmentSecret: secret });
            const identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };

            await wallet.put('appUser', identity);
            console.log('El usuario "appUser" se ha registrado correctamente.');
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    };

    main();

   ```

2. Ejecuta el script:
   ```bash
   node registerUser.js
   ```

---
### d. **Script para Subir Datos**
Crea un archivo `UploadData.js`:

```javascript
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
                    `order${order.id}`,
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

```

Ejecuta el script:
```bash
node UploadData.js
```

---

### e. **Script para Consultar Todos los Activos**
Crea un archivo `queryAllAssets.js`:

```javascript
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

```

Ejecuta el script:
```bash
node queryAllAssets.js
```

---

## Conclusión
Con estas configuraciones:
- El chaincode tiene las funciones necesarias para manejar pedidos y activos.
- Puedes cargar datos desde una base de datos y consultar los activos almacenados en la blockchain.

