var HousingRentalSystem = artifacts.require("HousingRentalSystem");

module.exports = function (deployer) {
  deployer.deploy(HousingRentalSystem).then(() => {
    return deployer.deploy(HousingRentalSystem);
  });
};
