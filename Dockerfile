FROM node:alpine as builder

WORKDIR /app

COPY . .

RUN npm install ci
RUN npm run build

FROM node:alpine

workdir /app

copy --from=builder app/node_modules/ .
copy --from=builder app/dist/ .

EXPOSE 7890
CMD ["npm", "run", "start"]
