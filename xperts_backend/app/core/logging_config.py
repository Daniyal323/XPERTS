import logging
import sys

def setup_logging():
    # Setup logger
    logger = logging.getLogger("xperts")
    logger.setLevel(logging.INFO)
    
    # Formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    # Avoid duplicate logs if calling setup multiple times
    if not logger.handlers:
        logger.addHandler(handler)
    
    return logger

logger = setup_logging()
