import os, uuid, asyncio
import edge_tts
import requests
from typing import List

class AIService:
    def __init__(self):
        self.tmp_dir = "/tmp"
        os.makedirs(self.tmp_dir, exist_ok=True)

        # أصوات تونسية حقيقية مجانية
        self.voices = {
            "female": "ar-TN-ReemNeural", # مرا تونسية حقيقية
            "male": "ar-TN-HediNeural", # راجل تونسي حقيقي
            "cs_female": "cs-CZ-VlastaNeural",
            "cs_male": "cs-CZ-AntoninNeural"
        }

    async def generate_script(self, prompt: str, language: str, style: str) -> str:
        # توا نخليو النص هو بيدو، بعدين تربطو OpenAI اذا تحب
        if language == "ar":
            return f"{prompt}. هذه قصة {style} مشوقة تروي تفاصيل مثيرة..."
        else:
            return f"{prompt}. This is a {style} story full of drama..."

    async def generate_voice(self, text: str, voice_type: str, language: str) -> str:
        # صوت تونسي حقيقي بـ edge-tts
        voice_key = voice_type if language == "ar" else f"cs_{voice_type}"
        voice_name = self.voices.get(voice_key, "ar-TN-ReemNeural")

        file_id = str(uuid.uuid4())[:8]
        output_path = f"{self.tmp_dir}/{file_id}.mp3"

        clean_text = text[:1000] # edge-tts يقبل حتى 1000 حرف
        communicate = edge_tts.Communicate(clean_text, voice_name)
        await communicate.save(output_path)

        return output_path # نرجعو مسار الملف الحقيقي

    async def generate_images(self, script: str, count: int = 3) -> List[str]:
        # نستعملو Pollinations مجاني وحقيقي
        seed = abs(hash(script)) % 10000
        base = script[:60]
        urls = []
        for i in range(count):
            prompt = f"cinematic, ultra realistic, {base}, dramatic lighting, 8k"
            url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}?width=1024&height=576&seed={seed+i}&nologo=true"
            urls.append(url)
        return urls

ai_service = AIService()
