def validate_request(
    name: str,
    subject: str,
    body: str,
    no_of_follow_up: int,
):
    if not name.strip():  #strip will remove the leading and trailing spaces
        raise ValueError("Campaign name is required")

    if not subject.strip():
        raise ValueError("Subject is required")

    if not body.strip():
        raise ValueError("Body is required")

    if no_of_follow_up < 0:
        raise ValueError("no_of_follow_up cannot be negative")

