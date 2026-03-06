import sys
import subprocess
try:
    import pypdf
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf", "--quiet", "--disable-pip-version-check"])
    import pypdf

try:
    pdf_path = sys.argv[1]
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for i in range(min(15, len(reader.pages))):
        page_text = reader.pages[i].extract_text()
        if page_text:
            text += page_text + "\n"
    with open('pdf_preview.txt', 'w') as f:
        f.write(text)
    print("PDF preview saved. Length:", len(text))
except Exception as e:
    print(f"Error: {e}")
