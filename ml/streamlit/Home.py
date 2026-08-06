import os

import streamlit as st

from techiewithbeard_ai.loaders.pdf_loader import pdf_loader
from techiewithbeard_ai.chains.rag_chain import build_rag_chain
import tempfile

@st.cache_resource
def get_chain():
    return build_rag_chain()

chain = get_chain()

def ask(query: str) -> str:
    response = chain.invoke({
        "query": query
    })

    st.write(f"**Query:** {query}")
    st.write(f"**Answer:** {response['answer']}")
    return response['answer']


st.write("Streamlit is also great for more traditional ML use cases like computer vision or NLP. Here's an example of edge detection using OpenCV. 👁️") 

uploaded_file = st.file_uploader("Upload an image", type=["pdf"])


if uploaded_file is not None:
    st.success(f"Selected: {uploaded_file.name}")

    st.write(uploaded_file)
    st.write("File uploaded successfully. Now you can ask questions about the content of the PDF.")
    upload_button = st.button("upload the file", args=("What is the name of the candidate?",uploaded_file))
    if upload_button:
          with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as tmp:

            tmp.write(uploaded_file.getbuffer())
            temp_pdf_path = tmp.name
            try:
                result = pdf_loader(temp_pdf_path)

                if result.status == "already_exists":
                    st.info(result.message)
                else:
                    st.success(result.message)
            finally:
                tmp.close()
                os.remove(temp_pdf_path)
                # st.success("PDF file uploaded and processed successfully.")
                # ask("What is the name of the candidate?")
    # ask("What is the name of the candidate?",)
else:
    st.write("Please upload a PDF file to start asking questions about its content.")   


prompt = st.chat_input("Ask a question about your document")
if prompt:
    response = chain.invoke({
        "query": prompt
    })

    st.write(response["answer"])