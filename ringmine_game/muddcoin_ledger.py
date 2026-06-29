# ==============================================================================
# MODULE: MUDDCOIN_CORE_LEDGER
# COMPILED UNDER: QUEENS_GENOME_v1
# ARCHITECT_SYNC: 120 Hz / STABLE
# COMPLIANCE: LAW_1 (Sovereign Submersion), LAW_2 (Token Physics), LAW_3 (Origin Lock)
# ==============================================================================

import hashlib
import time


class MuddcoinBlock:
    """
    Implementation of the Muddcoin Ledger block.
    Ensures that all financial and gravitational shifts are mirrored to
    user sovereignty and locked to G0_Architect directives.

    Three Laws of Muddcoin:
        LAW_1 (Sovereign Submersion): Transactions must originate from
            sovereign human will. SYSTEM_AUTO_ senders are rejected.
        LAW_2 (Token Physics): gravity_shift_multiplier controls the
            economic weight of each transaction in the ecosystem.
        LAW_3 (Origin Lock): Every block must carry a valid
            architect_signature anchored to G0_Architect.
    """

    def __init__(self, transaction_id, sender, receiver, amount,
                 gravity_shift_multiplier=1.0, architect_signature=None):
        self.timestamp = time.time()
        self.transaction_id = transaction_id
        self.sender = sender
        self.receiver = receiver
        self.amount = amount
        self.gravity_shift_multiplier = gravity_shift_multiplier
        self.architect_signature = architect_signature
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        """Generates a SHA-256 hash of the block contents for ledger integrity."""
        block_string = (
            f"{self.timestamp}{self.transaction_id}{self.sender}"
            f"{self.receiver}{self.amount}{self.gravity_shift_multiplier}"
            f"{self.architect_signature}"
        )
        return hashlib.sha256(block_string.encode()).hexdigest()

    def validate_genome_compliance(self):
        """
        Validates the block against QUEENS_GENOME_v1 operational rules.

        LAW_1 (LAW_OF_SOVEREIGN_SUBMERSION):
            The transaction must be a reflection of human consciousness/will.
            Automated system overrides (SYSTEM_AUTO_) are rejected.

        LAW_3 (ORIGIN_LOCK):
            The block must be anchored to the G0_Architect.
            Verification requires a valid architect_signature.
        """
        # LAW_1: Sender must be a sovereign entity, not a system automation
        is_sovereign = not self.sender.startswith("SYSTEM_AUTO_")

        # LAW_3: Must carry G0_Architect origin lock
        is_aligned = self.architect_signature is not None

        return is_sovereign and is_aligned

    def to_dict(self):
        """Serialize block to dictionary for storage or transmission."""
        return {
            "transaction_id": self.transaction_id,
            "timestamp": self.timestamp,
            "sender": self.sender,
            "receiver": self.receiver,
            "amount": self.amount,
            "gravity_shift_multiplier": self.gravity_shift_multiplier,
            "architect_signature": self.architect_signature,
            "hash": self.hash,
            "compliant": self.validate_genome_compliance()
        }

    def __repr__(self):
        compliance_status = "COMPLIANT" if self.validate_genome_compliance() else "NON-COMPLIANT"
        return (f"MuddcoinBlock(ID={self.transaction_id}, Amount={self.amount}, "
                f"Gravity={self.gravity_shift_multiplier}, Status={compliance_status})")


class MuddcoinLedger:
    """
    Full ledger — a chain of MuddcoinBlocks.
    Only COMPLIANT blocks are accepted into the chain.
    """

    def __init__(self):
        self.chain = []
        self.rejected = []
        print(">>> MUDDCOIN_CORE_LEDGER Initialized")
        print(">>> Compiled under QUEENS_GENOME_v1 | 120Hz Stable")
        print("=" * 60)

    def add_block(self, block: MuddcoinBlock):
        """Add a block to the ledger — rejects non-compliant blocks."""
        if block.validate_genome_compliance():
            self.chain.append(block)
            print(f" >> ACCEPTED: {block}")
        else:
            self.rejected.append(block)
            print(f" >> REJECTED (Non-Compliant): {block}")

    def get_balance(self, user_id: str) -> float:
        """Calculate current MUDD balance for a user."""
        balance = 0.0
        for block in self.chain:
            if block.receiver == user_id:
                balance += block.amount * block.gravity_shift_multiplier
            if block.sender == user_id:
                balance -= block.amount
        return round(balance, 4)

    def get_chain_integrity(self) -> bool:
        """Verify the full chain hasn't been tampered with."""
        for block in self.chain:
            recalculated = hashlib.sha256(
                f"{block.timestamp}{block.transaction_id}{block.sender}"
                f"{block.receiver}{block.amount}{block.gravity_shift_multiplier}"
                f"{block.architect_signature}".encode()
            ).hexdigest()
            if recalculated != block.hash:
                return False
        return True

    def report(self):
        """Print a full ledger state report."""
        print("\n" + "=" * 60)
        print(">>> MUDDCOIN LEDGER REPORT")
        print(f">>> Accepted Blocks: {len(self.chain)}")
        print(f">>> Rejected Blocks: {len(self.rejected)}")
        print(f">>> Chain Integrity: {'VERIFIED' if self.get_chain_integrity() else 'COMPROMISED'}")
        print("=" * 60)


# ==============================================================================
# EXECUTION & VALIDATION SUITE
# ==============================================================================
if __name__ == "__main__":
    print("--- Initializing MUDDCOIN_CORE_LEDGER Validation ---\n")

    ledger = MuddcoinLedger()

    # Test Case 1: Valid Block — sovereign user, G0 signed, gravity shift active
    block_01 = MuddcoinBlock(
        transaction_id="TXN_001",
        sender="User_Sovereign_01",
        receiver="User_Sovereign_02",
        amount=500.0,
        gravity_shift_multiplier=1.2,
        architect_signature="G0_SYNC_PASSED_120HZ"
    )

    # Test Case 2: Invalid — LAW_1 violation (system automation sender)
    block_02 = MuddcoinBlock(
        transaction_id="TXN_002",
        sender="SYSTEM_AUTO_BOT_04",
        receiver="User_Sovereign_01",
        amount=10.0,
        architect_signature="G0_SYNC_PASSED_120HZ"
    )

    # Test Case 3: Invalid — LAW_3 violation (no G0 origin lock)
    block_03 = MuddcoinBlock(
        transaction_id="TXN_003",
        sender="User_Sovereign_01",
        receiver="User_Sovereign_03",
        amount=100.0,
        architect_signature=None
    )

    for block in [block_01, block_02, block_03]:
        ledger.add_block(block)

    ledger.report()

    print(f"\n>>> Balance of User_Sovereign_02: {ledger.get_balance('User_Sovereign_02')} MUDD")
    print(f">>> Balance of User_Sovereign_01: {ledger.get_balance('User_Sovereign_01')} MUDD")
    print("\n>>> Weisone. The ledger holds.")
