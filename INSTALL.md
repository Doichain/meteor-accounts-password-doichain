## Installation:
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
    "port": "4010",
    "ssl": false
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
        "dAppLogin": {"userId": "xyz", "authToken": "bal" }
    }
}
```

8. Add another project user to your Doichain dapp (e.g. project-a-en - en for English) and change mailTemplate data like so:
```
curl -X PUT -H "Content-Type: application/json" \ 
    -H "X-Auth-Token: vk_3bG4uHN2wyERGhMwL3dJoZPOXpgVv2A6Wgn731bc" 
    -H "X-User-Id: pe3YKzhPqxX94T2AD" \\ 
    -d '{"mailTemplate":{"subject":"Welcome to myp project","redirect":"http://myproject.mydomain.com","returnPath":"myproject@mydomain.com","templateURL":"http://server-of-your-email-template/welcome_en.txt"}}' \
    http://localhost:4010/api/v1/users/<the users id> 
```

9. Save your email template at the above configured url (reachable by your projects server) e.g.
```
Welcome to the Doichain Bounty Project!

Please confirm your account creation here: ${confirmation_url}

We regard your account creation as permission to send you emails related to Doichain Bounty project and tasks.
We will not send any other information to you.

We store this permission visible for you and us in the Doichain blockchain,
this means you can anytime see the current status of your account and email permission.
${permission_url}

Here you can also cancel your account with us easily.

We store no personal data about you in the public blockchain.

Kind Regards,

Nico

Doichain.org
```
 
10. depending on you (test) dApp configuration on a non-public-ip, forward your local port a remote server
```bash
ssh -R 4010:localhost:4010 your@your-remote-ssh-server
```
11. ***DON'T FORGET to add CAPTCHA***
since your Doicoin wallet will be empty very quickly when you get bot visitors. https://github.com/meteor-useraccounts/core/blob/acded6633c6db153857b7dd244fd022101c509ce/Guide.md#reCaptcha-setup
12. Fund you wallet! If you need Testnet-Doicoin please request it on the telegram group: @doichain_dev or https://t.me/doichain_dev