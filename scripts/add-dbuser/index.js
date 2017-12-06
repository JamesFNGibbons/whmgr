const mysql = require('mysql');

// Fetch the root password
let root_password = require('../../configs/mysql-server.json').password;

// Connect to the database
let connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: root_password
});
connection.connect((err, db) => {
	if(err){
		throw err;
	}
	else{
		let username = process.argv[2];
		let password = process.argv[3];
		let sql = `CREATE USER '${username}'@'localhost' IDENTIFIED BY '${password}'`;

		connection.query(sql, (err) => {
			if(err) throw err;
			else{
				console.log('Done.');
			}
		});
	}
});