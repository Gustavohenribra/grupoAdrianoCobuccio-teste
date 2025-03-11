FROM node:20-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci

RUN npm i -g @nestjs/cli

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
