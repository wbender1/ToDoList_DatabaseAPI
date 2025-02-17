
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
    database: 'todolist_api',
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
        console.error('Error fetching tasks', err);

        // Produces an error on the HTML destination if the try block fails to retrieve the tasks from the database.
        res.status(500).send('Error fetching tasks');
    }
});


// Define the GET method which retrieves a specific task based upon id from the database.
// An asynchronous callback function that handles the GET request since we are using a query from a database.
app.get('/tasks/:id', async (req, res) => {

    // Extracts the id parameter from the URL.
    const { id } = req.params;

    // A try catch block used to handle erorrs. The try section is attempted and executed if possible.
    try {

        // Creates a result object to be returned by response.
        const result = await pool.query(

            // This SQL query returns a row from the tasks table which has the corresponding id.
            'SELECT * FROM tasks WHERE id = $1',

            // Value passed from the request body into the placeholder, $1, to set the id of the row to be returned.
            [id]
        );

        // If no task was returned, respond with 404 Not Found.
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found');
        }

        // Respond with the newly returned task which is stored as an array and with the first item accessed.
        res.status(201).json({
            message: `Task: '${result.rows[0].name}', ID: ${result.rows[0].id}, Status: ${result.rows[0].completed}`,
        });

        // The catch block is only executed if the try portion fails to execute, produces an error response.
    } catch (err) {

        // Produces a console error if the try block fails to retrieve the tasks from the database.
        console.error('Error fetching tasks', err);

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

        // Creates a result object to be returned by response.
        const result = await pool.query(

            // This SQL query deletes a row from the tasks table which has the corresponding id and then returns the deleted row.
            'DELETE FROM tasks WHERE id = $1 RETURNING *',

            // Value passed from the request body into the placeholder, $1, to set the id of the row to be deleted.
            [id]
        );

        // If no task was deleted, respond with 404 Not Found.
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found');
        }

        // Respond with the newly deleted task which is stored as an array and with the first item accessed.
        res.status(201).json({
            message: `Task: '${result.rows[0].name}' deleted successfully! ID: ${result.rows[0].id}, Status: ${result.rows[0].completed}`,
        });

        // Catch block that executes if there is an error deleting the task.
    } catch (err) {

        // Produces a console error if the try block fails to delete the task from the database.
        console.error('Error deleting task', err);

        // Produces an error on the HTML destination if the try block fails to delete the task from the database.
        res.status(500).send('Error deleting task');
    };
});


// Define the PUT method that searches for a task based on id and then either updates the task name and/or the completion status.
// Adds an additional endpoint which is the id assigned to the task.
app.put('/tasks/:id', async (req, res) => {

    // Extracts the id parameter from the URL.
    const { id } = req.params;

    // Extracts the task and completion status from the request body.
    const { name, completed } = req.body;

    // Check if at least one field is provided for update. Returns error if both fields are undefined.
    if (name === undefined && completed === undefined) {

        // Return an error status if there are no fields provided to be updated.
        return res.status(400).send('No update fields provided');
    }

    // A try catch block used to handle erorrs. The try section is attempted and executed if possible.
    try {

        // Dynamically update the tasks table. Updates column 'name', 'completed', or both.
        // Declares a query variable that can be updated later.
        // UPDATE is used to modify a tables records. 'tasks' is the name of the table being updated. SET specifies which columns should be updated.
        let query = 'UPDATE tasks SET ';

        // Declares a values variable as an empty array that can be updated later. 
        let values = [];

        // Defines a count variable to start at 1 instead of 0.
        let count = 1;

        // An if statement that checks to see if a name was given to be updated. Executes if 'name' is not undefined.
        if (name !== undefined) {

            // Appends a string 'name = $count' to the end of the query to be used later to insert the task 'name'. If this code block executes,
            // this placeholder will be represented as $1 because 'count' is initialized as 1 and is the first value in the request body.
            query += `name = $${count}, `;

            // Adds the requested task name into values array.
            values.push(name);

            // Increments count by 1.
            count++;
        }

        // An if statement that checks to see if a completed status was given/defined to be updated.
        if (completed !== undefined) {

            // Appends a string 'completed = $count' to the end of the query to be used later to insert the task 'completed' status.
            // This placeholder will be represented as $1 or $2 depending on if a name was defined in the request body before 'completed' status.
            query += `completed = $${count}, `;

            // Adds the requested completion status to values array.
            values.push(completed);

            // Increments count by 1.
            count++;
        }

        // Removes trailing comma and adds WHERE clause. Necessary because either one or both of the above if statements may be executed, 
        // and each contain a trailing comma and space at the end of their appended strings.
        // Splice will extract from point 0 and end 2 spaces from the end of the 'query' string.
        // Then appends the WHERE clause with the 'id' placeholder that has been incremented. The previous if statements both increment count 
        // because the 'id' value also utilizes a placeholder which can be $2 or $3 depending on if 'name' and/or 'completed/ status
        // are both being updated. Finally, the query adds a 'RETURN *' string to RETURN the entire updated row back to response. 
        query = query.slice(0, -2) + ` WHERE id = $${count} RETURNING *`;

        // Adds the 'id' number to the values array. 
        values.push(id);

        // Sends the query with placeholders and the values array to PostgreSQL and defines result to be the RETURNed row.
        const result = await pool.query(query, values);

        // If the result does not contain a row RETURNed from the query, produce an error
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found');
        }

        // Respond with the newly updated task which is stored as an array and with the first item accessed.
        res.status(201).json({
            message: `Task: '${result.rows[0].name}' updated successfully! ID: ${result.rows[0].id}, Status: ${result.rows[0].completed}`,
        });

        // Catch block that executes if there is an error updating the task.
    } catch (err) {

        // Produces a console error if the try block fails to update the task from the database.
        console.error('Error updating task', err);

        // Produces an error on the HTML destination if the try block fails to update the task from the database.
        res.status(500).send('Error updating task');
    };
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
