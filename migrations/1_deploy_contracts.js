var RentalAgreement = artifacts.require("RentalAgreement");

module.exports = function (deployer) {
  deployer.deploy(RentalAgreement).then(() => {
    console.log("token Address: " + tokenDeployed.address);
    return deployer.deploy(RentalAgreement);
  });
};
