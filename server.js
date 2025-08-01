
// Import the Express framework to handle routing and HTTP requests.
const express = require('express');

// Import Pool class from pg (node-postgres) library.
const { Pool } = require('pg');

// Import CORS package.
const cors = require('cors');

// Create a new Express application instance.
const app = express();

// Define a constant port on which the server will run.
const port = 3000;

// Middleware to parse JSON bodies.
app.use(express.json());

// Enable CORS for all routes.
app.use(cors());


// PostgreSQL connection setup. Create a new instance of Pool class to manage multiple connections to a PostgreSQL database.
const pool = new Pool({

    // Specify PostgreSQL username for authentification.
    user: 'postgres',
    // Define the database server location. localhost signals the same machine as the application.
    host: 'localhost',
    // Specifies the name of the PostgreSQL database to connect to.
    database: 'INSERT_DATABASE',
    // Specifies the password for PostgreSQL user.
    password: 'INSERT_PASSWORD',
    // Default port used by PostgreSQL connections.
    port: 5432,
});


// Test the connection to the database. Produces console output dependent on whether the server can be connected to/authenticated.
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Error connecting to PostgreSQL database:', err));


// Define the GET method which retrieves the welcome message at the root destination.
app.get('/', (req, res) => {

    // a response is sent containing the welcome message.
    res.send('Hello, this is the To Do List API using a PostgreSQL database!');
});


// GET method which retrieves the list of tasks stored on the server database. Uses an asynchronous callback function since we are making a query to a database.
app.get('/tasks', async (req, res) => {
    try {
        // Executes a SQL query using pool to retrieve all tasks from the table.
        const result = await pool.query('SELECT * FROM tasks');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks', err);
        res.status(500).send('Error fetching tasks');
    }
});


// GET method which retrieves a specific task based upon id from the database. Uses an asynchronous callback function since we are making a query to a database.
app.get('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            // This SQL query returns a row from the tasks table which has the corresponding id.
            'SELECT * FROM tasks WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found');
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching tasks', err);
        res.status(500);
    }
});


// POST method for adding new tasks to the database. Uses an asynchronous callback function since we are making a query to a database.
app.post('/tasks', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await pool.query(
            // Inserts a row into the 'tasks' table, inserts [name] into the (name) column of the table, ($1) is a parameterized query placeholder which is replaced by [name].
            'INSERT INTO tasks (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500);
    }
});


// PUT method that searches for a task based on id and then either updates the task name and/or the completion status. Uses an asynchronous callback function since we are making a query to a database.
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { name, completed } = req.body;
    if (name === undefined && completed === undefined) {
        // Return an error status if there are no fields provided to be updated.
        return res.status(400).send('No update fields provided');
    }
    try {
        // Dynamically update the tasks table. Updates column 'name', 'completed', or both.
        // UPDATE is used to modify a tables records. 'tasks' is the name of the table being updated. SET specifies which columns should be updated.
        let query = 'UPDATE tasks SET ';
        let values = [];
        let count = 1;
        // An if statement that checks to see if a name was given to be updated. Executes if 'name' is not undefined.
        if (name !== undefined) {
            // Appends a string 'name = $count' to the end of the query to be used later to insert the task 'name'. If this code block executes,
            // this placeholder will be represented as $1 because 'count' is initialized as 1 and is the first value in the request body.
            query += `name = $${count}, `;
            values.push(name);
            count++;
        }
        // An if statement that checks to see if a completed status was given/defined to be updated.
        if (completed !== undefined) {
            // Appends a string 'completed = $count' to the end of the query to be used later to insert the task 'completed' status.
            // This placeholder will be represented as $1 or $2 depending on if a name was defined in the request body before 'completed' status.
            query += `completed = $${count}, `;
            values.push(completed);
            count++;
        }
        // Removes trailing comma and adds WHERE clause. Necessary because either one or both of the above if statements may be executed, 
        // and each contain a trailing comma and space at the end of their appended strings.
        // Splice will extract from point 0 and end 2 spaces from the end of the 'query' string.
        // Then appends the WHERE clause with the 'id' placeholder that has been incremented. The previous if statements both increment count 
        // because the 'id' value also utilizes a placeholder which can be $2 or $3 depending on if 'name' and/or 'completed/ status
        // are both being updated. Finally, the query adds a 'RETURN *' string to RETURN the entire updated row back to response. 
        query = query.slice(0, -2) + ` WHERE id = $${count} RETURNING *`; 
        values.push(id);
        // Sends the query with placeholders and the values array to PostgreSQL.
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found');
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating task', err);
        res.status(500);
    };
});


// DELETE method which searches for a task based on id and then deletes the task from the list. Uses an asynchronous callback function since we are making a query to a database.
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            // This SQL query deletes a row from the tasks table which has the corresponding id and then returns the deleted row.
            'DELETE FROM tasks WHERE id = $1 RETURNING *', [id] );
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found');
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error deleting task', err);
        res.status(500);
    };
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
