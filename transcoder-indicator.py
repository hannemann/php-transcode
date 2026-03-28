#!/usr/bin/env python3
import sys
import json
import signal
import pysher
import logging
from gi import require_version

require_version('Gtk', '3.0')
require_version('AyatanaAppIndicator3', '0.1')

from gi.repository import AyatanaAppIndicator3 as appindicator
from gi.repository import Gtk, GLib

# --- DEBUG LOGGING ---
# Das hier zeigt uns interne Pysher-Vorgänge
root = logging.getLogger()
root.setLevel(logging.INFO)
ch = logging.StreamHandler(sys.stdout)
root.addHandler(ch)

# --- CONFIG AUS DEINER REVERB PHP ---
APP_KEY = "1"  # Laut deiner Config 'key' => env(..., 1)
HOST = "127.0.0.1"
PORT = 8079
CHANNEL_NAME = "FFMpegProgress"
# Wichtig: Laravel broadcastet den Event-Namen meist inkl. Namespace
EVENT_NAME = "App\\Events\\FFMpegProgress" 

class TranscoderMonitor:
    def __init__(self):
        self.indicator = appindicator.Indicator.new(
            "transcoder-monitor",
            "media-optical",
            appindicator.IndicatorCategory.APPLICATION_STATUS
        )
        self.indicator.set_status(appindicator.IndicatorStatus.ACTIVE)
        self.indicator.set_label(" ⏳ Connecting...", "")
        
        self.setup_menu()
        self.connect_ws()

    def setup_menu(self):
        menu = Gtk.Menu()
        item = Gtk.MenuItem(label="Quit")
        item.connect("activate", Gtk.main_quit)
        menu.append(item)
        menu.show_all()
        self.indicator.set_menu(menu)

    def connect_ws(self):
        # Reverb verhält sich wie ein Pusher-Server
        self.pusher = pysher.Pusher(
            key=APP_KEY,
            custom_host=HOST,
            port=PORT,
            secure=False
        )

        # Verbindungsevents loggen
        self.pusher.connection.bind('pusher:connection_established', self.on_connected)
        self.pusher.connection.bind('pusher:connection_error', self.on_error)
        
        print(f"[*] Versuche Verbindung zu {HOST}:{PORT} mit Key '{APP_KEY}'...")
        self.pusher.connect()

    def on_connected(self, data):
        print("[OK] Verbindung zum Reverb-Server steht!")
        GLib.idle_add(self.indicator.set_label, " 🟢 Online", "")
        
        # Channel abonnieren
        self.channel = self.pusher.subscribe(CHANNEL_NAME)
        print(f"[*] Channel '{CHANNEL_NAME}' abonniert.")
        
        # Event binden
        self.channel.bind(EVENT_NAME, self.on_event)
        print(f"[*] Lausche auf Event: {EVENT_NAME}")

    def on_error(self, data):
        print(f"[ERROR] Websocket Fehler: {data}")
        GLib.idle_add(self.indicator.set_label, " 🔴 WS Error", "")

    def on_event(self, payload):
        print(f"\n[EVENT GEFEUERT] Rohdaten: {payload}")
        try:
            data = json.loads(payload)
            # Da dein Event 'public $queue' hat, liegt es direkt im JSON
            queue = data.get('queue', [])
            GLib.idle_add(self.process_queue, queue)
        except Exception as e:
            print(f" Fehler beim Parsen: {e}")

    def process_queue(self, queue):
        running = [q for q in queue if q.get('state') == 'running']
        if running:
            item = running[0]
            p = item.get('percentage', 0)
            self.indicator.set_label(f" ⚙️ {p}%", "")
        else:
            self.indicator.set_label(" 🟢 Idle", "")

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    monitor = TranscoderMonitor()
    Gtk.main()