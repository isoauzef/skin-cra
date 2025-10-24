from pathlib import Path
import re

path = Path(r"c:/Users/ismail akyayla/Desktop/code/skin/skin-cra/public/landing-content.json")
text = path.read_text(encoding="utf-8")
pattern = r"\t\t\t<div data-box=\"true\" data-secondsdelay=\"\" id=\"i0p9hr\".*?\t\t\t</div>\n"
new_text, count = re.subn(pattern, "", text, flags=re.S)
if count != 1:
    raise SystemExit(f"expected 1 removal, got {count}")
path.write_text(new_text, encoding="utf-8")
