const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
app.use(bodyParser.json());

// Azure AD App authentication config
const config = {
    server: 'ccdemo.database.windows.net',  // Your server
    database: 'UserDatabase',               // Your database
    options: { encrypt: true },
    authentication: {
        type: 'azure-active-directory-service-principal-secret',
        options: {
            clientId: '7abed437-ab7b-4d5d-b4e0-f62e3f6b1880',       // Application (client) ID
            clientSecret: 'c45a54f0-fab7-4cfc-8c9a-758aa5f8fb41', // Client secret
            tenantId: '4bea8bb8-a613-4845-893a-6325bcde4931'        // Directory (tenant) ID
        }
    }
};

// Utility function to get a connection pool
async function getPool() {
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.error('DB connection failed:', err);
        throw err;
    }
}

// Create User
app.post('/add', async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('name', sql.NVarChar, req.body.name)
            .input('age', sql.Int, req.body.age)
            .query('INSERT INTO Users (Name, Age) VALUES (@name, @age)');
        res.send('User added');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Read Users
app.get('/users', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update User
app.put('/update/:id', async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('age', sql.Int, req.body.age)
            .query('UPDATE Users SET Age = @age WHERE Id = @id');
        res.send('User updated');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete User
app.delete('/delete/:id', async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Users WHERE Id = @id');
        res.send('User deleted');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
