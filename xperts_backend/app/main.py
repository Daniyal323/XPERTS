import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.db.session import engine, Base
from app.api.api_v1.api import api_router
from app.core.errors import http_exception_handler, validation_exception_handler
from app.core.logging_config import logger

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="XPERTS API",
    description="Industrial SME Marketplace Backend API",
    version="1.0.0",
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Method: {request.method} Path: {request.url.path} Duration: {process_time:.4f}s")
    response.headers["X-Process-Time"] = str(process_time)
    return response

app.include_router(api_router, prefix="/api/v1")

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

@app.get("/", tags=["Health"])
async def root():
    return {"message": "XPERTS API is operational", "status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
