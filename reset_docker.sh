docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

docker system prune -f
docker rmi $(docker images -f "dangling=true" -q)
docker rmi $(docker images -a -q)
docker rm $(docker ps --filter=status=exited --filter=status=created -q)
