git pull
DEPLOY_TIME=$(date) GIT_LAST_COMMIT_SHA=$(git rev-parse HEAD) docker-compose up -d --build