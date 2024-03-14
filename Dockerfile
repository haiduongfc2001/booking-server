# Sử dụng hình ảnh node:latest làm hình ảnh cơ sở
FROM node:latest

# Đặt thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép tệp package.json và yarn.lock vào thư mục làm việc
COPY package.json yarn.lock ./

# Cài đặt dependencies sử dụng yarn
RUN yarn install

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Biên dịch mã nguồn TypeScript
RUN yarn build

# Expose port 5000
EXPOSE 5000

# Chạy ứng dụng khi container được khởi động
CMD ["node", "build/index.js"]
