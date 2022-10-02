FROM node:14-alpine as BUILD
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:14-alpine as PROD 
WORKDIR /app
COPY --from=BUILD /app/package*.json ./
COPY --from=BUILD app/dist ./dist
RUN npm run install:prod
ENTRYPOINT ["node", "/app/dist/index.js"]
EXPOSE 3000
CMD ["npm", "start"]
