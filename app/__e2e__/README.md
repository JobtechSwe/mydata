Phone app e2e lib
-----------------

```javascript
const phone = require(`${phone_e2e_dist_dir}/`)

phone.Config.OPERATOR_URL = 'http://localhost:3000/api'
await phone.createAccount({ firstName: 'Foo', lastName: 'Bar' })
```
