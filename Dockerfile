from keymetrics/pm2:latest-alpine

ADD . /code
WORKDIR /code
RUN npm install
CMD ["npm", "start"]
