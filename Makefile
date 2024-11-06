all:
	docker-compose up --build
clean:
	docker-compose down -v
	docker rmi -f $(shell docker images -q)

re: clean all