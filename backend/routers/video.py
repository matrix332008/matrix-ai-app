from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_service import ai_service
from utils.video_merger import video_merger
import uuid

router = APIRouter(prefix="/video", tags=["Video"])

class VideoRequest(BaseModel):
    prompt: str
    language: str = "ar"
    style: str = "تحفيزي" 
    voice: str = "مرا"

@router.post("/generate")
async def generate_video(request: VideoRequest):
    """
    API كامل يولد فيديو من الصفر: نص + صوت + صور + دمج
    """
    video_id = str(uuid.uuid4())[:8]  # ID عشوائي للفيديو
    
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
    
    # 4. ادمج كل شي في فيديو
    final_video_url = await video_merger.create_video(
        image_urls=image_urls,
        audio_url=audio_url,
        output_name=f"matrix_ai_{video_id}"
    )
    
    return {
        "status": "success",
        "message": "الفيديو تجهز ✨",
        "video_id": video_id,
        "data": {
            "prompt": request.prompt,
            "language": request.language,
            "style": request.style,
            "script": script,
            "audio_url": audio_url,
            "image_urls": image_urls,
            "final_video_url": final_video_url,
            "format": "1080x1920 - TikTok Ready"
        }
    }
