require("dotenv").config();
const CircularJSON = require('circular-json')
const fs = require('fs')
const envfile = require('envfile')
const sourcePath = '.env'
// const encryptionService = require("./encryptPrivateKey.js")
// const decryptionService = require("./decryptPrivateKey.js")
// const walletService = require("./generateWallet.js")
const balanceService = require("./getAvaxBalance.js")
const tokenService = require("./transferToken.js")
const gasService = require("./estimateGasFee.js")
const avaxService = require("./transferAvax.js")
let https = require('https');
const axios = require('axios').default;

// Get wallet's AVAX balance
async function apiGetAvaxBalance(req, res) {
 // Validate request
 if (!req.body.userWalletAddress) {
    res.status(400).send({ message: "Please send user's wallet address!" });
    return;
  }

   // Get AVAX Balance function
   let userWalletAddress = req.body.userWalletAddress.toString();
   let userAvaxBalance = await getAvaxBalance(userWalletAddress);

   if(userAvaxBalance.errorMessage){
    res.status(400).send({ message: userAvaxBalance.errorMessage });
   }
   else{
   console.log("\n User's AVAX Balance (Main): " + userAvaxBalance + " AVAX");
   res.status(200).send({ message: "User's AVAX Balance: " + userAvaxBalance });
   }
 
}

async function getAvaxBalance(walletAddress) {
    let userAvaxBalance = balanceService.getAvaxBalance(walletAddress);
    return userAvaxBalance;
}

// Transfer EbricNFT ERC1155 Token 
async function apiTransferToken(req, res) {

    if (!req.body.sellerWalletAddress) {
        res.status(400).send({ message: "Please send seller's wallet address!" });
        return;
    }
    else if (!req.body.buyerWalletAddress) {
        res.status(400).send({ message: "Please send buyer's wallet address!" });
        return;
    }
    else if (!req.body.sellerEncryptedPrivateKey) {
        res.status(400).send({ message: "Please send seller's encrypted private key!" });
        return;
    }
    else if (!req.body.tokenId) {
        res.status(400).send({ message: "Please send token ID!" });
        return;
    }
    else if (!req.body.tokenQuantity) {
        res.status(400).send({ message: "Please send token quantity!" });
        return;
    }
     // Transfer EbricNFT Token Function
     let sellerWalletAddress = req.body.sellerWalletAddress.toString();
     let buyerWalletAddress = req.body.buyerWalletAddress.toString();
     let sellerEncryptedPrivateKey = req.body.sellerEncryptedPrivateKey.toString();
     let tokenId = parseInt(req.body.tokenId.toString());
     let tokenQuantity = parseInt(req.body.tokenQuantity.toString());
     let transaction = await transferToken(sellerWalletAddress, buyerWalletAddress, sellerEncryptedPrivateKey, tokenId, tokenQuantity);

     if(transaction.errorMessage) {
        res.status(400).send({ message: transaction.errorMessage });
     }
     else{
     let transactionObject = {
        "transactionHash": transaction.transactionHash,
        "tokenId": transaction.returnedTokenId
     }
     res.status(200).send({ message: transactionObject });
    }

}

async function transferToken(sellerWalletAddress, buyerWalletAddress, sellerEncryptedPrivateKey, specifiedTokenId, tokenQuantity) {
let response;
    
  try{

    response = await axios({
        method: 'post',
        url: 'https://many-news-run-202-186-86-92.loca.lt/api/wallets',
        data: {
          encryptedPrivateKey: sellerEncryptedPrivateKey,
        }
      });

    }
    catch(error) {
  
      let errorObject = {
          "errorMessage" : error.response.data.message
      }
      return errorObject;
      
    }

     
      let decryptedPrivateKey = response.data.message.decryptedPrivateKey;
    //   console.log(response.data.message.decryptedPrivateKey);
    //   .then(function (response) {
    //     console.log(response.data.message.decryptedPrivateKey);
    //   }).catch(function (error) {
    //     console.log(error);
    //   });


      


    // // decrypt Ebric user's (seller) encrypted private key using cryptographic private key
    // let decryptedPrivateKey = decryptionService.decryptPrivateKey(Buffer.from(sellerEncryptedPrivateKey, 'base64'))
    let transaction = await tokenService.transferToken(sellerWalletAddress, buyerWalletAddress, decryptedPrivateKey.toString(), specifiedTokenId, tokenQuantity)
    if(transaction.errorMessage) {
        let errorObject = {
            "errorMessage" : transaction.errorMessage
        }
        return errorObject;
    }
    else{
    return {
        "transactionHash": transaction.transactionHash,
        "returnedTokenId": transaction.tokenId
    }

}

  



}

// Estimate Gas Fee for Transaction (gas price * gas amount)
async function apiEstimateGasFee(req, res) {

    if (!req.body.sellerWalletAddress) {
        res.status(400).send({ message: "Please send seller's wallet address!" });
        return;
    }
    else if (!req.body.buyerWalletAddress) {
        res.status(400).send({ message: "Please send buyer's wallet address!" });
        return;
    }
    else if (!req.body.sellerEncryptedPrivateKey) {
        res.status(400).send({ message: "Please send seller's encrypted private key!" });
        return;
    }
    else if (!req.body.tokenId) {
        res.status(400).send({ message: "Please send token ID!" });
        return;
    }
    else if (!req.body.tokenQuantity) {
        res.status(400).send({ message: "Please send token quantity!" });
        return;
    }

    let sellerWalletAddress = req.body.sellerWalletAddress.toString();
     let buyerWalletAddress = req.body.buyerWalletAddress.toString();
     let sellerEncryptedPrivateKey = req.body.sellerEncryptedPrivateKey.toString();
     let tokenId = parseInt(req.body.tokenId.toString());
     let tokenQuantity = parseInt(req.body.tokenQuantity.toString());
    // Estimate Gas Fee Function
    let transaction = await estimateGasFee(sellerWalletAddress, buyerWalletAddress, sellerEncryptedPrivateKey, tokenId, tokenQuantity);
    if(transaction.errorMessage) {
        res.status(400).send({ message: transaction.errorMessage });
     }
     else{
    res.status(200).send({ message: transaction });
     }

}

async function estimateGasFee(sellerWalletAddress, buyerWalletAddress, sellerEncryptedPrivateKey, specifiedTokenId, tokenQuantity) {
let response;

try {
    response = await axios({
        method: 'post',
        url: 'https://many-news-run-202-186-86-92.loca.lt/api/wallets',
        data: {
          encryptedPrivateKey: sellerEncryptedPrivateKey,
        }
      });
    }
    catch(error) {
  
      let errorObject = {
          "errorMessage" : error.response.data.message
      }
      return errorObject;
      
    }

      let decryptedPrivateKey = response.data.message.decryptedPrivateKey;

    // // decrypt Ebric user's (seller) encrypted private key using cryptographic private key
    // let decryptedPrivateKey = decryptionService.decryptPrivateKey(Buffer.from(sellerEncryptedPrivateKey, 'base64'))
    let transaction = await gasService.estimateGasFee(sellerWalletAddress, buyerWalletAddress, decryptedPrivateKey.toString(), specifiedTokenId, tokenQuantity)
    if(transaction.errorMessage) {
        let errorObject = {
            "errorMessage" : transaction.errorMessage
        }
        return errorObject;
    }
    else{
    return {
        "gasFeeInAvax" : transaction.gasFeeInAvax
    }
    }
}

// Transfer AVAX for wallet to be able to bear 'Transfer Token' transaction gas fee
async function apiTransferAvax(req, res) {
    if (!req.body.receiverWalletAddress) {
        res.status(400).send({ message: "Please send receiver's wallet address!" });
        return;
    }
    else if (!req.body.tokenQuantity) {
        res.status(400).send({ message: "Please send token quantity!" });
        return;
    }

     // Transfer AVAX Function 
     let receiverWalletAddress = req.body.receiverWalletAddress;
     let avaxQuantity = req.body.tokenQuantity;
     let transaction = await transferAvax(receiverWalletAddress, avaxQuantity);
     if(transaction.errorMessage) {
        res.status(400).send({ message: transaction.errorMessage });
     }
     else{
    res.status(200).send({ message: transaction });
     }
}

async function transferAvax(receiverWalletAddress, avaxQuantity) {
    let companyEncryptedPrivateKey = process.env.COMPANY_ENCRYPTED_PRIVATE_KEY;
    let response;

    try{
    response = await axios({
        method: 'post',
        url: 'https://many-news-run-202-186-86-92.loca.lt/api/wallets',
        data: {
          encryptedPrivateKey: companyEncryptedPrivateKey,
        }
      });
    }
    catch(error) {
  
      let errorObject = {
          "errorMessage" : error.response.data.message
      }
      return errorObject;
      
    }

      let decryptedPrivateKey = response.data.message.decryptedPrivateKey;
      

    // // decrypt Ebric user's (seller) encrypted private key using cryptographic private key
    // let decryptedPrivateKey = decryptionService.decryptPrivateKey(Buffer.from(process.env.COMPANY_ENCRYPTED_PRIVATE_KEY, 'base64'))
    let transaction = await avaxService.transferAvax(decryptedPrivateKey.toString(), receiverWalletAddress, avaxQuantity);
    if(transaction.errorMessage) {
        let errorObject = {
            "errorMessage" : transaction.errorMessage
        }
        return errorObject;
    }
    else{
    return {
        "avaxTransactionHash" : transaction.avaxTransactionHash
    }
    }
}

module.exports = {
    apiGetAvaxBalance,
    apiTransferToken,
    apiEstimateGasFee,
    apiTransferAvax
}