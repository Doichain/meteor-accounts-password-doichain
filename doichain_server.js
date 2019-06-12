import {Meteor} from "meteor/meteor";
import { HTTP } from 'meteor/http'
import { getSettings} from "meteor/doichain:settings";

const debug = getSettings('app.debug',true)
Meteor.startup(() => {
    //in case you use this package together with meteor-doichain-api  you might want to disable Accounts config here!
    //just add app.disableAccountsConfig=true in
    const accounts_disableConfig = getSettings('app.disableAccountsConfig',true)
    if(!accounts_disableConfig){
      console.log('accounts_disableConfig',accounts_disableConfig)
        Accounts.config({
            sendVerificationEmail: getSettings('accounts.sendVerificationEmail',true),
            forbidClientAccountCreation: getSettings('accounts.forbidClientAccountCreation',false)
        });
        Accounts.emailTemplates.from=getSettings('Accounts.emailTemplates.from','doichain@le-space.de');
    }
   _.extend(Accounts,{

    sendVerificationEmail: function(userId, email, extraTokenData){

      const {email: realEmail, user, token} = Accounts.generateVerificationToken(userId, email, extraTokenData);
      const url = Accounts.urls.verifyEmail(token);
      const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'verifyEmail');
      if(debug) console.log('now requesting email permission');
      //TODO - set request doi template via UI and db
      //TODO - personalized emails
      //TODO parse form data and store it inside dapp (use old feature of florian)
      try{
        requestDOI(options.to,options.from,null,true);
      }catch(ex){
        console.error('error occured on Doichain dApp - ',ex);
      }
      return {email: realEmail, user, token, url, options};
    },
    sendEnrollmentEmail: function(userId, email, extraTokenData){

      const {email: realEmail, user, token} = Accounts.generateResetToken(userId, email, 'enrollAccount', extraTokenData);
      const url = Accounts.urls.enrollAccount(token);
      const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'enrollAccount')
      if(debug) console.log('sendEnrollmentEmail over Doichain requested.');
      requestDOI(options.to,options.from,null,true);
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
    const dAppUsername = getSettings('doichain.dAppUsername','admin');
    let dAppPassword = getSettings('doichain.dAppPassword');

    //try default password 'password' in case dApp run's on localhost and password was not configured
    if(dAppPassword === undefined &&
        (dappUrl.indexOf("localhost")!=-1 || dappUrl.indexOf("127.0.0.1")!=-1)){
        dAppPassword = getSettings('doichain.dAppPassword',"password");
    }

    const paramsLogin = {
      "username": dAppUsername,
      "password":dAppPassword
    };

    const urlLogin = dappUrl+'/api/v1/login';
    const headersLogin = [{'Content-Type':'application/json'}];

    const realDataLogin= { params: paramsLogin, headers: headersLogin };
    
    if(debug) console.log("login:",realDataLogin);
    const resultLogin = HTTP.post(urlLogin, realDataLogin);
    if(debug) console.log(resultLogin);
    if(resultLogin === undefined ||
        resultLogin.data === undefined ||
        resultLogin.data.data === undefined ){
      
      if(debug) console.log(resultLogin === undefined);
      if(debug) console.log(resultLogin.data === undefined);
      if(debug) console.log(resultLogin.data === undefined);
      throw "login to Doichain dApp failed: "+dappUrl+" please check credentials"+JSON.stringify(resultLogin.data);
    }
    dAppLogin = getSettings('doichain.dAppLogin',resultLogin.data.data);
  }

  if(debug) console.log('sendVerificationEmail over Doichain requested.',dAppLogin);

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
    if(debug) console.log("urlOptIn",urlOptIn);
    if(debug) console.log("dataOptIn",dataOptIn);
    const resultOptIn = HTTP.post(urlOptIn, realDataOptIn);
    if(debug) console.log(resultOptIn.data.status);
    
    if(resultOptIn.data === undefined || resultOptIn.data.status!=="success"){
        throw "login to Doichain dApp failed: "+dappUrl+" please check credentials"+JSON.stringify(resultOptIn);
    }

    if(debug) console.log("RETURNED VALUES: ",resultOptIn);
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
  const ssl =  (getSettings('doichain.ssl',false)==='true'); //default true!
  const port = getSettings('doichain.port',3010); //default on testnet dApp
  const host = getSettings('doichain.host','localhost');
  let protocol = "https://";
  if(!ssl) protocol = "http://";

  if(host!==undefined) return protocol+host+":"+port;
  return Meteor.absoluteUrl();
}