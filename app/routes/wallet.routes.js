module.exports = app => {
    const wallets = require("../controllers/wallet.controller.js");
    var router = require("express").Router();

    // Get wallet's AVAX balance
    router.get("/getAvaxBalance", wallets.apiGetAvaxBalance);

    // Transfer EbricNFT ERC1155 Token 
    router.get("/transferToken", wallets.apiTransferToken);

    // Estimate Gas Fee for Transaction (gas price * gas amount)
    router.get("/estimateGasFee", wallets.apiEstimateGasFee);

    // Transfer AVAX for wallet to be able to bear 'Transfer Token' transaction gas fee
    router.get("/transferAvax", wallets.apiTransferAvax);
   
    app.use('/api/wallets', router);
  };