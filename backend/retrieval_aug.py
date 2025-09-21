from langchain_ollama import ChatOllama
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from vectorization import vectorize_documents
from data_preprocessing import preprocess

def create_retrieval_chain(vectorstore):
    llm = ChatOllama(model="final:latest")

    template = """You are a mental health professional - a psychologist. Use the following context to provide appropriate, helpful and empathetic responses to the user:
    
    Context: {context}
    Question: {question}
    Answer:"""

    prompt = PromptTemplate(
        template=template,
        input_variables=["context", "question"]
    )

    retrieval_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(
            search_type="similarity", 
            search_kwargs={"k": 3}
        ),
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True  # Enable source document return
    )

    return retrieval_chain

print(create_retrieval_chain(vectorize_documents(preprocess())))