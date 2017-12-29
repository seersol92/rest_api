const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const expressValidator = require('express-validator');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('./config/database');
const path = require('path');
const cors = require('cors');
const authentication = require('./routes/authentication')(router);
mongoose.Promise = global.Promise;
mongoose.connect(config.uri, { useMongoClient: true }, (err)=>{
  if(err) { console.log('Could Not Connect To Database:', err); }
  else { console.log('Connected to Database:'+config.db); }
});
// Only for development purpose no need for production version
// not a save  way
app.use(cors(
    { origin: 'http://localhost:4200'}
));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(express.static(__dirname+'/cleint/dist/'));
app.use('/authentication', authentication);
app.get('*', (req, res) =>{
  //res.sendFile(path.join(__dirname+'/client/dist/index.html'));
  res.send('system intialized.....');
});
app.listen(8080, ()=>{
  console.log('listening on the port 8080');
});
