VENV = .venv-indicator
PYTHON = $(VENV)/bin/python3
PIP = $(VENV)/bin/pip
ENV_FILE = .env

.PHONY: help ide-helper fix

check-indicator-deps:
	@if [ ! -d "$(VENV)" ]; then \
		if [ -f "$(ENV_FILE)" ]; then \
			AUTO_OK=$$(grep "^AUTO_INSTALL_INDICATOR=" $(ENV_FILE) | cut -d '=' -f2 | tr -d ' \r'); \
			if [ "$$AUTO_OK" = "true" ]; then \
				$(MAKE) install; \
			else \
				echo "Error: $(VENV) not found and AUTO_INSTALL_INDICATOR is not set to true."; \
				exit 1; \
			fi; \
		else \
			echo "Error: $(ENV_FILE) not found."; \
			exit 1; \
		fi; \
	fi

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install-indicator::
	@echo "--- Detecting System: $(OS_ID) ---"
ifeq ($(OS_ID), opensuse-tumbleweed)
	@echo "--- Python Version detected: $(PY_VER_SHORT) ---"
	sudo zypper install -y python$(PY_VER_SHORT)-gobject \
		python$(PY_VER_SHORT)-gobject-Gdk \
		libayatana-appindicator3-1 \
		typelib-1_0-AyatanaAppIndicator3-0_1 \
		typelib-1_0-Gtk-3_0
else ifeq ($(OS_ID), ubuntu)
	sudo apt update && sudo apt install -y python3-gi python3-gi-cairo \
		gir1.2-ayatanaappindicator3-0.1
else
	@echo "Warning: Unknown system $(OS_ID). Please install system packages manually."
endif

	@echo "--- Creating venv with system site packages ---"
	$(PYTHON_BIN) -m venv --system-site-packages $(VENV)
	
	@echo "--- Installing Python dependencies ---"
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@echo "--- Setup complete ---"

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
	./vendor/bin/sail npm run development

build-assets::
	rm -f ./public/hot
	./vendor/bin/sail npm run build

run-dev-watch::
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

ide-helper:: ## Create laravel ide helper files
	./vendor/bin/sail artisan ide-helper:generate
	./vendor/bin/sail artisan ide-helper:models -N
	./vendor/bin/sail artisan ide-helper:meta

run: check-deps
	@echo "--- Starting Transcoder Indicator ---"
	@$(PYTHON_ENV) transcoder_indicator.py

clean:
	@echo "--- Cleaning up ---"
	rm -rf $(VENV)
	find . -type d -name "__pycache__" -exec rm -rf {} +