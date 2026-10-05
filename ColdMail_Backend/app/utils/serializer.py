def serialize_datetime(dt):
    return dt.isoformat() + "Z" if dt else None
