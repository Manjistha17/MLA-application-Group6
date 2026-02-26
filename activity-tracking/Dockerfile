FROM node:14

WORKDIR /app

COPY package*.json ./
# Skip Cypress download/unzip
ENV CYPRESS_INSTALL_BINARY=0
RUN npm install
COPY . .

EXPOSE 5300
CMD ["node", "server.js"]
