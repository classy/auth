# Auth

A simple node.js authentication library that persists to a CouchDB. 

## Example
```javascript
var auth = require('./');

// Hook it up to a couchdb
auth.config.set({
	dbhost: 'http://localhost:5984',
  dbname: 'auth'
});

// Create a user
auth.create.user(
  'me@example.com', 
  'password123', 
  function(err, res){
    console.log(res); 
    // => { ok: true,
    //      id: '8bb64c66c8e46092abb94cccf4042a58',
    //      rev: '1-71caa06243b9bcc43979c334df03e8a3' }
  }
);

// Fetch the new user
auth.fetch.user(
  '8bb64c66c8e46092abb94cccf4042a58', 
  function(err, res){
    console.log(res);
    // => { _id: '8bb64c66c8e46092abb94cccf4042a58',
    //      _rev: '1-71caa06243b9bcc43979c334df03e8a3',
    //      email: 'me@example.com',
    //      creation_date: '2012-05-16T22:15:49.533Z',
    //      type: 'user',
    //      password: 
    //        { salt: 'qn4cThUOfeIMdfTb',
    //          hex: '4341d0b06c7a85840e94b34b32bc173d',
    //          algo: 'md5' } } }
);
```

# API

## .config

Contains key/value configurations used throughout the library. The only two important ones right now are `dbhost`, which is the URI to your running couchdb, and `dbname`, which is the name of the database to use on `dbhost`.

### .config.set

Set a key to a given value.

*usage*: 
- `config.set(<key>, <value>)`
- `config.set({<key:value>, <key:value>...})`


### .config.get

Return the value of a key that has been set.

*usage*: `config.get('<key>')`


## .create

Create Auth objects

### .create.user

Create a user and save it to the database.

*usage*: `auth.create.user(<email>, <password>, <callback>)`


