FROM node:alpine as builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM node:alpine

workdir /app

copy --from=builder app/node_modules/ .
copy --from=builder app/dist/ .
copy --from=builder app/package.json .
copy --from=builder app/package-lock.json .

EXPOSE 7890
CMD ["npm", "run", "start"]
