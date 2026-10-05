import csv
from io import StringIO
from typing import List, Dict, Tuple


def parse_and_validate_csv(file_bytes: bytes,) -> Tuple[List[str], List[Dict[str, str]]]:
    """
    Parse CSV and validate its structure.
    Returns (headers, rows) if valid.
    Raises ValueError on any validation failure.
    """

    # 1️⃣ Decode
    try:
        content = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise ValueError("CSV file must be UTF-8 encoded")

    # 2️⃣ Parse
    reader = csv.DictReader(StringIO(content))

    if not reader.fieldnames:
        raise ValueError("CSV must contain headers")

    # 3️⃣ Normalize headers
    headers = [h.strip() for h in reader.fieldnames]

    if "email" not in headers:
        raise ValueError("CSV must contain an 'email' column")

    if len(set(headers)) != len(headers):
        raise ValueError("CSV contains duplicate column names")

    # 4️⃣ Parse + normalize rows
    rows: List[Dict[str, str]] = []

    for row in reader:
        cleaned_row = {
            key.strip(): (value.strip() if value else "")
            for key, value in row.items()
        }
        rows.append(cleaned_row)

    if not rows:
        raise ValueError("CSV contains no data rows")

    return headers, rows

