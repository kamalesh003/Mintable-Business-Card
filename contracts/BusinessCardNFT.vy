# @version 0.4.0
"""
Business Card NFT Contract

This contract allows users to mint an NFT representing their business card.
Each NFT stores detailed metadata about the card, including the owner's name,
email, phone, company, position, and an Arweave URL pointing to additional data.
"""

# Define a struct to hold business card details
struct BusinessCard:
    name: String[64]
    email: String[64]
    phone: String[32]
    company: String[64]
    position: String[64]
    arweaveUrl: String[256]

# Event emitted when a new Business Card NFT is minted
event Mint:
    owner: indexed(address)
    tokenId: indexed(uint256)
    name: String[64]
    email: String[64]
    phone: String[32]
    company: String[64]
    position: String[64]
    arweaveUrl: String[256]

# Mappings for token ownership and business card data storage
owner_of: public(HashMap[uint256, address])
cards: public(HashMap[uint256, BusinessCard])
totalSupply: public(uint256)

@external
def mintNFT(
    name: String[64],
    email: String[64],
    phone: String[32],
    company: String[64],
    position: String[64],
    arweaveUrl: String[256]
) -> uint256:
    """
    Mint a new NFT representing a business card.

    Parameters:
      - name: Owner's full name.
      - email: Owner's email address.
      - phone: Owner's phone number.
      - company: Name of the company.
      - position: Owner's position in the company.
      - arweaveUrl: An Arweave URL with extended business card data.
      
    Returns:
      - tokenId: The unique identifier of the newly minted NFT.
    """
    tokenId: uint256 = self.totalSupply + 1
    self.totalSupply = tokenId
    self.owner_of[tokenId] = msg.sender

    # Create and store the business card details using kwargs instantiation
    card: BusinessCard = BusinessCard(
        name=name,
        email=email,
        phone=phone,
        company=company,
        position=position,
        arweaveUrl=arweaveUrl
    )
    self.cards[tokenId] = card

    log Mint(msg.sender, tokenId, name, email, phone, company, position, arweaveUrl)
    return tokenId


@external
@view
def getCard(tokenId: uint256) -> (String[64], String[64], String[32], String[64], String[64], String[256]):
    card: BusinessCard = self.cards[tokenId]
    return (card.name, card.email, card.phone, card.company, card.position, card.arweaveUrl)

