FROM node:lts-alpine
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY package.json ./
COPY src ./src

EXPOSE 4000
CMD ["node", "src/index.js"]