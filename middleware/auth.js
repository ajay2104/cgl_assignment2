
exports.checkauthToken = (req,res,next) => {

    var token = req.headers.token;
    if(token){
            jwt.verify(token, 'secret', function(err, token_data) {
              if (err) {
                 return res.status(403).send('Error');
              } else {
                global.authenticatedUser = token_data;
                next();
              }
            });
        
          } else {
            return res.status(403).send('No token');
          }
    }

