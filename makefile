up::
	./vendor/bin/sail up -d

down::
	./vendor/bin/sail down

restart::
	$(MAKE) down && $(MAKE) up

shell::
	./vendor/bin/sail shell

build::
	./vendor/bin/sail build --no-cache $(s)

run-dev::
	./vendor/bin/sail npm run watch

restart-queue::
	./vendor/bin/sail exec transcode_php supervisorctl restart queue

start-queue::
	./vendor/bin/sail exec transcode_php supervisorctl start queue

stop-queue::
	./vendor/bin/sail exec transcode_php supervisorctl stop queue

wipe::
	docker-compose down && \
	docker volume rm php-transcode_sailmysql && \
	docker rmi sail-8.0/app:latest && \
	rm -rf vendor 
