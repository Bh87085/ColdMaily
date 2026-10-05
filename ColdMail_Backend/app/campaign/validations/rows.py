import re

EMAIL_REGEX = re.compile(r"[^@]+@[^@]+\.[^@]+")

def validate_rows(rows: list[dict], variables: set[str]):
    seen_emails = set()
    errors = []

    for idx, row in enumerate(rows, start=1):
        email = row.get("email", "").strip()

        if not email:
            errors.append(f"Row {idx}: email is missing")
            continue

        if not EMAIL_REGEX.match(email):
            errors.append(f"Row {idx}: invalid email format")
            continue

        if email in seen_emails:
            errors.append(f"Row {idx}: duplicate email")
            continue

        seen_emails.add(email)

        for var in variables:
            if not row.get(var):
                errors.append(f"Row {idx}: missing value for {{{{{var}}}}}")

    if errors:
        raise ValueError(errors)
