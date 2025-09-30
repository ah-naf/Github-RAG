from langchain_text_splitters import RecursiveCharacterTextSplitter
from .extensions import LANG_EXTS
import os

def _ext(path):
    return os.path.splitext(path.lower())[1]

class CodeSplitter:
    def __init__(self, chunk_size=800, chunk_overlap=120, split_threshold=2000):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.split_threshold = split_threshold

    def _language_for(self, path):
        ext = _ext(path)
        return LANG_EXTS.get(ext), ext

    def split(self, path, text):
        lang, ext = self._language_for(path)
        
        # Case 1: Language-aware splitting
        if lang:
            if len(text) < self.split_threshold:
              # Small file → no splitting, but keep correct language metadata
              return [text], {"mode": "language", "language": lang.name}
            else:
              splitter = RecursiveCharacterTextSplitter.from_language(
                language = lang,
                chunk_size = self.chunk_size,
                chunk_overlap = self.chunk_overlap
              )
              chunks = splitter.split_text(text)
              return chunks, {"mode": "language", "language": lang.name}
        
        # Case 2: Generic (non-code) files
        if len(text) < self.split_threshold:
          return [text], {"mode": "generic", "language": ext or "plain-text"}

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""],
        )
        meta = {"mode": "generic", "language": ext}
            
        chunks = splitter.split_text(text)
        return chunks, meta