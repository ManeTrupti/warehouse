FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIPENV_VENV_IN_PROJECT=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# install pipenv
RUN pip install --upgrade pip pipenv

# copy dependency files
COPY Pipfile Pipfile.lock /app/

# install dependencies
RUN pipenv install --deploy --system

# copy project
COPY . .

COPY deployment/prod/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "core.asgi:application", "--host", "0.0.0.0", "--port", "8000"]