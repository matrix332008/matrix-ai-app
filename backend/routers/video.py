from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_service import ai_service

router = APIRouter(prefix="/video", tags=["Video"])

class VideoRequest(BaseModel):
    prompt: str
    language: str = "ar"
    style: str = "تحفيزي" 
    voice: str = "مرا"

@router.post("/generate")
async def generate_video(request: VideoRequest):
    """
    API يولد كل مكونات الفيديو: نص + صوت + صور
    """
    # 1. ولّد النص
    script = await ai_service.generate_script(
        prompt=request.prompt,
        language=request.language, 
        style=request.style
    )
    
    # 2. ولّد الصوت
    audio_url = await ai_service.generate_voice(
        text=script,
        voice_type=request.voice,
        language=request.language
    )
    
    # 3. ولّد الصور
    image_urls = await ai_service.generate_images(script=script, count=4)
    
    return {
        "status": "success",
        "message": "الفيديو تجهز ✨",
        "data": {
            "prompt": request.prompt,
            "language": request.language,
            "style": request.style,
            "script": script,
            "audio_url": audio_url,
            "image_urls": image_urls,
            "duration_estimate": "45-60 ثانية"
        }
    }
