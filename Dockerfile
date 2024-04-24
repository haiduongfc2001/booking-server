# Stage 1: Build
FROM node:alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn 

COPY . .

# Stage 2: Development
FROM build as dev

EXPOSE 5000

CMD ["yarn", "dev"]


# **Stage 3: Production (node:slim)**
# FROM node:slim as final

# ENV NODE_ENV production

# USER node

# WORKDIR /app

# COPY package.json yarn.lock ./

# RUN yarn install --production --frozen-lockfile

# COPY --from=build /app/build ./build

# EXPOSE 5000

# CMD ["node", "build/index.js"]
