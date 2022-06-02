FROM python:3.8

COPY requirements.txt /tmp
COPY . /app

RUN pip install -r /tmp/requirements.txt
RUN pip install --upgrade Sanic-Auth

WORKDIR /app

EXPOSE 8080

CMD ["python", "interface.py"]