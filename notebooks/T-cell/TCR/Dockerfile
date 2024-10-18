# Use a slimmer Python base image
FROM python:3.10-slim

# Switch to root to perform privileged operations
USER root

# Set environment variables for SageMaker
ENV PYTHONUNBUFFERED=TRUE
ENV PYTHONDONTWRITEBYTECODE=TRUE

# Install necessary Python packages separately to keep layers smaller and cache effective
RUN pip install --no-cache-dir numpy
RUN pip install --no-cache-dir pandas
RUN pip install --no-cache-dir esm
RUN pip install --no-cache-dir scikit-learn
RUN pip install --no-cache-dir fastapi
RUN pip install --no-cache-dir uvicorn

# Copy inference script and model to the container
COPY tcr_model/inference.py /opt/ml/code/inference.py
COPY tcr_model/model_with_embeddings.pkl /opt/ml/model/model_with_embeddings.pkl

# Verify that the files were copied correctly
RUN ls -l /opt/ml/code/inference.py
RUN ls -l /opt/ml/model/model_with_embeddings.pkl

# Create necessary directories for SageMaker conventions
RUN mkdir -p /opt/ml/output

# Set the working directory
WORKDIR /opt/ml/code

# Specify the entry point using uvicorn to run the FastAPI app
ENTRYPOINT ["uvicorn", "inference:app", "--host", "0.0.0.0", "--port", "8080"]

# Expose the port for local testing
EXPOSE 8080
