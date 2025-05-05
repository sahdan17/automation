const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '153.92.15.20', // Ganti dengan host MySQL kamu
    user: 'u687082190_jambi', // Username MySQL
    password: 'U687082190_jambi', // Password MySQL
    database: 'u687082190_jambi' // Nama database
});

connection.connect((err) => { 
      if (err) {
            console.error('Error connecting to MySQL:', err.message);
            return;
      }
    console.log('Connected to MySQL database!');
})

const getLatestPressure = async (con,id) => { 
      return new Promise((res, rej) => { 
            try {
                  con.query(`SELECT * FROM pressure WHERE idSpot = '${id}' ORDER BY id DESC LIMIT 1`, function (err, result, fields) { 
                        if (err) { 
                              console.log(err);
                              rej(err);
                        }   
                        res(result,fields)
                  })
            } catch (error) { 
                  rej(error)
            }
      })
}

const getSpots = async (con) => {
      return new Promise((res, rej) => {
            try {
                  con.query("SELECT * FROM spot WHERE 1 ORDER BY sort ASC", function (err, result, fields) {
                        if (err) { 
                              console.log(err);
                              rej(err);
                        }   
                        res(result,fields)
                  });
            } catch (error) { 
                  rej(error)
            }
      })
}

module.exports = {
      connection,
      getSpots,
      getLatestPressure
}