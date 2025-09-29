from github.GithubContentFetcher import GithubContentFetcher
from dotenv import load_dotenv

load_dotenv()

fetcher = GithubContentFetcher("ah-naf", "nlsql")

files = next(fetcher.walk_files("origin"))

import json
print(json.dumps(files, indent=4))