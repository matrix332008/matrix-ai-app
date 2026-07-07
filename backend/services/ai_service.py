import os
from typing import List

class AIService:
    
    def __init__(self):
        # بعدين نقراو المفاتيح من.env
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
        
    async def generate_script(self, prompt: str, language: str, style: str) -> str:
        """
        يولد نص القصة بـ GPT-4o حسب اللغة والستايل
        """
        # توا نرجعو نص تجريبي. بعدين نربطو OpenAI
        if language == "ar":
            return f"هذه قصة {style} عن: {prompt}. شاب تونسي بدا من الصفر وحقق النجاح بعد تعب كبير..."
        else: # cs = تشيكي
            return f"Toto je {style} příběh o: {prompt}. Mladý Čech začínal od nuly a dosáhl úspěchu..."
    
    async def generate_voice(self, text: str, voice_type: str, language: str) -> str:
        """
        يولد الصوت بـ ElevenLabs
        يرجع رابط الملف الصوتي
        """
        # توا نرجعو رابط وهمي. بعدين نربطو ElevenLabs
        return f"https://fake-storage.com/audio/{language}_{voice_type}.mp3"
    
    async def generate_images(self, script: str, count: int = 4) -> List[str]:
        """
        يولد الصور بـ Stable Diffusion XL
        يرجع list متاع روابط الصور
        """
        # توا نرجعو روابط وهمية. بعدين نربطو SDXL
        return [f"https://fake-storage.com/image_{i}.png" for i in range(count)]

# نعملو instance واحد نستعملوه في كل البلايص
ai_service = AIService()
