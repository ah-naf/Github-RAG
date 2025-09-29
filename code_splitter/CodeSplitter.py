from langchain_text_splitters import RecursiveCharacterTextSplitter
from extensions import LANG_EXTS, TEXT_EXTS
import os

def _ext(path):
    return os.path.splitext(path.lower())[1]

class CodeSplitter:
    def __init__(self, chunk_size=800, chunk_overlap=120):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def _language_for(self, path):
        return LANG_EXTS.get(_ext(path))

    def split(self, path, text):
        lang = self._language_for(path)
        
        if lang:
            splitter = RecursiveCharacterTextSplitter.from_language(
                language = lang,
                chunk_size = self.chunk_size,
                chunk_overlap = self.chunk_overlap
            )
            meta = {"mode": "language", "language": lang.name}
        else:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap,
                separators=["\n\n", "\n", " ", ""],
            )
            meta = {"mode": "generic", "language": lang}
        
        chunks = splitter.split_text(text)
        return chunks, meta