from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/video", tags=["Video"])

class VideoRequest(BaseModel):
    prompt: str
    language: str = "ar"  # ar = عربي, cs = تشيكي
    style: str = "تحفيزي"  # دراما، مضحك، رعب
    voice: str = "مرا"    # مرا، راجل

@router.post("/generate")
async def generate_video(request: VideoRequest):
    """
    API Endpoint لتوليد الفيديو
    حاليا يرجع response تجريبي. بعدين نربطوه بالـ AI
    """
    return {
        "status": "processing",
        "message": f"جاري توليد فيديو باللغة {request.language}",
        "data": {
            "prompt": request.prompt,
            "style": request.style,
            "voice": request.voice,
            "estimated_time": "60 seconds"
        }
    }

@router.get("/status/{video_id}")
async def get_video_status(video_id: str):
    """
    API Endpoint باش نتبعو حالة الفيديو
    """
    return {
        "video_id": video_id,
        "status": "ready",
        "download_url": f"https://example.com/videos/{video_id}.mp4"
    }
