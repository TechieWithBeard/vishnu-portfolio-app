from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda


def build_echo_chain():
    """Build a no-API chain that proves LangChain wiring works locally."""
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You write concise AI demo titles for a frontend portfolio."),
            ("human", "Create one title for: {topic}"),
        ]
    )

    def local_model(prompt_value):
        messages = prompt_value.to_messages()
        topic = messages[-1].content.replace("Create one title for:", "").strip()
        return f"AI Demo: {topic}"

    return prompt | RunnableLambda(local_model) | StrOutputParser()


