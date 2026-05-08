"""
Crop founder photos: recorte rígido no rosto, fundo navy, 500x500 JPG.
O circulo do site fica 100% preenchido sem transparencia.
"""

from PIL import Image
import os

FOUNDERS_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "founders")
NAVY = (30, 42, 58)  # #1E2A3A — fundo da secao Fundadores

def crop_face(nobg_path: str, original_path: str, output_path: str, face_top: float = 0.0, face_bottom: float = 0.65):
    """
    nobg_path    : PNG com fundo removido pelo rembg
    original_path: JPG original (badge) — usado para pegar a foto em alta qualidade
    output_path  : saida 500x500 JPG com fundo navy
    face_top/bot : fracao do bounding box a manter (0.0 = topo, 1.0 = base)
    """
    # Abre PNG sem fundo para encontrar onde a pessoa esta
    nobg = Image.open(nobg_path).convert("RGBA")
    _, _, _, alpha = nobg.split()
    bbox = alpha.getbbox()
    if not bbox:
        print(f"[ERRO] sem pixels visiveis em {nobg_path}")
        return

    bx0, by0, bx1, by1 = bbox
    bw = bx1 - bx0
    bh = by1 - by0

    # Corta verticalmente pela fracao do rosto
    face_y0 = by0 + int(bh * face_top)
    face_y1 = by0 + int(bh * face_bottom)

    # Crop na imagem ORIGINAL (mais qualidade que a versao rembg)
    original = Image.open(original_path).convert("RGB")
    face_crop = original.crop((bx0, face_y0, bx1, face_y1))

    # Calcula dimensoes para pad quadrado com fundo navy
    cw, ch = face_crop.size
    side = max(cw, ch)
    canvas = Image.new("RGB", (side, side), NAVY)
    paste_x = (side - cw) // 2
    paste_y = (side - ch) // 2
    canvas.paste(face_crop, (paste_x, paste_y))

    # Resize final 500x500
    final = canvas.resize((500, 500), Image.LANCZOS)
    final.save(output_path, "JPEG", quality=92)
    print(f"[OK] {os.path.basename(output_path)} | bbox={bbox} crop=({bx0},{face_y0},{bx1},{face_y1}) side={side}")

if __name__ == "__main__":
    # Ricardo — badge quase quadrado, rosto ocupa area central superior
    crop_face(
        nobg_path=os.path.join(FOUNDERS_DIR, "ricardo-nobg.png"),
        original_path=os.path.join(FOUNDERS_DIR, "ricardo.jpg"),
        output_path=os.path.join(FOUNDERS_DIR, "ricardo-face.jpg"),
        face_top=0.0,
        face_bottom=0.70,
    )
    # Davi — badge retrato, rosto no topo; fundo Cibrido na base
    crop_face(
        nobg_path=os.path.join(FOUNDERS_DIR, "davi-nobg.png"),
        original_path=os.path.join(FOUNDERS_DIR, "davi.jpg"),
        output_path=os.path.join(FOUNDERS_DIR, "davi-face.jpg"),
        face_top=0.0,
        face_bottom=0.65,
    )
    print("\nArquivos prontos em public/images/founders/")
