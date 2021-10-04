# PHP Transcode (doc incomplete)
## Create frame perfect cuts out of your DVB Recordings
Cutting DVB recordings with FFMPEG can be a hazzle since you have to take several things in mind.
* If the movie is 4:3 and the commercials are 16:9 the encode fails as soon as the resolution changes
* The same applies to changes in audio streams

To circumvent these flaws in the video stream one would have to create several complicated FFMpeg commands.
This program tries to mitigate that by providing a browser based gui for FFMpeg.
The heavy lifting can be done on the server utilizing hardware acceleration by VAAPI (Tested with INTEL and AMD integrated GPU).

## Installation on Ubuntu 20.04
* PHP 8.0
* FFMpeg
* Nginx
## Installation using docker
Since the project is based on the PHP framework laravel you can simply utilize laravel sail
* git clone
* sail up -d

## Configuration
Please have a look into .env.example
## Systemd (non docker installation)
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
* In case of green artifacts transcode with lossless audio and best video quality possible first, then transcode again


## TODO:
* Aspect Ratio (currently Transcode only)
* Scale
* Crop

## Fix