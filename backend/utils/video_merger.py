import os, uuid, requests
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips

class VideoMerger:
    async def create_video(self, image_urls: list, audio_url: str, output_name: str) -> str:
        tmp = "/tmp"
        # نحملو الصوت
        audio_path = audio_url if os.path.exists(audio_url) else f"{tmp}/{output_name}.mp3"

        # نحملو الصور
        image_paths = []
        for i, url in enumerate(image_urls):
            try:
                r = requests.get(url, timeout=15)
                img_path = f"{tmp}/{output_name}_{i}.jpg"
                with open(img_path, "wb") as f:
                    f.write(r.content)
                image_paths.append(img_path)
            except:
                continue

        if not image_paths:
            return audio_path

        # نعملو فيديو حقيقي
        try:
            audio_clip = AudioFileClip(audio_path)
            duration_per_image = audio_clip.duration / len(image_paths)

            clips = []
            for img_path in image_paths:
                clip = ImageClip(img_path).set_duration(duration_per_image).resize((1080, 1920))
                clips.append(clip)

            final = concatenate_videoclips(clips, method="compose")
            final = final.set_audio(audio_clip)

            output_video = f"{tmp}/{output_name}.mp4"
            final.write_videofile(output_video, fps=24, codec='libx264', audio_codec='aac')

            return output_video
        except Exception as e:
            print(f"Video merge error: {e}")
            return audio_path

video_merger = VideoMerger()
