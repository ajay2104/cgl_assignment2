const mysql = require('mysql');

exports.connec = function(){
    var con = mysql.createConnection({
        host: "192.168.1.27",
        port: "3306",
        user: "root",
        password: "root",
        database: "cg_assignment_2"
    });
  
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "CREATE TABLE customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), password VARCHAR(255))";
        con.query(sql, function (err, result) {
          if (err){};
        });
      });

      return con;

}


