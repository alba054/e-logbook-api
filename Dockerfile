FROM node:alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm run migrate::dev "migration"

EXPOSE 7890
CMD ["npm", "run", "start"]
