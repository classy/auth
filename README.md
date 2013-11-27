# Auth

A simple node.js authentication library that persists to a CouchDB. 


# Installation

```bash
npm install
```



## Testing

```bash
npm test
```


## Example
```javascript
var auth = require('./');
var User = auth.models.User;

// Hook it up to a couchdb
auth.config.set({
  dbhost: 'http://localhost:5984',
  dbname: 'auth'
});

// Create a user
var new_user = new User();
new_user.create({
  email: 'user@example.com', 
  password: 'muchauth'
  }, function(err, result){
    console.log('User creation results:', res);
  }
);
// => { ok: true,
//      id: '8bb64c66c8e46092abb94cccf4042a58',
//      rev: '1-71caa06243b9bcc43979c334df03e8a3' }

new_user.id;
// > '8bb64c66c8e46092abb94cccf4042a58'


new_user.read(console.log);
// => { _id: '8bb64c66c8e46092abb94cccf4042a58',
//      _rev: '1-71caa06243b9bcc43979c334df03e8a3',
//      email: 'me@example.com',
//      creation_date: '2012-05-16T22:15:49.533Z',
//      type: 'user',
//      password: 
//        { salt: 'qn4cThUOfeIMdfTb',
//          hex: '4341d0b06c7a85840e94b34b32bc173d',
//          algo: 'md5' } } }

new_user.authenticate('muchauth', console.log);
```
