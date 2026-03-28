#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import signal
import logging
import argparse
import pysher
import urllib.request
from pathlib import Path
from dotenv import load_dotenv
from gi import require_version

# Ensure GTK 3 and Ayatana are used
require_version('Gtk', '3.0')
require_version('AyatanaAppIndicator3', '0.1')

from gi.repository import AyatanaAppIndicator3 as appindicator
from gi.repository import Gtk, GLib

# --- CONFIGURATION LOADING ---
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def setup_logging(debug_enabled):
    """ Strictly configure logging for minimal terminal noise. """
    log_level = logging.DEBUG if debug_enabled else logging.INFO
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    logging.basicConfig(
        level=log_level,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[logging.StreamHandler()]
    )
    
    noisy_loggers = ['pysher', 'websocket', 'urllib3', 'asyncio']
    for logger_name in noisy_loggers:
        logger = logging.getLogger(logger_name)
        if not debug_enabled:
            logger.setLevel(logging.WARNING)
            logger.propagate = False

# Parse CLI Arguments
parser = argparse.ArgumentParser(description="FFMpeg Transcoder AppIndicator")
parser.add_argument('--debug', action='store_true', help='Enable debug logging')
args = parser.parse_args()

# Load Environment Variables
REVERB_KEY = os.getenv('REVERB_APP_KEY', '1')
REVERB_HOST = os.getenv('REVERB_HOST', '127.0.0.1')
REVERB_PORT = int(os.getenv('REVERB_PORT', 8079))
REVERB_SCHEME = os.getenv('REVERB_SCHEME', 'http')

# API Config
API_PORT = 8078
API_BASE_URL = f"{REVERB_SCHEME}://{REVERB_HOST}:{API_PORT}"

env_debug = os.getenv('DEBUG_MODE', 'false').lower() == 'true'
DEBUG_ACTIVE = args.debug or env_debug

setup_logging(DEBUG_ACTIVE)

class TranscoderMonitor:
    def __init__(self):
        self.indicator = appindicator.Indicator.new(
            "laravel-transcoder-monitor",
            "media-optical",
            appindicator.IndicatorCategory.APPLICATION_STATUS
        )
        self.indicator.set_status(appindicator.IndicatorStatus.ACTIVE)
        self.indicator.set_label(" ⏳ Connecting...", "")
        
        self.menu = Gtk.Menu()
        self.indicator.set_menu(self.menu)
        
        self.connect_ws()

    def connect_ws(self):
        logging.info(f"Connecting to Reverb at {REVERB_HOST}:{REVERB_PORT}")
        try:
            self.pusher = pysher.Pusher(
                key=REVERB_KEY,
                custom_host=REVERB_HOST,
                port=REVERB_PORT,
                secure=(REVERB_SCHEME == 'https')
            )
            self.pusher.connection.bind('pusher:connection_established', self.on_connected)
            self.pusher.connection.bind('pusher:connection_error', self.on_error)
            self.pusher.connect()
        except Exception as e:
            logging.error(f"Failed to initialize WebSocket: {e}")

    def on_connected(self, data):
        logging.info("WebSocket connection successful.")
        GLib.idle_add(self.indicator.set_label, " 🟢 Online", "")
        
        # Subscribe to channel
        channel = self.pusher.subscribe("FFMpegProgress")
        channel.bind("App\\Events\\FFMpegProgress", self.on_event)

        # Trigger initial progress push from backend
        self.trigger_initial_sync()

    def trigger_initial_sync(self):
        """ Fires a GET request to /progress to trigger an initial WS broadcast. """
        url = f"{API_BASE_URL}/progress"
        logging.info(f"Triggering initial sync: GET {url}")
        try:
            # We don't need the response body, just the trigger
            req = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(req, timeout=5) as response:
                logging.debug(f"Initial sync trigger status: {response.getcode()}")
        except Exception as e:
            logging.error(f"Failed to trigger initial sync: {e}")

    def on_error(self, data):
        logging.error(f"WebSocket connection error: {data}")
        GLib.idle_add(self.indicator.set_label, " 🔴 Offline", "")

    def on_event(self, payload):
        try:
            data = json.loads(payload)
            queue = data.get('queue', [])
            GLib.idle_add(self.update_ui, queue)
        except Exception as e:
            logging.error(f"Event parsing error: {e}")

    def handle_item_click(self, widget, item):
        state = item.get('state')
        item_id = item.get('id')
        
        if state == 'running':
            url = f"{API_BASE_URL}/kill"
            method = 'POST'
        else:
            url = f"{API_BASE_URL}/progress/{item_id}"
            method = 'DELETE'

        logging.info(f"Action: {method} {url} for item {item_id}")
        
        try:
            req = urllib.request.Request(url, method=method)
            req.add_header('Accept', 'application/json')
            req.add_header('X-Requested-With', 'XMLHttpRequest')
            with urllib.request.urlopen(req, timeout=5) as response:
                logging.info(f"API Response: {response.getcode()}")
        except Exception as e:
            logging.error(f"API Request failed: {e}")

    def update_ui(self, queue):
        for child in self.menu.get_children():
            self.menu.remove(child)

        running = [q for q in queue if q.get('state') == 'running']
        pending = [q for q in queue if q.get('state') == 'pending']
        failed  = [q for q in queue if q.get('state') == 'failed']
        done    = [q for q in queue if q.get('state') == 'done']

        def add_section(title, items, is_running=False):
            if not items: return
            
            header = Gtk.MenuItem(label=f" {title}")
            header.set_sensitive(False)
            self.menu.append(header)
            
            for item in items:
                name = item.get('path', 'Unknown Path')
                pct = item.get('percentage', 0)
                
                if is_running:
                    label_text = f"  {name}    {pct}%"
                elif title == "Failed":
                    label_text = f"  {name} (Failed at {pct}%)"
                else:
                    label_text = f"  {name}"

                m_item = Gtk.MenuItem(label=label_text)
                m_item.connect("activate", self.handle_item_click, item)
                self.menu.append(m_item)
            
            self.menu.append(Gtk.SeparatorMenuItem())

        add_section("Current", running, is_running=True)
        add_section("Failed", failed)
        add_section("Pending", pending)
        add_section("Done", done)

        item_quit = Gtk.MenuItem(label="Quit Monitor")
        item_quit.connect("activate", Gtk.main_quit)
        self.menu.append(item_quit)

        self.menu.show_all()

        if running:
            current_pct = running[0].get('percentage', 0)
            self.indicator.set_label(f" {current_pct}%", "")
            self.indicator.set_icon_full("media-playback-start", "Transcoding")
        else:
            self.indicator.set_label(" 🟢 Online", "")
            self.indicator.set_icon_full("media-optical", "Idle")

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    monitor = TranscoderMonitor()
    Gtk.main()