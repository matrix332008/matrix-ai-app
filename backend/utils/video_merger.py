from typing import List

class VideoMerger:
    
    async def create_video(self, image_urls: List[str], audio_url: str, output_name: str) -> str:
        """
        يدمج الصور + الصوت في فيديو MP4 
        توا يرجع رابط وهمي. بعدين نركبو MoviePy
        """
        # الخطوات الحقيقية بعدين:
        # 1. نحملو الصور والصوت
        # 2. نعملو كل صورة 3-4 ثواني
        # 3. نضيفو الصوت + موسيقى + Subtitles
        # 4. نصدرو 1080x1920 للتيك توك
        
        return f"https://fake-storage.com/videos/{output_name}.mp4"

video_merger = VideoMerger()
