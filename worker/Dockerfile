FROM python:3.13.2-bookworm

RUN groupadd -g 1000 worker && \
    useradd -u 1000 -g worker -m worker

WORKDIR /app

COPY ./worker/requirements.txt .
RUN pip install -r requirements.txt

COPY ./shared /app/shared
RUN pip install -e /app/shared

COPY ./worker/app .

EXPOSE 8000

USER worker

CMD ["celery", "-A", "main:workers", "worker", "--loglevel=info"]