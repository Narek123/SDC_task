FROM node:14
WORKDIR /usr/src/app

COPY . ./

RUN npm install -s && \
    npm install -g @nestjs/cli && \
    npm run build && \
    npm cache clean --force

CMD [ "node", "dist/main.js" ]
