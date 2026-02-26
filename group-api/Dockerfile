# Use official Python slim image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the FastAPI code
COPY . .

# Expose FastAPI default port
EXPOSE 8005

# Run FastAPI app with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]
