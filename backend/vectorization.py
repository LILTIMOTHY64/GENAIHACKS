from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
import logging

logger = logging.getLogger(__name__)

def vectorize_documents(documents):
    """Create and populate vector store with documents"""
    try:
        logger.info("Initializing embeddings model...")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        
        logger.info("Creating document objects...")
        docs = [
            Document(
                page_content=doc['data'],
                metadata=doc['metadata']
            ) for doc in documents
        ]
        
        logger.info("Creating vector store...")
        vectorstore = Chroma.from_documents(
            documents=docs,
            embedding=embeddings,
            persist_directory="data/chroma_db"
        )
        return vectorstore
        
    except Exception as e:
        logger.error(f"Error in vectorization: {str(e)}")
        raise