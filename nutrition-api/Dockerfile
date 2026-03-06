FROM node:18

WORKDIR /app

COPY package*.json ./
# Skip Cypress download/unzip
ENV CYPRESS_INSTALL_BINARY=0
RUN npm install
RUN npm install

COPY . .

CMD ["node", "server.js"]

