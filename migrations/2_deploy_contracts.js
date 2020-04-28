var SMARegister = artifacts.require("./SMARegister.sol");

module.exports = function(deployer) {
  deployer.deploy(SMARegister);
};
