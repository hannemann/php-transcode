up::
	./vendor/bin/sail up -d

down::
	./vendor/bin/sail down

restart::
	$(MAKE) down && $(MAKE) up

shell::
	./vendor/bin/sail shell

root-shell::
	./vendor/bin/sail root-shell

build::
	./vendor/bin/sail build --no-cache $(s)

run-dev::
	./vendor/bin/sail npm run watch

ps:
	./vendor/bin/sail exec php-transcode ps -aux

restart-queue::
	./vendor/bin/sail exec php-transcode supervisorctl restart queue

start-queue::
	./vendor/bin/sail exec php-transcode supervisorctl start queue

stop-queue::
	./vendor/bin/sail exec php-transcode supervisorctl stop queue

restart-player-queue::
	./vendor/bin/sail exec php-transcode supervisorctl restart queue

start-player-queue::
	./vendor/bin/sail exec php-transcode supervisorctl start queue

stop-player-queue::
	./vendor/bin/sail exec php-transcode supervisorctl stop queue

restart-websocket::
	./vendor/bin/sail exec php-transcode supervisorctl restart websockets

start-websocket::
	./vendor/bin/sail exec php-transcode supervisorctl start websockets

stop-websocket::
	./vendor/bin/sail exec php-transcode supervisorctl stop websockets

db-renew::
	$(MAKE) stop-queue; \
	rm database/database.sqlite; \
	touch database/database.sqlite; \
	./vendor/bin/sail artisan migrate; \
	$(MAKE) start-queue;

wipe::
	docker-compose down; \
	docker rmi php-transcode/sail:8.3; \
	rm -rf vendor; \
	rm database/database.sqlite; \
	sed -e 's/APP_KEY=.*/APP_KEY=/g' -i ./.env
