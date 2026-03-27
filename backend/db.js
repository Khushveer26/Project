// =============================================
//  db.js – MySQL Database Connection
//  Uses mysql2 to connect to portfolio_db
// =============================================

const mysql = require('mysql2');

// Create a connection pool (better than single connection)
const pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'Khushveer#26',
    database : 'portfolio_db',
    waitForConnections : true,
    connectionLimit    : 10,
    queueLimit         : 0
});

// Test the connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('   Make sure MySQL is running and portfolio_db exists.');
        console.error('   Run database.sql first: mysql -u root -p < database.sql');
    } else {
        console.log('✅ Connected to MySQL database: portfolio_db');
        connection.release();
    }
});

// Export the promise-based pool for async/await usage
module.exports = pool.promise();
