# accounts-password-doichain - how to blockchain your Double-Opt-ins


## Description
extends accounts-password and sends account creation emails instead over smtp but over the Doichain blockchain as a SOI (Single-Opt-In transaction)

This module needs a running both a Doichain Node and Doichain dApp in order work correctly.

Usage:
1. Setup Doichain Node and Doichain dApp as described here: https://github.com/Doichain/dapp
1. Create a Meteor project ```meteor create my-doichain-project; cd my-doichain-project```
2. Execute ```meteor add accounts-password accounts-ui doichain:accounts-password-doichain```
3. Run project ```meteor```
4. Add ``{{> loginButtons}}`` to your template.
5. Configure URL and credentials of your Doichain dApp in settings.json like so: 
```json
{
  "app": {
    "host": "localhost",
    "port": "81",
    "ssl": false,
  },
  "doichain": {
    "dappUsername": "admin",
    "dappPassword": "<password>"
    },
}
```
or use a userId:token pair as invented by acccounts-password:
```json
{
  "doichain": {
    "dappLogin": {"userId": xyz, "authToken": "bal" }
    }
}
```

A login service that enables secure password-based login and requests the verification email or enrollment email (Double-Opt-In) over Doichain blockchain.  
See the [project page](https://www.meteor.com/accounts) on Meteor Accounts for more details.
