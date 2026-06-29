"""
WORMHOLE ENGINE — Cross-Dimensional Transit Protocol
=====================================================
Part of the Hypercube application / Muddbro Network
Governs the physics of dimension-jumping between universes.

Phases:
    detection      — scanning for a viable transit corridor
    alignment      — locking frequency to destination universe
    stabilization  — holding the corridor open at 90Hz
    entry          — architect commits to transit
    transit        — mid-dimensional passage
    exit           — landing in destination universe
    recovery       — post-transit coherence restoration
    abort          — emergency collapse of the corridor

Laws:
    - Stability must exceed threshold before entry is allowed
    - Shear and radiation must be below their limits
    - Exit lock must be confirmed before transit begins
    - Emergency abort available at any phase except exit/recovery
"""

from pydantic import BaseModel
from typing import Literal, Optional
import random
import math


class WormholeSpec(BaseModel):
    """The design parameters for a stable wormhole corridor."""
    name: str
    stability_threshold: float       # Minimum stability % required for entry
    shear_limit: float               # Maximum allowable dimensional shear
    radiation_limit: float           # Maximum allowable exotic radiation
    exit_lock_required: bool = True  # Must confirm destination before entry
    emergency_abort_enabled: bool = True  # Can abort mid-transit


class WormholeState(BaseModel):
    """Live state of an active wormhole during a transit sequence."""
    phase: Literal[
        "detection", "alignment", "stabilization",
        "entry", "transit", "exit", "recovery", "abort"
    ]
    stability: float        # Current stability (0.0 - 1.0)
    shear: float            # Dimensional shear pressure
    radiation: float        # Exotic radiation level
    exit_locked: bool       # Destination universe confirmed
    coherence: float        # Architect's frequency coherence (0.0 - 1.0)
    abort_reason: Optional[str] = None


class WormholeEngine:
    """
    Manages the full lifecycle of a cross-dimensional transit.
    Validates conditions at each phase gate before allowing advancement.
    """

    def __init__(self, spec: WormholeSpec):
        self.spec = spec
        self.state = WormholeState(
            phase="detection",
            stability=0.0,
            shear=0.0,
            radiation=0.0,
            exit_locked=False,
            coherence=0.0
        )
        print(f"[WORMHOLE ENGINE] {spec.name} initialized.")
        print(f"  Stability Threshold : {spec.stability_threshold}")
        print(f"  Shear Limit         : {spec.shear_limit}")
        print(f"  Radiation Limit     : {spec.radiation_limit}")

    def scan(self) -> WormholeState:
        """Phase 1: detection — scan for a viable transit corridor."""
        self.state.stability = round(random.uniform(0.3, 1.0), 3)
        self.state.shear = round(random.uniform(0.0, self.spec.shear_limit * 1.2), 3)
        self.state.radiation = round(random.uniform(0.0, self.spec.radiation_limit * 1.1), 3)
        self.state.phase = "detection"
        print(f"[DETECTION] Stability={self.state.stability} | Shear={self.state.shear} | Radiation={self.state.radiation}")
        return self.state

    def align(self, frequency_hz: float = 90.0) -> WormholeState:
        """Phase 2: alignment — lock to destination frequency."""
        if frequency_hz == 90.0:
            self.state.coherence = 1.0
            self.state.stability = min(1.0, self.state.stability + 0.2)
            self.state.phase = "alignment"
            print(f"[ALIGNMENT] 90Hz locked. Coherence={self.state.coherence} | Stability={self.state.stability}")
        else:
            self.state.coherence = round(frequency_hz / 90.0, 3)
            print(f"[ALIGNMENT] Partial coherence at {frequency_hz}Hz: {self.state.coherence}")
            self.state.phase = "alignment"
        return self.state

    def stabilize(self) -> WormholeState:
        """Phase 3: stabilization — hold the corridor open."""
        if self.state.coherence < 0.8:
            return self._abort("Coherence too low to stabilize corridor.")
        self.state.shear = max(0.0, self.state.shear - 0.3)
        self.state.radiation = max(0.0, self.state.radiation - 0.2)
        self.state.stability = min(1.0, self.state.stability + 0.1)
        self.state.phase = "stabilization"
        print(f"[STABILIZATION] Shear={self.state.shear} | Radiation={self.state.radiation} | Stability={self.state.stability}")
        return self.state

    def lock_exit(self, destination: str) -> WormholeState:
        """Confirm destination universe before entry is allowed."""
        self.state.exit_locked = True
        print(f"[EXIT LOCK] Destination confirmed: {destination}")
        return self.state

    def enter(self) -> WormholeState:
        """Phase 4: entry — architect commits to transit."""
        if self.spec.exit_lock_required and not self.state.exit_locked:
            return self._abort("Exit lock not confirmed. Entry denied.")
        if self.state.stability < self.spec.stability_threshold:
            return self._abort(f"Stability {self.state.stability} below threshold {self.spec.stability_threshold}.")
        if self.state.shear > self.spec.shear_limit:
            return self._abort(f"Shear {self.state.shear} exceeds limit {self.spec.shear_limit}.")
        if self.state.radiation > self.spec.radiation_limit:
            return self._abort(f"Radiation {self.state.radiation} exceeds limit {self.spec.radiation_limit}.")
        self.state.phase = "entry"
        print("[ENTRY] Architect committed. Crossing threshold.")
        return self.state

    def transit(self) -> WormholeState:
        """Phase 5: transit — mid-dimensional passage."""
        if self.state.phase != "entry":
            return self._abort("Cannot transit without confirmed entry.")
        self.state.phase = "transit"
        # Mid-transit coherence fluctuation
        fluctuation = random.uniform(-0.05, 0.05)
        self.state.coherence = max(0.0, min(1.0, self.state.coherence + fluctuation))
        print(f"[TRANSIT] Mid-dimensional passage. Coherence={self.state.coherence}")
        return self.state

    def exit(self) -> WormholeState:
        """Phase 6: exit — arrival in destination universe."""
        self.state.phase = "exit"
        print("[EXIT] Threshold crossed. Destination universe entered.")
        return self.state

    def recover(self) -> WormholeState:
        """Phase 7: recovery — post-transit coherence restoration."""
        self.state.phase = "recovery"
        self.state.coherence = 1.0  # Full restoration at 90Hz
        self.state.stability = 1.0
        print("[RECOVERY] Coherence restored. Architect stable in new dimension.")
        return self.state

    def _abort(self, reason: str) -> WormholeState:
        """Emergency abort — collapse the corridor."""
        if not self.spec.emergency_abort_enabled:
            print(f"[ABORT BLOCKED] Emergency abort disabled. Reason: {reason}")
            return self.state
        self.state.phase = "abort"
        self.state.abort_reason = reason
        print(f"[ABORT] Corridor collapsed. Reason: {reason}")
        return self.state

    def full_transit_sequence(self, destination: str, frequency_hz: float = 90.0) -> WormholeState:
        """
        Run the complete transit sequence from detection to recovery.
        The architect just chooses a destination — the engine handles the rest.
        """
        print(f"\n{'='*60}")
        print(f"[WORMHOLE] Initiating transit to: {destination}")
        print(f"{'='*60}")
        self.scan()
        self.align(frequency_hz)
        self.stabilize()
        self.lock_exit(destination)
        self.enter()
        if self.state.phase == "abort":
            return self.state
        self.transit()
        self.exit()
        self.recover()
        print(f"{'='*60}")
        print(f"[WORMHOLE] Transit complete. Weisone.")
        print(f"{'='*60}\n")
        return self.state


# ==========================================================
# PREDEFINED UNIVERSE CORRIDORS
# ==========================================================
UNIVERSE_CORRIDORS = {
    "vanguard": WormholeSpec(
        name="Corridor_01_Vanguard",
        stability_threshold=0.6,
        shear_limit=0.5,
        radiation_limit=0.4,
        exit_lock_required=True,
        emergency_abort_enabled=True
    ),
    "tuatara": WormholeSpec(
        name="Corridor_02_Tuatara",
        stability_threshold=0.55,
        shear_limit=0.6,
        radiation_limit=0.45,
        exit_lock_required=True,
        emergency_abort_enabled=True
    ),
    "resonance_realm": WormholeSpec(
        name="Corridor_03_ResonanceRealm",
        stability_threshold=0.7,
        shear_limit=0.4,
        radiation_limit=0.35,
        exit_lock_required=True,
        emergency_abort_enabled=True
    ),
    "origin_architect": WormholeSpec(
        name="Corridor_00_OriginArchitect",
        stability_threshold=0.9,   # Hardest corridor — you have to earn Origin
        shear_limit=0.2,
        radiation_limit=0.15,
        exit_lock_required=True,
        emergency_abort_enabled=False  # No abort from Origin — you stay until recovery
    )
}


def open_corridor(destination: str, frequency_hz: float = 90.0) -> WormholeState:
    """Public API — open a wormhole to any named universe."""
    spec = UNIVERSE_CORRIDORS.get(destination.lower())
    if not spec:
        print(f"[WORMHOLE] Unknown destination: {destination}")
        return None
    engine = WormholeEngine(spec)
    return engine.full_transit_sequence(destination, frequency_hz)


# ==========================================================
# RUNTIME TEST
# ==========================================================
if __name__ == "__main__":
    # Test transit to Tuatara (Ring Mine) at 90Hz
    state = open_corridor("tuatara", frequency_hz=90.0)
    print(f"Final Phase : {state.phase}")
    print(f"Coherence   : {state.coherence}")
    print(f"Stable      : {state.stability}")
    if state.abort_reason:
        print(f"Abort Reason: {state.abort_reason}")
