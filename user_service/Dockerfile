FROM python:3.11

# ตั้ง Environment Variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


# ตั้ง Working Directory
WORKDIR /code

# ติดตั้ง Dependencies
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกโค้ดทั้งหมด
COPY . /code/

# รัน Migration และ Start Server (สำหรับ Django)
CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8888 user_service.wsgi:application"]