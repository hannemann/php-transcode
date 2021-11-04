# PHP Transcode (doc incomplete)
## Create frame perfect cuts out of your DVB Recordings
Cutting DVB recordings with FFMPEG can be a hazzle since you have to take several things in mind.
* If the movie is 4:3 and the commercials are 16:9 the encode fails as soon as the resolution changes
* The same applies to changes in audio streams

To circumvent these flaws in the video stream one would have to create several complicated FFMpeg commands.
This program tries to mitigate that by providing a browser based gui for FFMpeg.
The heavy lifting can be done on the server utilizing hardware acceleration by VAAPI (Tested with INTEL and AMD integrated GPU).

## Installation using docker
Since the project is based on the PHP framework laravel you can simply utilize laravel sail
* git clone
* cp .env.example .env # adjust settings
* ./run
In case of `connection reset by peer` errors while pulling docker images just start again
## Installation on Ubuntu 20.04
* PHP 8.0, php-sqlite3
* FFMpeg
* Nginx
* git clone
* cp .env.example .env # adjust settings
* touch storage/database.sqlite
* chmod www-data database.sqlite
* add DB_DATABASE=/path/to/database.sqlite to .env

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
ExecStart=/usr/bin/php artisan websockets:serve --port=8079
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
# Clipper
Search your recording frame by frame for unwanted material
## Usage:
* coarse search using mouse or keyboard:
  * Click on Thumbnail bar
  * skip one minute forward: Arrow up
  * skip one minute backward: Arrow Down
  * skip five minutes forward: Shift + Arrow up
  * skip five minutes backward: Shift + Arrow Down
  * skip ten minutes forward: CTRL + Arrow up
  * skip ten minutes backward: CTRL + Arrow Down
* fine search using keyboard:
  * next frame: Arrow right
  * previous frame: Arrow left
  * 2 seconds forward: Shift + Arrow right
  * 2 seconds backward: Shift + Arrow left
  * 5 seconds forward: Shift + Arrow right
  * 5 seconds forward: Shift + Arrow left
* Set marker: +
* remove marker: -
* Move Marker (only if indicator is on clip border):
  * Alt + Arrow left/right/up/down (works als with step modifiers)
* Skip to next clip (only if indicator is on clip border):
  * CTRL + Shift + Arrow left/right
# Transcoding
## Multiple files produced by VDR
1. Concat
2. Optionally scale to desired width
3. If not scaled remux to mkv or mp4
4. Use Clipper to mark parts to be keeped
5. Transcode

## Single file
Like multiple files but skip step 1
## Troubleshooting
* The user of the php process has to have rw access to the render device
* If its the case that the Resolution changes in the Input than you should trim the Video first.
* In case of green artifacts transcode with lossless audio and best video quality possible first, then transcode again
### Message:
Scale or transcode aborts with error like:
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
* trim of pre- and post recording padding, scale to display aspect ratio if movie is 4:3 and commercials 16:9
  * Concat
  * Scale to desired aspect ratio
  * Use Clipper to find parts to be skipped
  * Perform final transcode

#### Possible cause:
* Corrupt frames

#### Mitigate:
* Scale 


## TODO:
* Inotify

## Fix
