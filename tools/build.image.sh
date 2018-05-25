set -e
IMAGE=$DOCKER_IMAGE
COMMIT=$(git rev-parse HEAD)
TIME=$(date -u +"%FT%TZ")

GROUP='orangemi'
APP_NAME='node-git'
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[", ]//g')
DOCKER_REGISTRY='docker.io'
export COMMIT_IMAGE="${DOCKER_REGISTRY}/${GROUP}/${APP_NAME}:${COMMIT}"
export COMMIT_IMAGE="${DOCKER_REGISTRY}/${GROUP}/${APP_NAME}:${COMMIT}"

if [ -z $DOCKER_IMAGE ]; then
  IMAGE="${DOCKER_REGISTRY}/${GROUP}/${APP_NAME}:${PACKAGE_VERSION}"
fi

export IMAGE=$IMAGE

## pre-docker
rm -rf build && mkdir -p build
npm run build
cat package.json | sed 's/^  "version":.*$/  "version": "1.0.0",/' > build/package.json
cat package-lock.json | sed 's/^  "version":.*$/  "version": "1.0.0",/' > build/package-lock.json
echo "{\"TIME\":\"${TIME}\", \"COMMIT\":\"${COMMIT}\"}" > version.json
docker build -t ${COMMIT_IMAGE} .
docker tag ${COMMIT_IMAGE} ${IMAGE}
rm -rf build
rm -rf version.json
echo "DONE."
echo "PUSH IMAGE IF YOU WANT:"
echo "docker push ${IMAGE}"
echo "docker push ${COMMIT_IMAGE}"
