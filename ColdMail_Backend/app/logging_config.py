import logging

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,  # Minimum level to log, can be DEBUG, INFO, WARNING, ERROR, CRITICAL
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
