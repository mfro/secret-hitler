yarn build
docker build -t "$MFRO_DEPLOY_REGISTRY/secret-hitler" build/
docker push "$MFRO_DEPLOY_REGISTRY/secret-hitler"

ssh "$MFRO_DEPLOY_HOST" "cd server; sudo docker compose pull; sudo docker compose up -d"
