from github.GithubContentFetcher import GithubContentFetcher
from retriever.HybridRetriever import HybridRetriever
from prompt.Prompt import Prompt
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain.docstore.document import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

_retrieval_chain = {}

def build_retrieval_chain(username, repo_name, branch="origin", token=None):
    """
    Build (or load from cache) the retrieval chain for a given user and repo.
    """

    key = f"{username}_{repo_name}_{branch}"
    if key in _retrieval_chain:
        return _retrieval_chain[key]
    
    fetcher = GithubContentFetcher(owner=username, repo=repo_name, token=token)
    files = fetcher.walk_files(branch)

    docs = []
    for file in files:
        meta = {k: v for k, v in file.items() if k != "chunks"}
        if "meta" in meta and isinstance(meta["meta"], dict):
            for k, v in meta["meta"].items():
                meta[f"meta_{k}"] = v
            del meta["meta"]

        for chunk in file.get("chunks"):
            docs.append(Document(page_content=chunk, metadata=meta))
    
    persist_dir = f"./chroma_db/{username}_{repo_name}"

    hybrid_retriever = HybridRetriever(docs, persist_directory=persist_dir).get_retriever()

    prompt = Prompt().get_prompt()
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.25)

    def format_docs(docs):
        return "\n\n".join([f"[{d.metadata.get('path')}] {d.page_content}" for d in docs])

    retrieval_chain = (
        {"context": hybrid_retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    # Cache it
    _retrieval_cache[key] = retrieval_chain
    return retrieval_chain

def run_query(username, repo_name, query, branch="origin", token=None):
    """
    Run a query against the retrieval chain for the given user and repo.
    """

    chain = build_retrieval_chain(username, repo_name, branch, token)
    return chain.invoke({"question": query})

if __name__ == "__main__":
    query = "Who are you and what is your task"
    answer = run_query("ah-naf", "nlsql", query)

    print("Q:", query)
    print("A:", answer)