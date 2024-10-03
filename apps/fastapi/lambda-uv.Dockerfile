# syntax=docker/dockerfile:1

# Use an AWS base image for Python
FROM public.ecr.aws/lambda/python:3.12

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy from the cache instead of linking since it's a mounted volume
ENV UV_LINK_MODE=copy

# Configure a constant location for the uv cache
ENV UV_CACHE_DIR=/tmp/.uv_cache

# Install python packages from lock file
COPY pyproject.toml uv.lock ${LAMBDA_TASK_ROOT}
RUN uv sync --frozen

# Copy the source code to the task root default=/var/task
COPY src/app/ ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "main.handler" ]
