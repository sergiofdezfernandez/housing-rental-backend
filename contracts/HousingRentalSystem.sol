// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

contract HousingRentalSystem {
  enum State {
    Created,
    Started,
    Terminated
  }

  struct Landlord {
    address payable id;
    string name;
    string phoneNumber;
    string email;
  }

  struct Tenant {
    address payable id;
    string name;
    string phoneNumber;
    string email;
  }

  struct Property {
    uint256 id;
    Landlord landlord;
    string postalAddress;
    string description;
    uint price;
    uint securityDeposit;
    bool isRented;
  }

  struct LeaseAgreement {
    uint256 id;
    Tenant tenant;
    Property property;
    uint leaseStart;
    uint leaseDuration;
    uint totalRentPaid;
    State state;
  }

  mapping(uint256 => Property) public properties;
  uint256 public propertiesCount;
  uint256[] public propertiesKeys;
  mapping(uint256 => LeaseAgreement) public leaseAgreements;
  uint256 public leaseAgreementCount;
  uint256[] public leaseAgreementKeys;

  event PropertyAdded(uint256 propertyId, address payable landlord, uint256 price);
  event PropertyReturned(uint256 agreementId);
  event PropertyProposalRent(uint256 agreementId, address payable tenant, uint256 houseId, uint256 duration);
  event PropertyPaid(uint256 agreementId, uint256 amount);
  event LeaseAgreementProposal(uint256 leaseAgreementCount, address payable tenant, uint propertyId);

  constructor() {
    propertiesCount = 0;
    leaseAgreementCount = 0;
  }

  function registerProperty(
    string memory postalAddress,
    string memory description,
    uint price,
    uint securityDeposit,
    string memory landlordName,
    string memory landlordPhone,
    string memory landlordEmail
  ) external {
    require(price > 0, 'Price must be greater than 0');
    propertiesCount++;
    properties[propertiesCount] = Property({
      id: propertiesCount,
      landlord: Landlord({ id: payable(msg.sender), name: landlordName, phoneNumber: landlordPhone, email: landlordEmail }),
      description: description,
      postalAddress: postalAddress,
      price: price,
      securityDeposit: securityDeposit,
      isRented: false
    });
    propertiesKeys.push(propertiesCount);
    emit PropertyAdded(propertiesCount, payable(msg.sender), price);
  }

  function rentProperty(Tenant memory tenant, uint256 propertyId, uint256 duration, uint256 deposit) public payable {
    Property memory property = properties[propertyId];
    require(propertyId <= propertiesCount && propertyId > 0, 'Invalid property ID');
    require(!property.isRented, 'Property is already rented');
    require(msg.value == properties[propertyId].price * duration, 'Insufficient payment');
    require(deposit == property.securityDeposit, 'Deposit does not match to the property deposit');
    property.isRented = true;
    leaseAgreementCount++;

    leaseAgreements[leaseAgreementCount] = LeaseAgreement({
      id: leaseAgreementCount,
      tenant: tenant,
      property: property,
      leaseStart: block.timestamp,
      leaseDuration: duration,
      totalRentPaid: 0,
      state: State.Created
    });
    leaseAgreementKeys.push(leaseAgreementCount);
    emit LeaseAgreementProposal(leaseAgreementCount, payable(msg.sender), propertyId);
  }

  function getRegisteredProperties() external view returns (Property[] memory) {
    Property[] memory result = new Property[](propertiesKeys.length);
    for (uint256 i = 0; i < propertiesKeys.length; i++) {
      result[i] = properties[propertiesKeys[i]];
    }
    return result;
  }

  modifier onlyTenant(uint256 agreementId) {
    require(msg.sender == leaseAgreements[agreementId].tenant.id, 'Only the tenant can perform this action');
    _;
  }

  function getRegisteredLeaseAgreement() external view returns (LeaseAgreement[] memory) {
    LeaseAgreement[] memory result = new LeaseAgreement[](leaseAgreementKeys.length);
    for (uint256 i = 0; i < leaseAgreementKeys.length; i++) {
      result[i] = leaseAgreements[leaseAgreementKeys[i]];
    }
    return result;
  }

  function acceptLeaseAgreement(uint256 agreementId) external onlyTenant(agreementId) {
    require(leaseAgreements[agreementId].state == State.Created, 'LeaseAgreement is in an invalid state');
    LeaseAgreement storage agreement = leaseAgreements[agreementId];
    agreement.state = State.Started;
  }

  function getBalance() external view returns (uint256) {
    return address(this).balance;
  }

  function payRent(uint256 agreementId) external payable onlyTenant(agreementId) {
    LeaseAgreement storage agreement = leaseAgreements[agreementId];
    require(agreement.state == State.Started, 'LeaseAgreement is in an invalid state');
    require(msg.value == properties[agreement.id].price, 'Incorrect Rent amount');
    agreement.totalRentPaid += msg.value;
  }

  function returnProperty(uint256 agreementId) external payable onlyTenant(agreementId) {
    require(agreementId <= leaseAgreementCount && agreementId > 0, 'Invalid agreement ID');
    LeaseAgreement storage agreement = leaseAgreements[agreementId];
    require(agreement.state == State.Started, 'LeaseAgreement is in an invalid state');
    agreement.state = State.Terminated;
    properties[agreement.property.id].isRented = false;
    uint256 rentAmount = properties[agreement.id].price * agreement.leaseDuration;
    payable(msg.sender).transfer(rentAmount);
    emit PropertyReturned(agreementId);
  }
}
