const HousingRentalSystemContract = artifacts.require("HousingRentalSystem");
const truffleAssert = require('truffle-assertions')

contract("HousingRentalSystem", (accounts) => {
    let contractInstance;

    before(async () => {
        contractInstance = await HousingRentalSystemContract.new({ from: accounts[0] });
    });

    it("should register a property", async () => {
        const result = await contractInstance.registerProperty('Paseo de la florida 18, 5ºE', 'Fabulosa casa con vistas al mar', 900, 1800, "Sergio", "684633978", "sergiofdez@gmail.com", { from: accounts[1] })

        truffleAssert.eventEmitted(result, 'PropertyAdded', ev => {
            return ev.propertyId.toNumber() === 1 && ev.landlord === accounts[1] && ev.price.toNumber() === 900;
        })
    });

    it("should not allow registration of a property with invalid data", async () => {

        await truffleAssert.reverts(contractInstance.registerProperty('Paseo de la florida 18, 5ºE', 'Fabulosa casa con vistas al mar', 0, 1800, "Sergio", "684633978", "sergiofdez@gmail.com", { from: accounts[1] }), 'Price must be greater than 0')
    });

    it("should rent a property", async () => {
        // Write test logic to call the rentProperty function and verify that it works as expected.
    });

    it("should not allow renting an invalid property", async () => {
        // Test cases where renting should fail, for example, with an invalid property ID.
    });

    it("should not allow renting an already rented property", async () => {
        // Test cases where renting should fail if the property is already rented.
    });

    it("should accept a lease agreement", async () => {
        // Write test logic to call the acceptLeaseAgreement function and verify that it works as expected.
    });

    it("should not accept an invalid lease agreement", async () => {
        // Test cases where accepting a lease agreement should fail, for example, if the agreement is in an invalid state.
    });

    it("should pay rent for a lease agreement", async () => {
        // Write test logic to call the payRent function and verify that it works as expected.
    });

    it("should not pay rent for an invalid lease agreement", async () => {
        // Test cases where paying rent should fail, for example, with an invalid agreement ID.
    });

    it("should return a property", async () => {
        // Write test logic to call the returnProperty function and verify that it works as expected.
    });

    it("should not return an invalid lease agreement", async () => {
        // Test cases where returning a property should fail, for example, with an invalid agreement ID.
    });

    it("should not return a property if the lease agreement is in an invalid state", async () => {
        // Test cases where returning a property should fail if the agreement is in an invalid state.
    });
});
