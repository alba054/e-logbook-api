FROM node:alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 7890
CMD ["npm", "run", "start"]
