#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageOps
import shutil
ROOT=Path("."); SOURCE=ROOT/"source-photos"; GALLERY_SOURCE=SOURCE/"gallery-originals"; MASTERS_SOURCE=SOURCE/"masters"
SOURCE.mkdir(exist_ok=True); GALLERY_SOURCE.mkdir(parents=True,exist_ok=True); MASTERS_SOURCE.mkdir(parents=True,exist_ok=True)
master_files=["Julia-cosmetologist.JPG","Elvira-hairdresser.PNG","Darya-hairdresser.PNG","Anna-brow-and-lash-artist.PNG","Marina-master-manikyura.PNG","Olesya-master-manikyura.JPG"]
for path in sorted(ROOT.glob("gallery-*.webp")): shutil.move(str(path),str(GALLERY_SOURCE/path.name))
for name in ("gallery.webp","Profile.webp","logo.PNG",*master_files):
 path=ROOT/name
 if path.exists():
  destination=(MASTERS_SOURCE/name) if name in master_files else (SOURCE/name)
  shutil.move(str(path),str(destination))
def save_webp(source,target,quality=90):
 image=ImageOps.exif_transpose(Image.open(source)); image=image.convert("RGBA" if "A" in image.getbands() else "RGB")
 image.save(target,format="WEBP",quality=quality,method=6)
save_webp(SOURCE/"Profile.webp",ROOT/"profile.webp"); shutil.copy2(SOURCE/"logo.PNG",ROOT/"logo.png")
for source_name,target_name in [("Julia-cosmetologist.JPG","team-01.webp"),("Elvira-hairdresser.PNG","team-02.webp"),("Darya-hairdresser.PNG","team-03.webp"),("Anna-brow-and-lash-artist.PNG","team-04.webp"),("Marina-master-manikyura.PNG","team-05.webp"),("Olesya-master-manikyura.JPG","team-06.webp")]:
 save_webp(MASTERS_SOURCE/source_name,ROOT/target_name)
selected=["gallery.webp","gallery-04.webp","gallery-05.webp","gallery-06.webp","gallery-08.webp","gallery-09.webp","gallery-10.webp","gallery-13.webp","gallery-14.webp","gallery-15.webp","gallery-16.webp","gallery-17.webp","gallery-18.webp","gallery-19.webp","gallery-20.webp","gallery-21.webp","gallery-22.webp","gallery-23.webp","gallery-24.webp","gallery-25.webp","gallery-26.webp","gallery-36.webp","gallery-37.webp","gallery-38.webp","gallery-39.webp"]
for index,name in enumerate(selected,1):
 source=SOURCE/name if name=="gallery.webp" else GALLERY_SOURCE/name
 shutil.copy2(source,ROOT/f"gallery-{index:02d}.webp")
for path in ROOT.glob("gallery-*.webp"):
 if int(path.stem.split("-")[1])>25:path.unlink()
(ROOT/".github"/"workflows"/"prepare-eva-media.yml").unlink(); (ROOT/"scripts"/"prepare-eva-media.py").unlink()
