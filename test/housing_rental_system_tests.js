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
            { from: accounts[2], value: 900 }
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
            { from: accounts[2], value: 900 }), 'Invalid property ID')
    });

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
            { from: accounts[2], value: 900 }), 'Deposit does not match to the property deposit')
    });

    it("should accept a lease agreement", async () => {
        await contractInstance.acceptLeaseAgreement(1, { from: accounts[2] })
        const agreements = await contractInstance.getRegisteredLeaseAgreement()
        assert.equal(agreements[0].state, 1)
    });

    it("should pay rent for a lease agreement", async () => {
        await contractInstance.payRent(1, { from: accounts[2], value: 900 })
        const agreements = await contractInstance.getRegisteredLeaseAgreement()
        assert.equal(agreements[0].totalRentPaid, 900)
    });

    it("should not pay rent for an invalid lease agreement (Incorrect rent amount)", async () => {
        await truffleAssert.reverts(contractInstance.payRent(1, { from: accounts[2], value: 30000 }), 'Incorrect Rent amount')
    });


    it("should return contract balance after some payments", async () => {
        const result = await contractInstance.getBalance();
        // 2 leaseAgreements payed
        assert.equal(result.toNumber(), 1800)
    });

    it("should return a property", async () => {
        await contractInstance.payRent(1, { from: accounts[2], value: 900 * 11 })
        const result = await contractInstance.returnProperty(1, { from: accounts[2] })
        const agreements = await contractInstance.getRegisteredLeaseAgreement()
        assert.equal(agreements[0].state, 2)
        const properties = await contractInstance.getRegisteredProperties()
        assert.equal(properties[0].isRented, false)
        truffleAssert.eventEmitted(result, 'PropertyReturned', ev => {
            return ev.agreementId.toNumber() === 1;
        })
    });

    it("should return contract balance after return property", async () => {
        const result = await contractInstance.getBalance();
        assert.equal(result.toNumber(), 900)
    });

    it("should not return a property if the lease agreement is in an invalid state", async () => {
        const tenant = {
            id: accounts[3],
            name: "Manolo",
            phoneNumber: "624874852",
            email: "manolo@uniovi.es"
        }
        await contractInstance.rentProperty(
            tenant,
            1,
            12,
            1800,
            { from: accounts[2], value: 900 }
        )
        const agreements = await contractInstance.getRegisteredLeaseAgreement()
        assert.equal(agreements[1].state, 0)
        await truffleAssert.reverts(contractInstance.returnProperty(2, { from: accounts[3] }), 'LeaseAgreement is in an invalid state')
    });

    it("should not return a property if rents have not been payed yet", async () => {
        const tenant = {
            id: accounts[3],
            name: "Manolo",
            phoneNumber: "624874852",
            email: "manolo@uniovi.es"
        }
        await contractInstance.acceptLeaseAgreement(2, { from: accounts[3] })
        await contractInstance.rentProperty(
            tenant,
            2,
            12,
            1800,
            { from: accounts[2], value: 900 }
        )
        const agreements = await contractInstance.getRegisteredLeaseAgreement()
        assert.equal(agreements[2].state, 0)
        await truffleAssert.reverts(contractInstance.returnProperty(2, { from: accounts[3] }), 'Not all contract rents have been paid yet')
    });

    it("should not allow renting an already rented property", async () => {
        const tenant = {
            id: accounts[4],
            name: "Sara",
            phoneNumber: "624874852",
            email: "sara@uniovi.es"
        }
        await truffleAssert.reverts(contractInstance.rentProperty(
            tenant,
            1,
            12,
            1800,
            { from: accounts[4], value: 900 }), 'Property is already rented')
    });
});
