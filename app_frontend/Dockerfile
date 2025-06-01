FROM node:18-slim

# ติดตั้ง dependencies ที่จำเป็นสำหรับ sharp
RUN apt-get update && apt-get install -y \
  libvips-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# คัดลอก package.json และ package-lock.json
COPY package.json package-lock.json ./

# ติดตั้ง dependencies
RUN npm ci

# คัดลอกโค้ดทั้งหมด
COPY . .

# รัน build
RUN npm run build

# เปิด port
EXPOSE $PORT

# รัน app
CMD ["npm", "run", "start"]