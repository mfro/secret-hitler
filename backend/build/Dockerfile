FROM node:23-alpine

RUN mkdir /app
WORKDIR /app

COPY ./main.js .

ENV NODE_ENV="production"

CMD ["node", "main.js", "8081"]
EXPOSE 8081
