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
User=www-data
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
User=www-data
Group=www-data

[Install]
WantedBy=default.target
```

# Transcoding
## Troubleshooting
* The user of the php process has to have rw access to the render device
* If its the case that the Resolution changes in the Input than you should trim the Video first.
* In case of green artifacts transcode with lossless audio and best video quality possible first, then transcode again
### Message:
```
Impossible to convert between the formats supported by the filter 'Parsed_scale_vaapi_0' and the filter 'auto_scaler_0'
Error reinitializing filters!
Failed to inject frame into filter network: Function not implemented
Error while processing the decoded data for stream #0:0
```
#### Possible cause:
* Main movie with aspect ratio of 16:9 is surrounded by 4:3 frames
* Vice versa (Letterboxed)
#### Mitigate
* Trim of unwanted material
* In general: trim of pre- and post recording padding, scale to display aspect ratio if movie is 4:3 and commercials 16:9
  * Concat
  * Remux to mkv or mp4
  * Use Clipper to find start and end timestamps
  * Perform a transcode with codec copy of all wanted streams to trim padding
  * Scale to desired aspect ratio
  * Use Clipper to find parts to be skipped
  * Perform final transcode


## TODO:
* Test files for codec mismatch before concat

## Fix