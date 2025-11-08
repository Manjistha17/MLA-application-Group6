FROM python:3.9.7-slim

WORKDIR /app

# Example snippet from your Dockerfile
COPY seed_activity_mets_new.py /app/seed_activity_mets_new.py

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5050

CMD ["gunicorn", "-b", "0.0.0.0:5050", "app:app"]
