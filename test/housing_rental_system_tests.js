const HousingRentalSystemContract = artifacts.require("HousingRentalSystem");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions')

contract("HousingRentalSystem", (accounts) => {
    let contractInstance;

    before(async () => {
        contractInstance = await HousingRentalSystemContract.new({ from: accounts[0] });
    });

    it("should register a property", async () => {
        const result = await contractInstance.registerProperty('Paseo de la florida 18, 5ºE', 'Fabulosa casa con vistas al mar', 900, 1800, "Sergio", "666999666", "sergiofdez@gmail.com", { from: accounts[1] })

        truffleAssert.eventEmitted(result, 'PropertyAdded', ev => {
            return ev.propertyId.toNumber() === 1 && ev.landlord === accounts[1] && ev.price.toNumber() === 900;
        })
    });

    it("should not allow registration of a property with invalid data", async () => {
        await truffleAssert.reverts(contractInstance.registerProperty('Paseo de la florida 18, 5ºE', 'Fabulosa casa con vistas al mar', 0, 1800, "Sergio", "666999666", "sergiofdez@gmail.com", { from: accounts[1] }), 'Price must be greater than 0')
    });

    it("should rent a property", async () => {
        const tenant = {
            id: accounts[2],
            name: "Jordan",
            phoneNumber: "624874852",
            email: "jordan@uniovi.es"
        }

        const result = await contractInstance.rentProperty(
            tenant,
            1,
            12,
            1800,
            { from: accounts[2], value: 900 * 12 }
        )

        truffleAssert.eventEmitted(result, 'LeaseAgreementProposal', ev => {
            return ev.leaseAgreementCount.toNumber() === 1 && ev.tenant === accounts[2] && ev.propertyId.toNumber() === 1;
        })
    });

    it("should not allow renting an invalid property (invalid ID)", async () => {
        const tenant = {
            id: accounts[2],
            name: "Jordan",
            phoneNumber: "624874852",
            email: "jordan@uniovi.es"
        }

        await truffleAssert.reverts(contractInstance.rentProperty(
            tenant,
            200,
            12,
            1800,
            { from: accounts[2], value: 900 * 12 }), 'Invalid property ID')
    });

    //TODO review
    // it("should not allow renting an already rented property", async () => {
    //     // Test cases where renting should fail if the property is already rented.
    //     const tenant = {
    //         id: accounts[2],
    //         name: "Jordan",
    //         phoneNumber: "624874852",
    //         email: "jordan@uniovi.es"
    //     }

    //     await truffleAssert.reverts(contractInstance.rentProperty(
    //         tenant,
    //         1,
    //         12,
    //         1800,
    //         { from: accounts[2], value: 900 * 12 }), 'Property is already rented')
    // });

    it("should not allow renting a property with invalid deposit", async () => {
        await contractInstance.registerProperty('Paseo de la florida 18, 5ºE', 'Fabulosa casa con vistas al mar', 900, 1800, "Sergio", "666999666", "sergiofdez@gmail.com", { from: accounts[1] })
        const tenant = {
            id: accounts[2],
            name: "Jordan",
            phoneNumber: "624874852",
            email: "jordan@uniovi.es"
        }

        await truffleAssert.reverts(contractInstance.rentProperty(
            tenant,
            2,
            12,
            1799,
            { from: accounts[2], value: 900 * 12 }), 'Deposit does not match to the property deposit')
    });

    it("should accept a lease agreement", async () => {
        await contractInstance.acceptLeaseAgreement(1, { from: accounts[2] })
        const agreements = await contractInstance.getRegisteredLeaseAgreement()
        assert.equal(agreements[0].state, 1)
    });

    it("should not accept an invalid lease agreement (Invalid State)", async () => {

    });

    it("should pay rent for a lease agreement", async () => {
        await contractInstance.payRent(1, { from: accounts[2], value: 900 })
        const agreements = await contractInstance.getRegisteredLeaseAgreement()
        assert.equal(agreements[0].totalRentPaid, 900)
    });

    it("should not pay rent for an invalid lease agreement (Incorrect rent amount)", async () => {
        await truffleAssert.reverts(contractInstance.payRent(1, { from: accounts[2], value: 800 }), 'Incorrect Rent amount')
    });

    it("should return a property", async () => {
        const result = await contractInstance.returnProperty(1, { from: accounts[2] })
        const agreements = await contractInstance.getRegisteredLeaseAgreement()
        assert.equal(agreements[0].state, 2)
        const properties = await contractInstance.getRegisteredProperties()
        assert.equal(properties[0].isRented, false)
        truffleAssert.eventEmitted(result, 'PropertyReturned', ev => {
            return ev.agreementId.toNumber() === 1;
        })
    });

    it("should not return a property if the lease agreement is in an invalid state", async () => {
        // Test cases where returning a property should fail if the agreement is in an invalid state.
    });
});
