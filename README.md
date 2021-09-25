## Installation on Ubuntu 20.04
* PHP 8.0
* FFMpeg
* Nginx
## Systemd
### Laravel Websockets
```
[Unit]
Description=Runs and keeps alive the PHP Transcode artisan websocket

[Service]
Restart=always
WorkingDirectory=/var/www/php-transcode
ExecStart=/usr/bin/php artisan websockets:serve
User=hannemann
Group=www-data

[Install]
WantedBy=default.target
```
### Laravel Queue worker
```
[Unit]
Description=Runs and keeps alive the PHP Transcoder artisan queue:work process

[Service]
Restart=always
WorkingDirectory=/var/www/php-transcode
ExecStart=/usr/bin/php artisan queue:work --queue=default,ffmpeg
User=hannemann
Group=www-data

[Install]
WantedBy=default.target
```

# Transcoding
## Troubleshooting
* If its the case that the Resolution changes in the Input than you should trim the Video first.
* In case of green artifacts transcode with lossless audio and best video quality possibel first, then transcode again


## TODO:
* Aspect Ratio (currently Transcode only)
* Scale
* Crop

## Fix