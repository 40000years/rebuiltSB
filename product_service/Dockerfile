FROM python:3.11
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /code
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /code/
CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8888 product_service.wsgi:application"]