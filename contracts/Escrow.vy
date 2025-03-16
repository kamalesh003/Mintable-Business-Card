# @version 0.4.0
"""
Escrow Agreement using BusinessCardNFT and DIDRegistry

This contract ties escrow agreements to verified identities.
Both parties must have a registered DID, and the payee must own the specified BusinessCardNFT.
"""

# Interfaces to interact with external contracts
interface DIDRegistryInterface:
    def dids(user: address) -> String[64]: view

interface BusinessCardNFTInterface:
    def owner_of(tokenId: uint256) -> address: view

# Dynamic addresses for the external contracts
didRegistry: public(address)
businessCardNFT: public(address)

struct Escrow:
    sender: address
    payee: address
    amount: uint256
    nftId: uint256
    approved: bool
    active: bool

escrows: public(HashMap[uint256, Escrow])
escrowCount: public(uint256)

event EscrowCreated:
    escrowId: indexed(uint256)
    sender: indexed(address)
    payee: indexed(address)
    amount: uint256
    nftId: uint256

event EscrowApproved:
    escrowId: indexed(uint256)

event EscrowCancelled:
    escrowId: indexed(uint256)

event FundsWithdrawn:
    escrowId: indexed(uint256)
    payee: indexed(address)

@deploy
def __init__(_didRegistry: address, _businessCardNFT: address):
    """
    Constructor to set the addresses for the DIDRegistry and BusinessCardNFT contracts.
    """
    self.didRegistry = _didRegistry
    self.businessCardNFT = _businessCardNFT

@external
@payable
def createEscrow(nftId: uint256, payee: address):
    """
    Create an escrow agreement tied to a BusinessCardNFT.
    The sender deposits funds and specifies a payee along with the NFT ID that
    represents the payee’s verified business identity.
    """
    # Verify that both parties have a registered DID using staticcall
    sender_did: String[64] = staticcall(DIDRegistryInterface(self.didRegistry).dids(msg.sender))
    payee_did: String[64] = staticcall(DIDRegistryInterface(self.didRegistry).dids(payee))
    assert sender_did != "", "Sender DID not registered"
    assert payee_did != "", "Payee DID not registered"

    # Verify that the payee owns the specified NFT using staticcall
    nft_owner: address = staticcall(BusinessCardNFTInterface(self.businessCardNFT).owner_of(nftId))
    assert nft_owner == payee, "Payee does not own the specified NFT"

    escrowId: uint256 = self.escrowCount + 1
    self.escrows[escrowId] = Escrow(
        sender=msg.sender,
        payee=payee,
        amount=msg.value,
        nftId=nftId,
        approved=False,
        active=True
    )
    self.escrowCount = escrowId

    log EscrowCreated(escrowId, msg.sender, payee, msg.value, nftId)

@external
def approveRelease(escrowId: uint256):
    """
    Approve the release of funds.
    Only the sender (the party that created the escrow) can approve.
    """
    escrow: Escrow = self.escrows[escrowId]
    assert escrow.sender == msg.sender, "Only sender can approve"
    assert escrow.active, "Escrow is not active"
    self.escrows[escrowId].approved = True
    log EscrowApproved(escrowId)

@external
def cancelEscrow(escrowId: uint256):
    """
    Cancel the escrow agreement.
    The sender can cancel the escrow before approval, refunding the deposited funds.
    """
    escrow: Escrow = self.escrows[escrowId]
    assert escrow.sender == msg.sender, "Only sender can cancel"
    assert escrow.active, "Escrow already inactive"
    send(escrow.sender, escrow.amount)
    self.escrows[escrowId].active = False
    log EscrowCancelled(escrowId)

@external
def withdrawFunds(escrowId: uint256):
    """
    Withdraw funds from escrow.
    Once the sender approves, the payee can withdraw the funds.
    """
    escrow: Escrow = self.escrows[escrowId]
    assert escrow.payee == msg.sender, "Only payee can withdraw"
    assert escrow.approved, "Escrow not approved"
    assert escrow.active, "Escrow is inactive"
    send(escrow.payee, escrow.amount)
    self.escrows[escrowId].active = False
    log FundsWithdrawn(escrowId, msg.sender)
