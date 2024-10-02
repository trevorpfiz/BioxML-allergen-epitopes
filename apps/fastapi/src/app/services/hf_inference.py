import asyncio

from huggingface_hub import InferenceClient

from app.core.config import settings

client = InferenceClient(
    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
    token=settings.HUGGINGFACE_ACCESS_TOKEN,
)


async def run_text_classification(text: str):
    # Get the event loop to run tasks
    loop = asyncio.get_event_loop()

    # Make a single inference call using run_in_executor to prevent blocking
    result = await loop.run_in_executor(None, client.text_classification, text)

    return result
