import re
from typing import Set, List, Dict

VARIABLE_REGEX = re.compile(r"\{\{(.*?)\}\}")


def extract_variables(text: str) -> Set[str]:
    return {var.strip() for var in VARIABLE_REGEX.findall(text)}


def validate_templates(
    subject: str,
    body: str,
    csv_headers: List[str],
) -> Set[str]:
    """
    Validates template variables against CSV headers.
    Returns the set of variables used.
    """
    variables = extract_variables(subject) | extract_variables(body)

    headers_set = {h.strip() for h in csv_headers}

    for var in variables:
        if not var:
            raise ValueError("Empty template variable {{ }} is not allowed")

        if var not in headers_set:
            raise ValueError(f"CSV missing column for variable: {var}")

    return variables

def render_template(template: str, row: Dict[str, str]) -> str:
    """
    Replace {{variable}} in template with values from row.
    Assumes all variables are already validated.
    """
    rendered = template

    for key, value in row.items():
        rendered = rendered.replace(
            f"{{{{{key}}}}}",
            value or ""
        )

    return rendered
