import {Meteor} from "meteor/meteor";
import { HTTP } from 'meteor/http'
import { getSettings} from "meteor/doichain:settings";

Meteor.startup(() => {

    //in case you use this package together with meteor-doichain-api  you might want to disable Accounts config here!
    //just add app.disableAccountsConfig=true in 
    const accounts_disableConfig = getSettings('app.disableAccountsConfig');
    if(accounts_disableConfig === undefined || accounts_disableConfig===false){
        const accounts_sendVerificationEmail = getSettings('accounts.sendVerificationEmail',true);
        const accounts_forbidClientAccountCreation = getSettings('accounts.forbidClientAccountCreation',false); //we allow accounts creation by default
        Accounts.config({
            sendVerificationEmail: accounts_sendVerificationEmail,
            forbidClientAccountCreation: accounts_forbidClientAccountCreation
        });
        Accounts.emailTemplates.from=getSettings('Accounts.emailTemplates.from','doichain@le-space.de');
    }

   _.extend(Accounts,{
    sendVerificationEmail: function(userId, email, extraTokenData){

      const {email: realEmail, user, token} = Accounts.generateVerificationToken(userId, email, extraTokenData);
      const url = Accounts.urls.verifyEmail(token);
      const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'verifyEmail');
      console.log('now requesting email permission');
      //TODO - set request doi template via UI and db
      //TODO parse form data and store it inside dapp (use old feature of florian)
      requestDOI(options.to,options.to,null,true);

      return {email: realEmail, user, token, url, options};
    },
    sendEnrollmentEmail: function(userId, email, extraTokenData){

      const {email: realEmail, user, token} = Accounts.generateResetToken(userId, email, 'enrollAccount', extraTokenData);
      const url = Accounts.urls.enrollAccount(token);
      const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'enrollAccount')

      console.log('sendEnrollmentEmail over Doichain requested.');
      requestDOI(options.to,options.to,null,true);
      return {email: realEmail, user, token, url, options};
    }
  });

});
function requestDOI(recipient_mail, sender_mail, data,  log) {
  const syncFunc = Meteor.wrapAsync(request_DOI);
  return syncFunc(recipient_mail, sender_mail, data,  log);
}

function request_DOI(recipient_mail, sender_mail, data,  log, callback) {

  const dappUrl = getUrl(); //TODO this is default - alternatively get it from settings.json - alternatively get it from db
  //check if userId and Token is already in settings
  let dAppLogin = getSettings('doichain.dAppLogin');
  if(dAppLogin===undefined){ //if not in settings
    //get dApp username and password from settings and request a userId and token
    const dAppUsername = getSettings('doichain.dAppUsername','admin@doichain.org');
    let dAppPassword = getSettings('doichain.dAppPassword');

    //try default password 'password' in case dApp run's on localhost and password was not configured
    if(dAppPassword === undefined &&
        (dappUrl.indexOf("localhost")!=-1 || dappUrl.indexOf("127.0.0.1")!=-1)){
        dAppPassword = getSettings('doichain.dAppPassword',password);
    }

    const paramsLogin = {
      "username": dAppUsername,
      "password":dAppPassword
    };

    const urlLogin = dappUrl+'/api/v1/login';
    const headersLogin = [{'Content-Type':'application/json'}];

    const realDataLogin= { params: paramsLogin, headers: headersLogin };
    const resultLogin = HTTP.post(urlLogin, realDataLogin);
    if(resultLogin === undefined ||
        resultLogin.data === undefined ||
        resultLogin.data.data === undefined ){
      console.log(resultLogin === undefined);
      console.log(resultLogin.data === undefined);
        console.log(resultLogin.data === undefined);
      throw "login to Doichain dApp failed: "+dappUrl+" please check credentials"+JSON.stringify(resultLogin.data);
    }
    dAppLogin = getSettings('doichain.dAppLogin',resultLogin.data.data);
  }

  console.log('sendVerificationEmail over Doichain requested.',dAppLogin);

  const urlOptIn = dappUrl+'/api/v1/opt-in';
  let dataOptIn = {};

  if(data){
    dataOptIn = {
      "recipient_mail":recipient_mail,
      "sender_mail":sender_mail,
      "data":JSON.stringify(data)
    }
  }else{
    dataOptIn = {
      "recipient_mail":recipient_mail,
      "sender_mail":sender_mail
    }
  }

  const headersOptIn = {
    'Content-Type':'application/json',
    'X-User-Id':dAppLogin.userId,
    'X-Auth-Token':dAppLogin.authToken
  };

  try{
    const realDataOptIn = { data: dataOptIn, headers: headersOptIn};
    console.log(urlOptIn);
    console.log(dataOptIn);
    const resultOptIn = HTTP.post(urlOptIn, realDataOptIn);
    console.log(resultOptIn.data.status);
    
    if(resultOptIn.data === undefined || resultOptIn.data.status!=="success"){
        throw "login to Doichain dApp failed: "+dappUrl+" please check credentials"+JSON.stringify(resultOptIn);
    } 

    console.log("RETURNED VALUES: ",resultOptIn);
    callback(null,resultOptIn.data);
  }
  catch(e){
    callback(e,null);
  }
}

/**
 * Returns URL of local dApp to connect to for sending out DOI-requests
 * @returns String
 */
function getUrl() {
  let ssl = getSettings('app.ssl',false); //default true!
  let port = getSettings('app.port',3000);
  let host = getSettings('app.host','localhost');
  let protocol = "https://";
  if(!ssl) protocol = "http://";

  if(host!==undefined) return protocol+host+":"+port+"/";
  return Meteor.absoluteUrl();
}