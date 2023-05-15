FROM node:16-alpine

WORKDIR /app
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Install dependencies and cache them
COPY package*.json ./
COPY *.lock ./
RUN yarn install --network-timeout 1000000000 --verbose

CMD ["yarn", "start"]
# ENTRYPOINT ["tail", "-f", "/dev/null"]