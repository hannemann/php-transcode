#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import signal
import logging
import argparse
import pysher
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv
from gi import require_version

# Sicherstellen, dass GTK 3 und Ayatana genutzt werden
require_version('Gtk', '3.0')
require_version('AyatanaAppIndicator3', '0.1')

from gi.repository import AyatanaAppIndicator3 as appindicator
from gi.repository import Gtk, GLib

# --- KONFIGURATION LADEN ---
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def setup_logging(debug_enabled):
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

# CLI Argumente
parser = argparse.ArgumentParser(description="FFMpeg Transcoder AppIndicator")
parser.add_argument('--debug', action='store_true', help='Enable debug logging')
args = parser.parse_args()

# Umgebungsvariablen
REVERB_KEY = os.getenv('REVERB_APP_KEY', '1')
REVERB_HOST = os.getenv('REVERB_HOST', '127.0.0.1')
REVERB_PORT = int(os.getenv('REVERB_PORT', 8079))
REVERB_SCHEME = os.getenv('REVERB_SCHEME', 'http')

# API Konfiguration
API_PORT = 8078
API_BASE_URL = f"{REVERB_SCHEME}://{REVERB_HOST}:{API_PORT}"

env_debug = os.getenv('DEBUG_MODE', 'false').lower() == 'true'
DEBUG_ACTIVE = args.debug or env_debug

setup_logging(DEBUG_ACTIVE)

class TranscoderMonitor:
    def __init__(self):
        self.indicator = appindicator.Indicator.new(
            "laravel-transcoder-monitor",
            "media-playback-pause-symbolic",
            appindicator.IndicatorCategory.APPLICATION_STATUS
        )
        self.indicator.set_status(appindicator.IndicatorStatus.ACTIVE)
        self.indicator.set_label(" ⏳", "")
        
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
        GLib.idle_add(self.indicator.set_label, " 🟢", "")
        channel = self.pusher.subscribe("FFMpegProgress")
        channel.bind("App\\Events\\FFMpegProgress", self.on_event)
        self.trigger_initial_sync()

    def on_error(self, data):
        logging.error(f"WebSocket connection error: {data}")
        GLib.idle_add(self.indicator.set_label, " 🔴", "")

    def trigger_initial_sync(self):
        url = f"{API_BASE_URL}/progress"
        try:
            req = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(req, timeout=5) as response:
                pass
        except Exception as e:
            logging.error(f"Initial sync failed: {e}")

    def confirm_action(self, message):
        """ Zeigt einen Bestätigungsdialog an """
        dialog = Gtk.MessageDialog(
            transient_for=None,
            flags=0,
            message_type=Gtk.MessageType.QUESTION,
            buttons=Gtk.ButtonsType.YES_NO,
            text="Bist du sicher?"
        )
        dialog.format_secondary_text(message)
        response = dialog.run()
        dialog.destroy()
        return response == Gtk.ResponseType.YES

    def handle_item_click(self, widget, item):
        state = item.get('state')
        item_id = item.get('id')
        name = item.get('path', 'Datei')
        data = b"{}" 
        
        if state == 'running':
            if not self.confirm_action(f"Soll der aktuelle Job wirklich gekillt werden?\n\n{name}"):
                return
            url = f"{API_BASE_URL}/kill"
            method = 'POST'
        elif state == 'pending':
            if not self.confirm_action(f"Soll dieser Job aus der Warteschlange entfernt werden?\n\n{name}"):
                return
            url = f"{API_BASE_URL}/queue/cancel/{item_id}"
            method = 'POST'
        else:
            # Done/Failed braucht keine Bestätigung
            url = f"{API_BASE_URL}/progress/{item_id}"
            method = 'DELETE'
            data = None

        logging.info(f"Action: {method} {url}")
        
        try:
            req = urllib.request.Request(url, data=data, method=method)
            req.add_header('Accept', 'application/json')
            req.add_header('X-Requested-With', 'XMLHttpRequest')
            with urllib.request.urlopen(req, timeout=5) as response:
                logging.info(f"API Response: {response.getcode()}")
        except Exception as e:
            logging.error(f"Request failed: {e}")

    def on_event(self, payload):
        try:
            data = json.loads(payload)
            queue = data.get('queue', [])
            GLib.idle_add(self.update_ui, queue)
        except Exception as e:
            logging.error(f"Event parsing error: {e}")

    def update_ui(self, queue):
        for child in self.menu.get_children():
            self.menu.remove(child)

        running = [q for q in queue if q.get('state') == 'running']
        pending = [q for q in queue if q.get('state') == 'pending']
        failed  = [q for q in queue if q.get('state') == 'failed']
        done    = [q for q in queue if q.get('state') == 'done']

        def add_section(title, items, icon, is_running=False):
            if not items: return
            
            header = Gtk.MenuItem(label=f"--- {title} ---")
            header.set_sensitive(False)
            self.menu.append(header)
            
            for item in items:
                name = item.get('path', 'Unknown')
                pct = item.get('percentage', 0)
                
                if is_running:
                    label_text = f"{icon} {name} ({pct}%)"
                elif title == "Failed":
                    label_text = f"{icon} {name} (Error!)"
                else:
                    label_text = f"{icon} {name}"

                m_item = Gtk.MenuItem(label=label_text)
                m_item.connect("activate", self.handle_item_click, item)
                self.menu.append(m_item)
            
            self.menu.append(Gtk.SeparatorMenuItem())

        add_section("Pending", pending, "🗑")
        add_section("Current", running, "💀", is_running=True)
        add_section("Failed", failed, "✕")
        add_section("Done", done, "✓")

        item_quit = Gtk.MenuItem(label="Quit")
        item_quit.connect("activate", Gtk.main_quit)
        self.menu.append(item_quit)
        
        self.menu.show_all()

        if running:
            current_pct = running[0].get('percentage', 0)
            self.indicator.set_label(f" {current_pct}%", "")
            self.indicator.set_icon_full("media-playback-start-symbolic", "Transcoding")
        else:
            self.indicator.set_label(" 🟢", "")
            self.indicator.set_icon_full("media-playback-pause-symbolic", "Idle")

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    monitor = TranscoderMonitor()
    Gtk.main()