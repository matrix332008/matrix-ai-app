from fastapi import FastAPI

app = FastAPI(title="Matrix AI Backend")

@app.get("/")
def read_root():
    return {"status": "Matrix AI Backend is running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}
