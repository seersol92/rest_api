 const User = require('../models/user'); //import user  model schema
 const config = require('../config/database'); //import database configuration
 const jwt = require('jsonwebtoken');
 module.exports = (router) => {
   router.post('/register', (req, res) => {
     // validate the input
     req.checkBody('firstname', 'First Name is required').notEmpty();
     req.checkBody('lastname',  'Last Name is required').notEmpty();
     req.checkBody('username', 'User Name is required').notEmpty();
     req.checkBody('email', 'Email is required').notEmpty();
     req.checkBody('email', 'Email does not appear to be valid').isEmail();
     req.checkBody('password', 'Password is required').notEmpty();
     // req.assert('password_confirm', 'Passwords must match').equals(req.body.password);
     // check the validation object for errors
     var errors = req.validationErrors();
     if (errors) {
        res.json({
            success: false,
            message: errors
        });
     } else {
       let user = new User({
           firstname: req.body.firstname.toLowerCase(),
           lastname:  req.body.lastname.toLowerCase(),
           username:  req.body.username.toLowerCase(),
           email:     req.body.email.toLowerCase(),
           password:  req.body.password
       });
       user.save( function(err) {
          if(err && err.errors){
            if(err.errors.firstname) {
              res.json({
                  success: false,
                  message: 'Something went wrong.Please try again later!!',
                  errorObj: err.errors.firstname.message
              });
            }else {
              if(err.errors.lastname) {
                res.json({
                    success: false,
                    message: 'Something went wrong.Please try again later!!',
                    errorObj: err.errors.lastname.message
                });
              } else {
                if(err.errors.username) {
                  res.json({
                      success: false,
                      message: 'Something went wrong.Please try again later!!',
                      errorObj: err.errors.username.message
                  });
                } else {
                  if(err.errors.email) {
                    res.json({
                        success: false,
                        message: 'Something went wrong.Please try again later!!',
                        errorObj: err.errors.email.message
                    });
                  }else {
                    if(err.errors.password) {
                      res.json({
                          success: false,
                          message: 'Something went wrong.Please try again later!!',
                          errorObj: err.errors.password.message
                      });
                    }
                  }
                }
              }
            }
          } else {
            res.json({
                success: true,
            });
          }
       });
     }
   }); //END

   router.get('/checkUserName/:username', (req, res) => {
     const username = req.params.username.toString();
     const regExp = new RegExp("^([a-zA-Z0-9_-]){3,20}$");
     if (!username || !regExp.test(username)) {
       res.json({success: false, message: 'User Name is not valid' });
     } else {
       User.findOne( { "username": username }, (err, user) => {
         if (err) {
          res.json({ success: false, message: err });
        } else {
            if (user) {
              res.json({ success: true });
            } else {
              res.json({ success: false });
            }
        }
       });
     }
   });  //END

   router.get('/checkEmail/:email', (req, res) => {
     const email = req.params.email.toString();
     const regExp = new RegExp(/^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/);
     if (!email || !regExp.test(email)) {
       res.json({success: false, message: 'E-mail is not valid' });
     } else {
       User.findOne( { "email": email }, (err, user) => {
         if (err) {
          res.json({ success: false, message: err });
        } else {
            if (user) {
              res.json({ success: true });
            } else {
              res.json({ success: false });
            }
        }
       });
     }
   });  //END
   router.post('/login', (req , res) => {
     // validate the input
     req.checkBody('loginUser', 'Username Or Email is required').notEmpty();
     req.checkBody('password',  'Password is required').notEmpty();
     var errors = req.validationErrors();
     if (errors) {
        res.json({
            success: false,
            message: errors
        });
     } else {
       const Projection = {
        __v     : false,
        dateadded: false
    };
//      const  select = '_id username email';
       User.findOne( {username: req.body.loginUser.toLowerCase() }, Projection, (err, user) => {
         if(err) {
           res.json({   success: false, message: err});
         } else if (!user) {
              User.findOne( {email: req.body.loginUser.toLowerCase() }, Projection, (err, user) => {
                if(err) {
                   res.json({   success: false, message: err});
                 } else if (user) {
                   let validatePassword = user.comparePassword(req.body.password);
                     if(!validatePassword) {
                       res.json({  success: false,  message: 'Invalid Password!'});
                     } else {
                       const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '24h'});
                       res.json({ success: true, token: token, user: { username: user.username, email: user.email } });
                     }
                 } else {
                      res.json({ success: false,  message: 'Invalid Username Or Email!' });
                  }
              });
         } else {
           let validatePassword = user.comparePassword(req.body.password);
           if(!validatePassword) {
             res.json({  success: false,  message: 'Invalid Password!'});
           } else {
             const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '24h'});
             res.json({ success: true, token: token, user: { username: user.username, email: user.email } });
           }
         }
       });
     }
   });
   //middleware for only logged in user checking token
   router.use((req, res, next) => {
     const token = req.headers['authorization'];
     if(!token){
       res.send({success: false, message: 'Access Token is not  verified!'});
     } else {
         jwt.verify(token, config.secret, (err, decoded) => {
         if(err){
           res.send({success: false, message: 'Token Invalid-'+err});
         } else {
           req.decoded = decoded;
           next();
         }
       });
     }
   });
   router.get('/profile', (req, res) => {
     User.findOne({_id: req.decoded.userId}).select('username email').exec((err, user ) =>{
       if (err) {
         res.json({ success: false, message: err });
       } else {
         res.json({ success:true, user: user });
       }
     });
   });
   return router; //return router object to main index.js
 }
