FROM python:3.13.2-bookworm

WORKDIR /app

COPY ./backend/requirements.txt .
RUN pip install -r requirements.txt

COPY ./shared /app/shared
RUN pip install -e /app/shared

COPY ./backend/app .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
