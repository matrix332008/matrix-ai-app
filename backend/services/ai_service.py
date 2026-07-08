import os, uuid, asyncio
import edge_tts
import requests
from typing import List

class AIService:
    def __init__(self):
        self.tmp_dir = "/tmp"
        os.makedirs(self.tmp_dir, exist_ok=True)
        self.voices = {
            "female": "ar-TN-ReemNeural",
            "male": "ar-TN-HediNeural",
            "cs_female": "cs-CZ-VlastaNeural",
            "cs_male": "cs-CZ-AntoninNeural"
        }

    async def generate_script(self, prompt: str, language: str, style: str) -> str:
        if language == "ar":
            return f"{prompt}. هذه قصة {style} مشوقة تروي تفاصيل مثيرة..."
        else:
            return f"{prompt}. This is a {style} story full of drama..."

    async def generate_voice(self, text: str, voice_type: str, language: str) -> str:
        # === تصليح صوت راجل/مرا ===
        vt = str(voice_type).lower().strip()
        print(f"🎤 طلب صوت: {voice_type} -> {vt}")

        if vt in ["male", "m", "man", "hedi", "راجل", "رجل"]:
            voice_name = "ar-TN-HediNeural"
            vt_key = "male"
        else:
            voice_name = "ar-TN-ReemNeural"
            vt_key = "female"

        if language!= "ar":
            voice_name = "cs-CZ-AntoninNeural" if vt_key == "male" else "cs-CZ-VlastaNeural"

        print(f"✅ باش نستعمل: {voice_name}")

        file_id = str(uuid.uuid4())[:8]
        output_path = f"{self.tmp_dir}/{file_id}.mp3"
        clean_text = text[:1000]
        communicate = edge_tts.Communicate(clean_text, voice_name)
        await communicate.save(output_path)
        return output_path

    async def generate_images(self, script: str, count: int = 3) -> List[str]:
        seed = abs(hash(script)) % 10000
        base = script[:60]
        urls = []
        for i in range(count):
            prompt = f"cinematic, ultra realistic, {base}, dramatic lighting, 8k"
            url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}?width=1024&height=576&seed={seed+i}&nologo=true"
            urls.append(url)
        return urls

ai_service = AIService()
