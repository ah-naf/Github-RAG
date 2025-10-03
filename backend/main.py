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

fetcher = GithubContentFetcher("ah-naf", "nlsql")

files = fetcher.walk_files("origin")

docs = []
for file in files:
    meta = {k: v for k, v in file.items() if k != "chunks"}

    if "meta" in meta and isinstance(meta["meta"], dict):
        for k, v in meta["meta"].items():
            meta[f"meta_{k}"] = v
        del meta["meta"]
    
    for chunk in file.get("chunks"):
        docs.append(Document(
            page_content = chunk,
            metadata = meta
        ))


hybrid_retriever = HybridRetriever(docs).get_retriever()

prompt = Prompt().get_prompt()

def format_docs(docs):
    return "\n\n".join([f"[{d.metadata.get('path')}] {d.page_content}" for d in docs])


llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

retrieval_chain = (
    {"context": hybrid_retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

query = "Who are you and what is your task"
answer = retrieval_chain.invoke(query)

print("Q:", query)
print("A:", answer)