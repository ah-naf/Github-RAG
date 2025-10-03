import os
import io
import zipfile
import requests
from code_splitter.CodeSplitter import CodeSplitter

class GithubContentFetcher:
    """
    GitHub content fetcher:
    - Instead of per-file API calls, downloads the whole repository as a zipball
      and extracts files locally.
    """

    def __init__(self, owner, repo, token=None, api_version="2022-11-28", max_file_bytes=1_000_000):
        """
        Initialize the fetcher.
        - owner/repo: GitHub repository coordinates
        - token: optional PAT (uses env GITHUB_TOKEN or GH_TOKEN if not provided)
        - api_version: GitHub API version header
        - max_file_bytes: size guard to skip huge files
        """
        self.owner = owner
        self.repo = repo
        self.max_file_bytes = max_file_bytes

        self.token = token or os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
        
        self.headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": api_version,
        }
        
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"

        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def download_zip(self, ref="main"):
        """
        Download the repository as a zipball at the given ref (branch, tag, or commit).
        Returns a ZipFile object.
        """
        url = f"https://api.github.com/repos/{self.owner}/{self.repo}/zipball/{ref}"
        print(url, self.token)
        r = self.session.get(url, timeout=60)
        r.raise_for_status()
        return zipfile.ZipFile(io.BytesIO(r.content))

    def walk_files(self, ref="origin"):
        """
        Yield file info dicts from the zipball.
        Structure is similar to your previous walk_files.
        """
        with self.download_zip(ref) as zf:
            root_prefix = zf.namelist()[0]

            for name in zf.namelist():
                if name.endswith("/"):
                    continue

                info = zf.getinfo(name)

                if info.file_size > self.max_file_bytes:
                    continue

                path = name[len(root_prefix):]
                raw = zf.read(name)

                try:
                    content = raw.decode("utf-8")
                except UnicodeDecodeError:
                    content = raw.decode("utf-8", errors="ignore")

                
                chunks, meta = CodeSplitter().split(path, content)

                yield {
                    "path": path,
                    "type": "file",
                    "size": info.file_size,
                    "html_url": f"https://github.com/{self.owner}/{self.repo}/blob/{ref}/{path}",
                    "meta": meta,
                    "chunks": chunks
                }
