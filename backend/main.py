from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import video

app = FastAPI(
    title="Matrix AI Backend",
    description="محرك القصص الذكي لمُبدعي التيك توك والـ YouTube Shorts",
    version="0.1.0"
)

# إضافة CORS باش الفرونت ينجم يكلم الباكند
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # بعدين نحطو دومين Vercel هنا للأمان
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ربط الـ routers
app.include_router(video.router)

@app.get("/")
def read_root():
    return {
        "status": "Matrix AI Backend is running 🚀",
        "docs": "/docs",
        "supported_languages": ["ar", "cs"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}
