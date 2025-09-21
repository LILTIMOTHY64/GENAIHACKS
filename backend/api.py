from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from data_preprocessing import preprocess
from vectorization import vectorize_documents
from retrieval_aug import create_retrieval_chain
import logging

# Initialize FastAPI app
app = FastAPI()

#CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Pydantic model for request
class Question(BaseModel):
    query: str

# Initialize components on startup
@app.on_event("startup")
async def startup_event():
    global retrieval_chain
    try:
        documents = preprocess()
        vectorstore = vectorize_documents(documents)
        retrieval_chain = create_retrieval_chain(vectorstore)
        logger.info("System initialized successfully")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        raise Exception("Failed to initialize the system")

@app.post("/chat")
async def chat_endpoint(question: Question):
    try:
        response = retrieval_chain.invoke({"query": question.query})
        
        # Extract relevant information
        result = {
            "response": response.get('result', 'No response generated'),
            "sources": []
        }
        
        # Add source documents if available
        if 'source_documents' in response:
            for doc in response['source_documents']:
                source = {
                    "content": doc.page_content if hasattr(doc, 'page_content') else None,
                    "metadata": doc.metadata if hasattr(doc, 'metadata') else None
                }
                result["sources"].append(source)
        
        return result
    
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing your question")
