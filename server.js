const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();

// Configura CORS para permitir solicitudes desde el frontend
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Configuración de base de datos
const dbConfig = {
    host: 'host.docker.internal',
    user: 'root',
    password: '',
    database: 'green_chain',
};

// Endpoint para obtener el trayecto de un producto basado en su nombre
app.get('/api/food-track/:productName', async (req, res) => {
    const { productName } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Obtener ID del producto a partir de su nombre
        const [productResults] = await connection.execute(`
            SELECT id FROM products WHERE product_name = ?
        `, [productName]);

        if (productResults.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const productId = productResults[0].id;

        // Obtener operation_statistics y los datos de sensores relacionados
        const [operationStats] = await connection.execute(`
            SELECT os.*, 
                   dlog.creation_at AS datalogger_date, dlog.value AS datalogger_value,
                   led.create_at AS led_date, led.intensity AS led_intensity,
                   env.create_at AS env_date, env.temp AS env_temp, env.hum AS env_hum, env.CO2 AS env_co2, env.pressure AS env_pressure
            FROM operation_statistics os
            LEFT JOIN dataloggers dlog ON os.fk_id_dataloggers = dlog.id
            LEFT JOIN led_intensity led ON os.fk_id_ledintensity = led.id
            LEFT JOIN environmental env ON os.fk_id_environmental = env.id
            WHERE os.fk_id_dailyop IN (
                SELECT id FROM daily_op
                WHERE id IN (
                    SELECT fk_id_dailyop 
                    FROM operation_statistics
                    WHERE fk_id_environmental IN (
                        SELECT id FROM environmental WHERE system_id = ?
                    )
                )
            )
        `, [productId]);

        // Obtener transporte relacionado con el producto
        const [transportResults] = await connection.execute(`
            SELECT * FROM transport WHERE order_Id IN (
                SELECT fk_id_order FROM order_product WHERE fk_id_product = ?
            )
        `, [productId]);

        // Obtener condiciones de transporte
        const [transportConditionsResults] = await connection.execute(`
            SELECT * FROM transport_conditions WHERE id_transport IN (
                SELECT id_transport FROM transport WHERE order_Id IN (
                    SELECT fk_id_order FROM order_product WHERE fk_id_product = ?
                )
            )
        `, [productId]);

        // Obtener detalles de la orden primaria (paso final)
        const [primaryOrderResults] = await connection.execute(`
            SELECT * FROM primaryorder WHERE id IN (
                SELECT fk_id_order FROM order_product WHERE fk_id_product = ?
            )
        `, [productId]);

        // Obtener detalles del cliente asociado con la orden primaria
        const [customerResults] = await connection.execute(`
            SELECT * FROM customer WHERE id = ?
        `, [primaryOrderResults[0]?.customer_id]);

        // Responder con los datos completos
        res.json({
            product: { id: productId, name: productName },
            productionStats: operationStats, // Incluye datos completos de sensores
            transport: transportResults,
            transportConditions: transportConditionsResults,
            primaryOrder: primaryOrderResults[0],
            customer: customerResults[0],
        });

        await connection.end();
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
