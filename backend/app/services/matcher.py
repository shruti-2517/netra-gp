import re
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models import WatchlistVehicle

def levenshtein_distance(s1: str, s2: str) -> int:
    """
    Computes Levenshtein edit distance between two strings
    """
    if len(s1) > len(s2):
        s1, s2 = s2, s1

    distances = range(len(s1) + 1)
    for i2, c2 in enumerate(s2):
        distances_ = [i2 + 1]
        for i1, c1 in enumerate(s1):
            if c1 == c2:
                distances_.append(distances[i1])
            else:
                distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
        distances = distances_
    return distances[-1]

def canonical_plate(plate: str) -> str:
    """
    Normalizes plate string for fuzzy comparison by removing non-alphanumeric characters
    and standardizing easily confused OCR characters (0/O, 1/I, 8/B).
    """
    cleaned = re.sub(r'[^A-Z0-9]', '', plate.upper())
    # Canonicalize confusions for fuzzy matching
    canonical = (
        cleaned.replace('0', 'O')
               .replace('1', 'I')
               .replace('8', 'B')
               .replace('5', 'S')
               .replace('2', 'Z')
    )
    return canonical

class WatchlistMatcher:
    @staticmethod
    def match_plate(db: Session, input_plate: str, max_distance: int = 1) -> Tuple[Optional[WatchlistVehicle], float]:
        """
        Cross-references input_plate against watchlist database.
        Returns (WatchlistVehicle, match_confidence) if exact or fuzzy match found.
        """
        if not input_plate:
            return None, 0.0

        cleaned_input = re.sub(r'[^A-Z0-9]', '', input_plate.upper())
        canonical_input = canonical_plate(input_plate)

        watchlist_entries = db.query(WatchlistVehicle).all()

        # 1. First Pass: Exact Match on Normalized Plate
        for entry in watchlist_entries:
            cleaned_target = re.sub(r'[^A-Z0-9]', '', entry.license_plate.upper())
            if cleaned_input == cleaned_target:
                return entry, 1.0

        # 2. Second Pass: Canonical Match (OCR confusion tolerant)
        for entry in watchlist_entries:
            canonical_target = canonical_plate(entry.license_plate)
            if canonical_input == canonical_target:
                return entry, 0.95

        # 3. Third Pass: Fuzzy Levenshtein Match (Distance <= max_distance)
        best_match = None
        min_dist = max_distance + 1

        for entry in watchlist_entries:
            canonical_target = canonical_plate(entry.license_plate)
            dist = levenshtein_distance(canonical_input, canonical_target)
            if dist <= max_distance and dist < min_dist:
                min_dist = dist
                best_match = entry

        if best_match:
            confidence = 0.85 if min_dist == 1 else 0.70
            return best_match, confidence

        return None, 0.0
