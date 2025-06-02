FROM python:3.11
WORKDIR /code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8888
CMD ["gunicorn", "--bind", "0.0.0.0:8888", "rebulitsb.wsgi:application"]