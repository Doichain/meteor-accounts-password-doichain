# accounts-password-doichain - how to blockchain your Double-Opt-ins


## Description
extends accounts-password and sends account creation emails instead over smtp but over the Doichain blockchain as a SOI (Single-Opt-In transaction)

This module needs a running both a Doichain Node and Doichain dApp in order work correctly.

Usage:
1. Setup Doichain Node and Doichain dApp as described here: https://github.com/Doichain/dapp
2. Create a Meteor project ```meteor create my-doichain-project; cd my-doichain-project```
3. Execute ```meteor add accounts-password accounts-ui doichain:accounts-password-doichain```
4. Run project ```meteor```
5. Add ``{{> loginButtons}}`` to your template.
6. Configure URL and credentials of your (Testnet) Doichain dApp in settings.json like so: 
```json
{
  "app": {
    "host": "localhost",
    "port": "81",
    "ssl": false,
  },
  "doichain": {
    "dAppUsername": "admin",
    "dAppPassword": "password"
  }
}
```
or use a userId:token pair as invented by acccounts-password:
```json
{
  "doichain": {
        "dappLogin": {"userId": "xyz", "authToken": "bal" }
    }
}
```
8. if you run your dapp on a non-public-ip 
you might have to forward the http-port of the dapp (e.g. mainnet e.g. 80 or 3000 / testnet 81) 
to a server with public ip like so (connect local testnet http dapp port 81 to e.g. remote port 4000:
```bash
ssh -R 4000:localhost:81 your@your-remote-ssh-server
```
