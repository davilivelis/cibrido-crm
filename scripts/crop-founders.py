"""
Crop founder photos to face-only square — pronto para circular no site.
Estratégia: abre o PNG sem fundo (rembg), encontra bounding box dos pixels
não-transparentes, pega só a metade superior (rosto + ombros), pad para
quadrado, resize 500x500.
"""

from PIL import Image
import os

FOUNDERS_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "founders")

def crop_face(input_path: str, output_path: str, top_fraction: float = 0.55):
    img = Image.open(input_path).convert("RGBA")
    r, g, b, a = img.split()

    # Bounding box dos pixels visíveis (não transparentes)
    bbox = a.getbbox()
    if not bbox:
        print(f"[ERRO] Sem pixels visíveis em {input_path}")
        return

    left, top, right, bottom = bbox
    person_w = right - left
    person_h = bottom - top

    # Pega só a fração superior da pessoa (rosto + ombros)
    face_bottom = top + int(person_h * top_fraction)
    face_crop = img.crop((left, top, right, face_bottom))

    # Padding para quadrado (centralizado)
    fw, fh = face_crop.size
    side = max(fw, fh)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    paste_x = (side - fw) // 2
    paste_y = (side - fh) // 2
    square.paste(face_crop, (paste_x, paste_y))

    # Resize para 500x500
    final = square.resize((500, 500), Image.LANCZOS)
    final.save(output_path, "PNG")
    print(f"[OK] {output_path} ({side}px -> 500x500, top_fraction={top_fraction})")

if __name__ == "__main__":
    # Ricardo — badge quase quadrado, rosto na metade superior
    crop_face(
        os.path.join(FOUNDERS_DIR, "ricardo-nobg.png"),
        os.path.join(FOUNDERS_DIR, "ricardo-face.png"),
        top_fraction=0.52,
    )
    # Davi — badge retrato, rosto no topo; fração menor para cortar logo do badge
    crop_face(
        os.path.join(FOUNDERS_DIR, "davi-nobg.png"),
        os.path.join(FOUNDERS_DIR, "davi-face.png"),
        top_fraction=0.48,
    )
    print("\nPronto! Arquivos em public/images/founders/")
