from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.ai_service import ai_service
from utils.video_merger import video_merger
import uuid, os

router = APIRouter(prefix="/video", tags=["Video"])

class VideoRequest(BaseModel):
    prompt: str
    language: str = "ar"
    style: str = "تحفيزي"
    voice: str = "female"

@router.post("/generate")
async def generate_video(request: VideoRequest):
    video_id = str(uuid.uuid4())[:8]

    script = await ai_service.generate_script(request.prompt, request.language, request.style)
    audio_path = await ai_service.generate_voice(script, request.voice, request.language)
    image_urls = await ai_service.generate_images(script, count=3)

    final_video_path = await video_merger.create_video(image_urls, audio_path, f"matrix_{video_id}")

    # نرجعو الفيديو مباشرة
    if os.path.exists(final_video_path) and final_video_path.endswith(".mp4"):
        return FileResponse(final_video_path, media_type="video/mp4", filename=f"matrix_{video_id}.mp4")
    else:
        return {
            "status": "success",
            "script": script,
            "audio_file": audio_path,
            "images": image_urls,
            "video_path": final_video_path
        }
