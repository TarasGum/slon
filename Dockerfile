FROM node:21.6.1-slim

WORKDIR /app/frontend

ENV PATH /app/node_modules/.bin:$PATH

COPY . .

RUN npm install

RUN npm run build

ENV NODE_ENV development

EXPOSE 3000

CMD ["npm", "run", "dev"]