# @version 0.4.0
"""
DID Registry Contract

Allows an account to register its decentralized identifier (DID).
"""

event DIDRegistered:
    user: indexed(address)
    did: String[64]

dids: public(HashMap[address, String[64]])

@external
def registerDID(did: String[64]):
    """
    Register a decentralized identifier (DID) for the caller.
    """
    self.dids[msg.sender] = did
    log DIDRegistered(msg.sender, did)
