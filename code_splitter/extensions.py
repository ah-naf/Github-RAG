from langchain_text_splitters import Language

LANG_EXTS = {
    ".c": Language.C, ".h": Language.C,
    ".cpp": Language.CPP, ".cc": Language.CPP, ".cxx": Language.CPP, ".hpp": Language.CPP, ".hh": Language.CPP,
    ".py": Language.PYTHON,
    ".js": Language.JS, ".mjs": Language.JS, ".cjs": Language.JS,
    ".ts": Language.TS, ".tsx": Language.TS, ".jsx": Language.JS,
    ".java": Language.JAVA,
    ".kt": Language.KOTLIN,
    ".go": Language.GO,
    ".rb": Language.RUBY,
    ".php": Language.PHP,
    ".rs": Language.RUST,
    ".swift": Language.SWIFT,
}

TEXT_EXTS = {
    ".txt", ".md", ".json", ".yml", ".yaml", ".toml", ".ini", ".env",
    ".graphql", ".gql", ".sql", ".csv", ".tsv"
}