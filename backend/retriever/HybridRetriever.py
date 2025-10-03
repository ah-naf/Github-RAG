from langchain_community.vectorstores import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from langchain_huggingface import HuggingFaceEmbeddings
import os
import pickle

class HybridRetriever:
    def __init__(
        self,
        docs,
        persist_directory: str = "./chroma_db",
        embedding_model: str = "intfloat/e5-large-v2",
        dense_k: int = 5,
        sparse_k: int = 5,
        weights: list[float] = [0.6, 0.4],
    ):
        """
        Create a hybrid retriever (dense + sparse).
        
        Args:
            docs: List of LangChain documents
            persist_directory: Path to persist Chroma DB
            embedding_model: HuggingFace embedding model name
            dense_k: Number of dense retriever results
            sparse_k: Number of sparse retriever results
            weights: Weighting between dense & sparse retrievers
        """

        # Create embeddings + Chroma
        embeddings = HuggingFaceEmbeddings(model_name=embedding_model)

        if os.path.exists(persist_directory) and len(os.listdir(persist_directory)) > 0:
            vectorstore = Chroma(
                persist_directory=persist_directory,
                embedding_function=embeddings,
            )
        else:
            if docs is None:
                raise ValueError("No persisted DB found, and no docs provided to build one.")
            
            vectorstore = Chroma.from_documents(
                documents=docs,
                embedding=embeddings,
                persist_directory=persist_directory,
            )
            vectorstore.persist()

        # Dense retriever
        dense_retriever = vectorstore.as_retriever(search_kwargs={"k": dense_k})

        bm25_path = os.path.join(persist_directory, "bm25.pkl")
        
        if os.path.exists(bm25_path):
            # Load BM25 retriever from pickle
            with open(bm25_path, "rb") as f:
                sparse_retriever = pickle.load(f)
        else:
            if docs is None:
                raise ValueError("No docs provided to build BM25 index.")
            sparse_retriever = BM25Retriever.from_documents(docs)
            sparse_retriever.k = sparse_k
            # Persist BM25 retriever
            with open(bm25_path, "wb") as f:
                pickle.dump(sparse_retriever, f)
        
        sparse_retriever.k = sparse_k

        # Hybrid retriever
        self.retriever = EnsembleRetriever(
            retrievers=[dense_retriever, sparse_retriever],
            weights=weights,
        )

    def get_retriever(self):
        """Return the retriever instance"""
        return self.retriever
