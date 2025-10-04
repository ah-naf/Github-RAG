from langchain_community.vectorstores import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from langchain_huggingface import HuggingFaceEmbeddings
import os
import pickle
import logging
from langsmith import traceable

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

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

        logging.info("Initializing HybridRetriever...")
        logging.info(f"Embedding model: {embedding_model}")

        # Create embeddings + Chroma
        logging.info("🔄 Loading HuggingFace embeddings...")
        embeddings = HuggingFaceEmbeddings(model_name=embedding_model)

        if os.path.exists(persist_directory) and len(os.listdir(persist_directory)) > 0:
            logging.info(f"Found existing Chroma DB at {persist_directory}, loading...")
            vectorstore = Chroma(
                persist_directory=persist_directory,
                embedding_function=embeddings,
            )
        else:
            if docs is None:
                raise ValueError("No persisted DB found, and no docs provided to build one.")
            
            logging.info("Building new Chroma DB from documents...")
            vectorstore = Chroma.from_documents(
                documents=docs,
                embedding=embeddings,
                persist_directory=persist_directory,
            )
            vectorstore.persist()
            logging.info("Chroma DB created and persisted.")

        # Dense retriever
        dense_retriever = vectorstore.as_retriever(search_kwargs={"k": dense_k})
        logging.info(f"Dense retriever ready (top {dense_k} results).")

        bm25_path = os.path.join(persist_directory, "bm25.pkl")
        
        if os.path.exists(bm25_path):
            logging.info(f"Found existing BM25 retriever at {bm25_path}, loading...")
            # Load BM25 retriever from pickle
            with open(bm25_path, "rb") as f:
                sparse_retriever = pickle.load(f)
        else:
            if docs is None:
                raise ValueError("No docs provided to build BM25 index.")

            logging.info("Building new BM25 retriever from documents...")
            sparse_retriever = BM25Retriever.from_documents(docs)
            sparse_retriever.k = sparse_k
            # Persist BM25 retriever
            with open(bm25_path, "wb") as f:
                pickle.dump(sparse_retriever, f)
            logging.info("BM25 retriever created and persisted.")
        
        sparse_retriever.k = sparse_k
        logging.info(f"Sparse retriever ready (top {sparse_k} results).")

        # Hybrid retriever
        logging.info("Creating EnsembleRetriever (dense + sparse)...")
        self.retriever = EnsembleRetriever(
            retrievers=[dense_retriever, sparse_retriever],
            weights=weights,
        )
        logging.info(f"Hybrid retriever initialized (weights={weights})")

    @traceable
    def get_retriever(self):
        """Return the retriever instance"""
        return self.retriever
