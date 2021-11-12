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

restart-websocket::
	./vendor/bin/sail exec transcode_php supervisorctl restart websockets

start-websocket::
	./vendor/bin/sail exec transcode_php supervisorctl start websockets

stop-websocket::
	./vendor/bin/sail exec transcode_php supervisorctl stop websockets

db-renew::
	$(MAKE) stop-queue; \
	rm database/database.sqlite; \
	touch database/database.sqlite; \
	./vendor/bin/sail artisan migrate; \
	$(MAKE) start-queue;

wipe::
	docker-compose down; \
	docker rmi sail-8.0/app:latest; \
	rm -rf vendor; \
	rm database/database.sqlite; \
	sed -e 's/APP_KEY=.*/APP_KEY=/g' -i ./.env
