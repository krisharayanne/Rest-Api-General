const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("https://api.avax-test.network/ext/bc/C/rpc"))

async function getAvaxBalance(walletAddress) {
    try{
    let rawUserAvaxBalance = await web3.eth.getBalance(walletAddress);
    let userAvaxBalance = await web3.utils.fromWei(rawUserAvaxBalance, "ether");
    return userAvaxBalance;
    }
    catch(error) {
        let errorObject = {
            "errorMessage" : error
        }
        return errorObject;
    }
}

module.exports = {
    getAvaxBalance
}
