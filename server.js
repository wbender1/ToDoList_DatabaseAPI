
// Import the Express framework to handle routing and HTTP requests.
const express = require('express');

// Import Pool class from pg (node-postgres) library.
const { Pool } = require('pg');

// Create a new Express application instance.
const app = express();

// Define a constant port on which the server will run.
const port = 3000;

// Middleware to parse JSON bodies.
app.use(express.json());


// PostgreSQL connection setup
// Create a new instance of Pool class to manage multiple connections to a PostgreSQL database.
const pool = new Pool({

    // Specify PostgreSQL username for authentification.
    user: 'postgres',
    // Define the database server location. localhost signals the same machine as the application.
    host: 'localhost',
    // Specifies the name of the PostgreSQL database to connect to.
    database: 'my_todolist_api_database',
    // Specifies the password for PostgreSQL user.
    password: 'Toastretrieve24$',
    // Default port used byu PostgreSQL connections.
    port: 5432,
});


// Test the connection to the database
// Produces console output dependent on whether the server can be connected to/authenticated.
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Error connecting to PostgreSQL database:', err));


// Define the GET method which retrieves the welcome message at the root destination.
// root endpoint has a request and response intialized. However, no request is sent, only a response.
app.get('/', (req, res) => {

    // a response is sent containing the welcome message.
    res.send('Hello, this is the To Do List API using a PostgreSQL database!');
});

// Define the GET method which retrieves the list of tasks stored on the server database.
// An asynchronous callback function that handles the GET request since we are using a query from a database.
app.get('/tasks', async (req, res) => {

    // A try catch block used to handle erorrs. The try section is attempted and executed if possible.
    try {

        // Used to wait for the query which is the result of the asynchronous callback.
        // Executers a SQL query using pool to retrieve all tasks from the table.
        const result = await pool.query('SELECT * FROM tasks');

        // A response is given containing all rows from results.
        res.json(result.rows);

        // The catch block is only executed if the try portion fails to execute, produces an error response.
    } catch (err) {

        // Produces a console error if the try block fails to retrieve the tasks from the database.
        console.error('Error fetching tasks:', err);

        // Produces an error on the HTML destination if the try block fails to retrieve the tasks from the database.
        res.status(500).send('Error fetching tasks');
    }
});


// Defines a HTTP POST route for adding new tasks to the database.
// An asynchronous callback function that handles the POST request since we are using a query from a database.
app.post('/tasks', async (req, res) => {

    // Extracts the 'name' from the request body.
    const { name } = req.body;

    // A try catch block used to handle erorrs. The try section is attempted and executed if possible.
    try {

        // Creates a result object to be returned by response.
        const result = await pool.query(

            // This SQL query inserts a new row into the 'tasks' table and inserts [name] into the (name) column of the table.
            // The ($1) is a parameterized query placeholder which is replaced by [name].
            // The query then returns the entire row that was just added into the tasks table and sets it to result.
            'INSERT INTO tasks (name) VALUES ($1) RETURNING *',

            // Value passed from the request body into the (name) column of the tasks table.
            [name]
        );

        // Respond with the newly created task which is stored as an array and with the first item accessed.
        res.status(201).json({
            message: `Task: '${result.rows[0].name}' added successfully! ID: ${result.rows[0].id}, Status: 'false'`,
        });

        // Catch block that executes if there is an error creating the task.
    } catch (err) {

        // Produces a console error if the try block fails to retrieve the tasks from the database.
        console.error('Error creating task:', err);

        // Produces an error on the HTML destination if the try block fails to retrieve the tasks from the database.
        res.status(500).send('Error creating task');
    }
});


// Define the DELETE method which searches for a task based on id and then deletes the task from the list.
// Adds an additionally endpoint which is the id assigned to the task.
app.delete('/tasks/:id', async (req, res) => {

    // Extracts the id parameter from the URL.
    const { id } = req.params;

    // A try catch block used to handle erorrs. The try section is attempted and executed if possible.
    try {

        // 
        const result = await pool.query(

            // This SQL query deletes a row from the tasks table which has the corresponding id and then returns the deleted row.
            'DELETE FROM tasks WHERE id = $1 RETURNING *',

            // Value passed from the request body into $1 to set the id of the row to be deleted.
            [id]
        );

        // If no task was deleted, respond with 404 Not Found.
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found');
        }

        // Respond with the newly deleted task which is stored as an array and with the first item accessed.
        res.status(201).json({
            message: `Task: '${result.rows[0].name}' deleted successfully! ID: ${result.rows[0].id}, Status: 'false'`,
        });

        // Catch block that executes if there is an error deleting the task.
    } catch (err) {

        // Produces a console error if the try block fails to deleting the task from the database.
        console.error('Error creating task:', err);

        // Produces an error on the HTML destination if the try block fails to deleting the task from the database.
        res.status(500).send('Error creating task');
    };
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
