FROM python:3.13-slim

WORKDIR /app

COPY . /app

EXPOSE 8080

ENV PORT=8080
ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/api/stats', timeout=3)" || exit 1

CMD ["python3", "server.py"]
